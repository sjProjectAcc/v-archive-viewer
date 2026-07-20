use reqwest::{Client, Url};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};
#[cfg(windows)]
use std::os::windows::process::CommandExt;
use std::{
    fs,
    path::{Path, PathBuf},
    process::Command,
    sync::Mutex,
};
use tauri::{AppHandle, Manager, State};

const API_BASE_URL: &str = "https://v-archive.net";
const ACCOUNT_CONFIG_FILE: &str = "account-path.json";
const UPDATE_MANIFEST_URL: &str =
    "https://sjprojectacc.github.io/v-archive-viewer/desktop-version.json";
const UPDATE_HOST: &str = "github.com";

#[cfg(windows)]
fn clear_webview_ui_cache_for_new_version() {
    let Some(version) = serde_json::from_str::<Value>(include_str!("../tauri.conf.json"))
        .ok()
        .and_then(|config| {
            config
                .get("version")
                .and_then(Value::as_str)
                .map(str::to_owned)
        })
    else {
        return;
    };
    let Some(roaming_data) = std::env::var_os("APPDATA") else {
        return;
    };
    let marker_dir = PathBuf::from(roaming_data).join("net.varchive.viewer");
    let marker_path = marker_dir.join("ui-cache-version.txt");
    if fs::read_to_string(&marker_path)
        .ok()
        .is_some_and(|stored| stored.trim() == version)
    {
        return;
    }

    let Some(local_data) = std::env::var_os("LOCALAPPDATA") else {
        return;
    };
    let webview_root = PathBuf::from(local_data)
        .join("net.varchive.viewer")
        .join("EBWebView");
    let cache_paths = [
        "Default\\Cache",
        "Default\\Code Cache",
        "Default\\GPUCache",
        "Default\\Service Worker",
        "GPUCache",
        "GPUPersistentCache",
        "GrShaderCache",
        "ShaderCache",
    ];
    let cleared = cache_paths.iter().all(|relative| {
        let path = webview_root.join(relative);
        !path.exists() || fs::remove_dir_all(path).is_ok()
    });
    if !cleared {
        return;
    }

    if fs::create_dir_all(&marker_dir).is_ok() {
        let _ = fs::write(marker_path, version);
    }
}

#[cfg(not(windows))]
fn clear_webview_ui_cache_for_new_version() {}

#[derive(Default)]
struct ApiSession {
    client: Mutex<Option<Client>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AccountFileInfo {
    path: String,
    file_name: String,
    user_no: String,
}

#[derive(Serialize, Deserialize)]
struct AccountPathConfig {
    path: String,
}

#[derive(Deserialize)]
struct UpdateManifest {
    version: String,
    url: String,
    sha256: String,
    size: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct UpdateInfo {
    current_version: String,
    latest_version: String,
    available: bool,
    size: u64,
}

fn response_error(context: &str, status: reqwest::StatusCode, body: &str) -> String {
    let summary: String = body.chars().take(300).collect();
    format!("{context}: HTTP {status} {summary}")
}

fn account_file_info(path: &Path, user_no: &str) -> AccountFileInfo {
    AccountFileInfo {
        path: path.display().to_string(),
        file_name: path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("account.txt")
            .to_string(),
        user_no: user_no.to_string(),
    }
}

fn account_config_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_config_dir()
        .map(|directory| directory.join(ACCOUNT_CONFIG_FILE))
        .map_err(|error| format!("앱 설정 경로 확인 실패: {error}"))
}

fn save_account_path(app: &AppHandle, path: &Path) -> Result<(), String> {
    let config_path = account_config_path(app)?;
    let parent = config_path
        .parent()
        .ok_or_else(|| "앱 설정 폴더 확인 실패".to_string())?;
    fs::create_dir_all(parent).map_err(|error| format!("앱 설정 폴더 생성 실패: {error}"))?;
    let config = AccountPathConfig {
        path: path.display().to_string(),
    };
    let body = serde_json::to_string_pretty(&config)
        .map_err(|error| format!("account.txt 경로 저장 실패: {error}"))?;
    fs::write(config_path, body).map_err(|error| format!("account.txt 경로 저장 실패: {error}"))
}

fn configured_account_path(app: &AppHandle) -> Result<PathBuf, String> {
    let config_path = account_config_path(app)?;
    if config_path.is_file() {
        let body = fs::read_to_string(&config_path)
            .map_err(|error| format!("account.txt 경로 설정 읽기 실패: {error}"))?;
        let config: AccountPathConfig = serde_json::from_str(&body)
            .map_err(|error| format!("account.txt 경로 설정 해석 실패: {error}"))?;
        let path = PathBuf::from(config.path);
        if path.is_file() {
            return Ok(path);
        }
        return Err(format!(
            "저장된 account.txt 파일을 찾을 수 없습니다: {}",
            path.display()
        ));
    }

    let executable =
        std::env::current_exe().map_err(|error| format!("실행 파일 위치 확인 실패: {error}"))?;
    let adjacent = executable
        .parent()
        .ok_or_else(|| "실행 파일 폴더 확인 실패".to_string())?
        .join("account.txt");
    if adjacent.is_file() {
        return Ok(adjacent);
    }
    Err("연결된 account.txt가 없습니다.".into())
}

fn read_account(path: &Path) -> Result<(String, String), String> {
    let body =
        fs::read_to_string(path).map_err(|error| format!("account.txt 읽기 실패: {error}"))?;
    let first_line = body
        .lines()
        .next()
        .ok_or_else(|| "account.txt의 첫 줄이 비어 있습니다.".to_string())?;
    let mut fields = first_line.split_whitespace();
    let user_no = fields
        .next()
        .ok_or_else(|| "account.txt에 회원 번호가 없습니다.".to_string())?;
    let token = fields
        .next()
        .ok_or_else(|| "account.txt에 로그인 토큰이 없습니다.".to_string())?;
    if !user_no.chars().all(|character| character.is_ascii_digit()) {
        return Err("account.txt의 회원 번호는 숫자여야 합니다.".into());
    }
    Ok((user_no.to_string(), token.to_string()))
}

async fn authenticated_client(user_no: &str, token: &str) -> Result<Client, String> {
    if user_no.is_empty() || token.is_empty() {
        return Err("회원 번호와 로그인 토큰이 필요합니다.".into());
    }

    let client = Client::builder()
        .cookie_store(true)
        .user_agent("V-ARCHIVE-Viewer/0.1")
        .build()
        .map_err(|error| format!("HTTP 클라이언트 생성 실패: {error}"))?;
    let mut url = Url::parse(&format!("{API_BASE_URL}/client/tokenLogin"))
        .map_err(|error| format!("로그인 URL 생성 실패: {error}"))?;
    url.query_pairs_mut()
        .append_pair("no", user_no)
        .append_pair("token", token);

    let response = client
        .get(url)
        .send()
        .await
        .map_err(|error| format!("토큰 로그인 요청 실패: {error}"))?;
    let status = response.status();
    if !status.is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(response_error("토큰 로그인 실패", status, &body));
    }
    Ok(client)
}

fn store_client(session: &State<'_, ApiSession>, client: Client) -> Result<(), String> {
    *session
        .client
        .lock()
        .map_err(|_| "로그인 세션 잠금 실패".to_string())? = Some(client);
    Ok(())
}

#[tauri::command]
fn logout_history_account(session: State<'_, ApiSession>) -> Result<(), String> {
    *session
        .client
        .lock()
        .map_err(|_| "로그인 세션 잠금 실패".to_string())? = None;
    Ok(())
}

#[tauri::command]
async fn login_with_token(
    user_no: String,
    token: String,
    session: State<'_, ApiSession>,
) -> Result<(), String> {
    let client = authenticated_client(&user_no, &token).await?;
    store_client(&session, client)
}

#[tauri::command]
async fn login_from_account_file(
    app: AppHandle,
    session: State<'_, ApiSession>,
) -> Result<AccountFileInfo, String> {
    let path = configured_account_path(&app)?;
    let (user_no, token) = read_account(&path)?;
    let client = authenticated_client(&user_no, &token).await?;
    store_client(&session, client)?;
    Ok(account_file_info(&path, &user_no))
}

#[tauri::command]
fn select_account_file(app: AppHandle) -> Result<Option<AccountFileInfo>, String> {
    let mut dialog = rfd::FileDialog::new()
        .add_filter("account.txt", &["txt"])
        .set_file_name("account.txt");
    if let Ok(executable) = std::env::current_exe()
        && let Some(directory) = executable.parent()
    {
        dialog = dialog.set_directory(directory);
    }
    let Some(path) = dialog.pick_file() else {
        return Ok(None);
    };
    let canonical = path
        .canonicalize()
        .map_err(|error| format!("account.txt 경로 확인 실패: {error}"))?;
    let (user_no, _) = read_account(&canonical)?;
    save_account_path(&app, &canonical)?;
    Ok(Some(account_file_info(&canonical, &user_no)))
}

#[tauri::command]
async fn fetch_record_history(
    title: u32,
    button: u8,
    pattern: String,
    session: State<'_, ApiSession>,
) -> Result<Value, String> {
    if !matches!(button, 4 | 5 | 6 | 8) {
        return Err("button은 4, 5, 6, 8 중 하나여야 합니다.".into());
    }
    if !matches!(pattern.as_str(), "NM" | "HD" | "MX" | "SC") {
        return Err("pattern은 NM, HD, MX, SC 중 하나여야 합니다.".into());
    }

    let client = session
        .client
        .lock()
        .map_err(|_| "로그인 세션 잠금 실패".to_string())?
        .clone()
        .ok_or_else(|| "먼저 토큰 로그인이 필요합니다.".to_string())?;
    let mut url = Url::parse(&format!("{API_BASE_URL}/api/v3/archive/record-history"))
        .map_err(|error| format!("API URL 생성 실패: {error}"))?;
    url.query_pairs_mut()
        .append_pair("title", &title.to_string())
        .append_pair("button", &button.to_string())
        .append_pair("pattern", &pattern);

    let response = client
        .get(url)
        .header(reqwest::header::ACCEPT, "application/json")
        .send()
        .await
        .map_err(|error| format!("히스토리 요청 실패: {error}"))?;
    let status = response.status();
    let body = response
        .text()
        .await
        .map_err(|error| format!("히스토리 응답 읽기 실패: {error}"))?;
    if !status.is_success() {
        return Err(response_error("히스토리 요청 실패", status, &body));
    }
    serde_json::from_str(&body).map_err(|error| format!("히스토리 JSON 해석 실패: {error}"))
}

async fn fetch_update_manifest() -> Result<UpdateManifest, String> {
    let response = Client::builder()
        .user_agent("V-ARCHIVE-Viewer-Updater/0.1")
        .build()
        .map_err(|error| format!("업데이트 클라이언트 생성 실패: {error}"))?
        .get(UPDATE_MANIFEST_URL)
        .header(reqwest::header::ACCEPT, "application/json")
        .header(reqwest::header::CACHE_CONTROL, "no-cache, no-store")
        .send()
        .await
        .map_err(|error| format!("업데이트 버전 확인 실패: {error}"))?;
    let status = response.status();
    let body = response
        .text()
        .await
        .map_err(|error| format!("업데이트 정보 읽기 실패: {error}"))?;
    if !status.is_success() {
        return Err(response_error("업데이트 버전 확인 실패", status, &body));
    }
    serde_json::from_str(&body).map_err(|error| format!("업데이트 정보 해석 실패: {error}"))
}

#[tauri::command]
async fn check_for_update(app: AppHandle) -> Result<UpdateInfo, String> {
    let manifest = fetch_update_manifest().await?;
    let current_version = app.package_info().version.to_string();
    let latest_version = semver::Version::parse(&manifest.version)
        .map_err(|error| format!("업데이트 버전 형식 오류: {error}"))?;
    let current_semver = semver::Version::parse(&current_version)
        .map_err(|error| format!("현재 버전 형식 오류: {error}"))?;
    Ok(UpdateInfo {
        available: latest_version > current_semver,
        current_version,
        latest_version: manifest.version,
        size: manifest.size,
    })
}

fn powershell_quote(path: &Path) -> String {
    format!("'{}'", path.display().to_string().replace('\'', "''"))
}

fn encode_powershell_script(script: &str) -> Vec<u8> {
    let mut bytes = vec![0xEF, 0xBB, 0xBF];
    bytes.extend_from_slice(script.as_bytes());
    bytes
}

fn build_update_script(
    zip_path: &Path,
    stage_path: &Path,
    current_exe: &Path,
    install_dir: &Path,
    log_path: &Path,
    process_id: u32,
) -> String {
    let zip = powershell_quote(zip_path);
    let stage = powershell_quote(stage_path);
    let target = powershell_quote(current_exe);
    let source = powershell_quote(&stage_path.join("v-archive-viewer.exe"));
    let repair_target = powershell_quote(&install_dir.join("v-archive-repair.bat"));
    let repair_source = powershell_quote(&stage_path.join("v-archive-repair.bat"));
    let working_dir = powershell_quote(install_dir);
    let log = powershell_quote(log_path);
    [
        "$ErrorActionPreference = 'Stop'".to_string(),
        format!("$log = {log}"),
        "try {".to_string(),
        format!(
            "  while (Get-Process -Id {process_id} -ErrorAction SilentlyContinue) {{ Start-Sleep -Milliseconds 250 }}"
        ),
        format!("  if (Test-Path -LiteralPath {stage}) {{ Remove-Item -LiteralPath {stage} -Recurse -Force }}"),
        format!("  Expand-Archive -LiteralPath {zip} -DestinationPath {stage} -Force"),
        format!("  if (-not (Test-Path -LiteralPath {source})) {{ throw '업데이트 EXE를 찾을 수 없습니다.' }}"),
        format!("  Copy-Item -LiteralPath {source} -Destination {target} -Force"),
        format!("  if ((-not (Test-Path -LiteralPath {repair_target})) -and (Test-Path -LiteralPath {repair_source})) {{ Copy-Item -LiteralPath {repair_source} -Destination {repair_target} }}"),
        format!("  Start-Process -FilePath {target} -WorkingDirectory {working_dir}"),
        format!("  Remove-Item -LiteralPath {zip} -Force -ErrorAction SilentlyContinue"),
        format!("  Remove-Item -LiteralPath {stage} -Recurse -Force -ErrorAction SilentlyContinue"),
        "} catch {".to_string(),
        "  $_ | Out-String | Set-Content -LiteralPath $log -Encoding UTF8".to_string(),
        format!("  Start-Process -FilePath {target} -WorkingDirectory {working_dir} -ErrorAction SilentlyContinue"),
        "}".to_string(),
    ]
    .join("\r\n")
}

#[tauri::command]
async fn install_update(app: AppHandle) -> Result<(), String> {
    let manifest = fetch_update_manifest().await?;
    let current_version = app.package_info().version.to_string();
    let latest_version = semver::Version::parse(&manifest.version)
        .map_err(|error| format!("업데이트 버전 형식 오류: {error}"))?;
    let current_semver = semver::Version::parse(&current_version)
        .map_err(|error| format!("현재 버전 형식 오류: {error}"))?;
    if latest_version <= current_semver {
        return Err("이미 최신 버전입니다.".into());
    }
    if !manifest
        .version
        .chars()
        .all(|character| character.is_ascii_alphanumeric() || matches!(character, '.' | '-' | '_'))
    {
        return Err("업데이트 버전 형식이 올바르지 않습니다.".into());
    }

    let download_url = Url::parse(&manifest.url)
        .map_err(|error| format!("업데이트 다운로드 URL 오류: {error}"))?;
    if download_url.scheme() != "https" || download_url.host_str() != Some(UPDATE_HOST) {
        return Err("허용되지 않은 업데이트 다운로드 주소입니다.".into());
    }

    let response = Client::builder()
        .user_agent("V-ARCHIVE-Viewer-Updater/0.1")
        .build()
        .map_err(|error| format!("업데이트 클라이언트 생성 실패: {error}"))?
        .get(download_url)
        .send()
        .await
        .map_err(|error| format!("업데이트 다운로드 실패: {error}"))?;
    let status = response.status();
    if !status.is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(response_error("업데이트 다운로드 실패", status, &body));
    }
    let bytes = response
        .bytes()
        .await
        .map_err(|error| format!("업데이트 파일 읽기 실패: {error}"))?;
    if bytes.len() as u64 != manifest.size {
        return Err(format!(
            "업데이트 파일 크기가 일치하지 않습니다: {} / {} bytes",
            bytes.len(),
            manifest.size
        ));
    }
    let actual_sha256 = format!("{:x}", Sha256::digest(&bytes));
    if !actual_sha256.eq_ignore_ascii_case(&manifest.sha256) {
        return Err("업데이트 파일 SHA-256이 일치하지 않습니다.".into());
    }

    let current_exe = std::env::current_exe()
        .map_err(|error| format!("현재 실행 파일 위치 확인 실패: {error}"))?;
    let install_dir = current_exe
        .parent()
        .ok_or_else(|| "앱 설치 폴더를 확인할 수 없습니다.".to_string())?;
    let write_test = install_dir.join(".v-archive-update-write-test");
    fs::write(&write_test, b"update")
        .map_err(|error| format!("앱 폴더에 업데이트를 설치할 수 없습니다: {error}"))?;
    let _ = fs::remove_file(&write_test);

    let update_dir = std::env::temp_dir().join("v-archive-viewer-update");
    fs::create_dir_all(&update_dir)
        .map_err(|error| format!("업데이트 임시 폴더 생성 실패: {error}"))?;
    let zip_path = update_dir.join(format!("v-archive-viewer-{}.zip", manifest.version));
    let stage_path = update_dir.join(format!("stage-{}", manifest.version));
    let script_path = update_dir.join("apply-update.ps1");
    let log_path = update_dir.join("update.log");
    let _ = fs::remove_file(&log_path);
    fs::write(&zip_path, &bytes).map_err(|error| format!("업데이트 파일 저장 실패: {error}"))?;

    let script = build_update_script(
        &zip_path,
        &stage_path,
        &current_exe,
        install_dir,
        &log_path,
        std::process::id(),
    );
    fs::write(&script_path, encode_powershell_script(&script))
        .map_err(|error| format!("업데이트 실행 스크립트 생성 실패: {error}"))?;

    let mut command = Command::new("powershell.exe");
    command.args([
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-WindowStyle",
        "Hidden",
        "-File",
    ]);
    command.arg(&script_path);
    #[cfg(windows)]
    command.creation_flags(0x08000000);
    command
        .spawn()
        .map_err(|error| format!("업데이트 설치 프로세스 시작 실패: {error}"))?;

    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(300));
        app.exit(0);
    });
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{build_update_script, encode_powershell_script};
    use std::path::Path;

    #[test]
    fn powershell_script_has_utf8_bom_and_preserves_korean_paths() {
        let script = "Copy-Item 'C:\\사용자\\새 폴더\\v-archive-viewer.exe'";
        let encoded = encode_powershell_script(script);

        assert_eq!(&encoded[..3], &[0xEF, 0xBB, 0xBF]);
        assert_eq!(&encoded[3..], script.as_bytes());
    }

    #[test]
    fn update_script_restores_missing_repair_batch_file() {
        let script = build_update_script(
            Path::new("C:\\temp\\update.zip"),
            Path::new("C:\\temp\\stage"),
            Path::new("C:\\app\\v-archive-viewer.exe"),
            Path::new("C:\\app"),
            Path::new("C:\\temp\\update.log"),
            1234,
        );

        assert!(script.contains("-not (Test-Path -LiteralPath 'C:\\app\\v-archive-repair.bat')"));
        assert!(script.contains("Copy-Item -LiteralPath 'C:\\temp\\stage\\v-archive-repair.bat' -Destination 'C:\\app\\v-archive-repair.bat'"));
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    clear_webview_ui_cache_for_new_version();
    tauri::Builder::default()
        .manage(ApiSession::default())
        .invoke_handler(tauri::generate_handler![
            login_with_token,
            login_from_account_file,
            logout_history_account,
            select_account_file,
            fetch_record_history,
            check_for_update,
            install_update
        ])
        .run(tauri::generate_context!())
        .expect("error while running V-ARCHIVE Viewer");
}
