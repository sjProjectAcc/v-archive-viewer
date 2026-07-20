@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not defined APP_EXE set "APP_EXE=%~dp0v-archive-viewer.exe"
if not defined MANIFEST_URL set "MANIFEST_URL=https://sjprojectacc.github.io/v-archive-viewer/desktop-version.json"
if not defined VARCHIVE_WEBVIEW_DIR set "VARCHIVE_WEBVIEW_DIR=%LOCALAPPDATA%\net.varchive.viewer\EBWebView"

if /I "%~1"=="cache" goto cache
if /I "%~1"=="reinstall" goto reinstall

title V-ARCHIVE Viewer Recovery
echo.
echo V-ARCHIVE Viewer Recovery
echo [1] Clear UI cache and restart
echo [2] Force download and reinstall the latest version
echo [Q] Quit
echo.
choice /C 12Q /N /M "Select: "
if errorlevel 3 exit /b 0
if errorlevel 2 goto reinstall
if errorlevel 1 goto cache

:stop_app
if defined VARCHIVE_SKIP_STOP exit /b 0
taskkill /IM v-archive-viewer.exe /F >nul 2>&1
if not defined VARCHIVE_SKIP_STOP timeout /t 2 /nobreak >nul
exit /b 0

:clear_cache
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $root=$env:VARCHIVE_WEBVIEW_DIR; $items=@('Default\Cache','Default\Code Cache','Default\GPUCache','Default\Service Worker','GPUCache','GPUPersistentCache','GrShaderCache','ShaderCache'); foreach($item in $items){$path=Join-Path $root $item; if(Test-Path -LiteralPath $path){Remove-Item -LiteralPath $path -Recurse -Force}}"
exit /b %errorlevel%

:cache
call :stop_app
call :clear_cache
if errorlevel 1 goto failed
echo UI cache cleared. History and settings were preserved.
if not defined VARCHIVE_SKIP_START if exist "%APP_EXE%" start "" "%APP_EXE%"
goto done

:reinstall
call :stop_app
call :clear_cache
if errorlevel 1 goto failed
echo Downloading and verifying the latest release...
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $temp=Join-Path $env:TEMP ('v-archive-repair-'+[guid]::NewGuid().ToString('N')); try{$manifest=Invoke-RestMethod -Uri $env:MANIFEST_URL -Headers @{'Cache-Control'='no-cache'}; New-Item -ItemType Directory -Path $temp|Out-Null; $zip=Join-Path $temp 'app.zip'; Invoke-WebRequest -UseBasicParsing -Uri $manifest.url -OutFile $zip; $actual=(Get-FileHash -Algorithm SHA256 -LiteralPath $zip).Hash.ToLowerInvariant(); if($actual -ne ([string]$manifest.sha256).ToLowerInvariant()){throw 'SHA-256 verification failed.'}; $stage=Join-Path $temp 'stage'; Expand-Archive -LiteralPath $zip -DestinationPath $stage -Force; $source=Join-Path $stage 'v-archive-viewer.exe'; if(-not (Test-Path -LiteralPath $source)){throw 'The application executable is missing from the release.'}; Copy-Item -LiteralPath $source -Destination $env:APP_EXE -Force; Write-Host ('Installed V-ARCHIVE Viewer '+$manifest.version)}finally{if(Test-Path -LiteralPath $temp){Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue}}"
if errorlevel 1 goto failed
if not defined VARCHIVE_SKIP_START start "" "%APP_EXE%"
goto done

:failed
echo.
echo Recovery failed. Keep this BAT next to v-archive-viewer.exe in a writable folder.
pause
exit /b 1

:done
echo.
echo Recovery completed.
if not defined VARCHIVE_SKIP_STOP timeout /t 2 /nobreak >nul
exit /b 0
