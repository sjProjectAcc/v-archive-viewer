# V-LOG

V-LOG는 DJMAX RESPECT V의 V-ARCHIVE 기록을 조회하고 분석하는 비공식 도구입니다. 일반 기록 표, 버튼별 Top100, floor 통계, 사용자 비교, 산포도, logPower 점수제와 기록 히스토리를 제공합니다.

## 주요 기능

- 닉네임별 4B, 5B, 6B, 8B 기록 조회
- Records, Top100, Tier, DJClass 표와 필터 및 정렬
- Floor x Score, scorePoint, logPower, Point, DJPower 산포도
- floor별 최고점, 평균, 최저점과 최대치선
- 두 사용자의 공통 기록 및 floor별 z-score 비교
- Top30 및 floor 통계 공유 이미지 생성
- 데스크톱 앱의 로그인 기반 기록 히스토리 수집
- 브라우저 IndexedDB 기반 로컬 캐시
- 데스크톱 자동 업데이트 확인 및 설치

## 구조

웹앱과 데스크톱 앱 모두 기록 데이터를 사용자 환경에서 V-ARCHIVE API로 직접 요청합니다. 호스팅 서버는 정적 화면 파일, 버전 정보와 데스크톱 배포 ZIP만 제공합니다.

```text
호스팅 서버 -> 사용자: HTML, CSS, JavaScript, 업데이트 파일
사용자 -> V-ARCHIVE: 기록 및 히스토리 API
사용자 -> djmax.gg: 자켓 이미지
사용자 환경 -> IndexedDB/localStorage: 기록 캐시와 설정
```

일반 기록 조회는 닉네임 기반 공개 API를 사용합니다. 기록 히스토리는 데스크톱 앱에서 사용자가 선택한 `account.txt`의 회원번호와 토큰으로 V-ARCHIVE에 직접 로그인한 뒤 요청합니다. 앱 설정에는 토큰이 아닌 `account.txt` 경로만 저장되고 로그인 쿠키는 앱 메모리에서만 유지됩니다.

## 실행

### 웹

정적 파일은 `web/`에 있습니다. 로컬 서버를 사용할 때는 저장소 루트에서 다음 명령을 실행합니다.

```powershell
python web_server.py
```

브라우저에서 `http://127.0.0.1:8787/`을 엽니다.

### 데스크톱

Node.js, Rust와 Windows WebView2가 필요합니다.

```powershell
npm install
npm run desktop:dev
```

릴리스 빌드:

```powershell
npm run desktop:build
```

실행 파일은 `src-tauri/target/release/v-archive-viewer.exe`에 생성됩니다.

## 배포 채널

- `test` 브랜치는 푸시할 때마다 개인 검증용 Windows ZIP과 `test-latest` 프리릴리스를 만듭니다. 앱 옆에 `TEST.txt`가 있으면 개발자 확인 업데이트를 받고, 파일을 지우면 공개 업데이트 채널로 돌아갑니다.
- `main` 브랜치는 변경 검증만 자동 실행합니다. 공개 웹, GitHub Release와 업데이트 매니페스트는 `Build, release, and deploy` 워크플로를 수동 실행할 때만 갱신됩니다.
- 테스트가 끝난 변경은 `test`에서 `main`으로 PR을 합친 뒤 공개 배포합니다.

## 데이터와 개인정보

- 기록, 히스토리와 UI 설정은 사용자 환경에 저장됩니다.
- `account.txt`, 회원번호와 로그인 토큰은 저장소나 호스팅 서버로 전송되지 않습니다.
- 데스크톱 앱은 업데이트 확인을 위해 배포 서버의 작은 버전 JSON을 요청합니다.
- 자동 업데이트 파일은 다운로드 후 크기와 SHA-256을 검증합니다.

`account.txt`의 첫 줄 형식:

```text
회원번호 로그인토큰
```

이 파일은 절대 Git에 커밋하지 마세요.

## 외부 서비스

- 기록 및 곡 데이터: `https://v-archive.net`
- 자켓 이미지: `https://djmax.gg`
- 배포 웹앱: `https://v-archive-viewer.ara-share.chatgpt.site`

이 프로젝트는 V-ARCHIVE, DJMAX 또는 NEOWIZ의 공식 프로젝트가 아닙니다. 각 서비스와 이미지의 권리는 해당 소유자에게 있습니다.

## 라이선스

소스 코드는 [MIT License](LICENSE)로 배포합니다.
