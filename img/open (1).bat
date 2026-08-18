@echo off
title Chromium Pool - 6 Instancias
color 0A

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Abriendo 6 Chrome para el pool de Vanti              ║
echo ║   Puertos: 9222, 9223, 9224, 9225, 9226, 9227         ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Ruta a Chrome - ajusta según tu instalación
set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe

REM Intentar diferentes rutas comunes de Chrome
if not exist "%CHROME_PATH%" set CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
if not exist "%CHROME_PATH%" set CHROME_PATH=%localappdata%\Google\Chrome\Application\chrome.exe

if not exist "%CHROME_PATH%" (
  echo ❌ Chrome no encontrado en rutas comunes
  echo Por favor, edita este archivo y establece la ruta correcta
  pause
  exit /b 1
)

echo ✅ Chrome encontrado: %CHROME_PATH%
echo.

REM Crear carpetas de perfil si no existen
if not exist chrome-profile-1 mkdir chrome-profile-1
if not exist chrome-profile-2 mkdir chrome-profile-2
if not exist chrome-profile-3 mkdir chrome-profile-3
if not exist chrome-profile-4 mkdir chrome-profile-4
if not exist chrome-profile-5 mkdir chrome-profile-5
if not exist chrome-profile-6 mkdir chrome-profile-6

echo 🔄 Iniciando 6 instancias...
echo.

REM Iniciar Chrome 1
start "Chrome-9222" /D "%CD%" "%CHROME_PATH%" ^
  --remote-debugging-port=9222 ^
  --remote-debugging-address=127.0.0.1 ^
  --user-data-dir="%CD%\chrome-profile-1" ^
  --no-first-run ^
  --no-default-browser-check ^
  --disable-default-apps ^
  --disable-popup-blocking ^
  --disable-background-networking ^
  --disable-extensions ^
  about:blank

timeout /t 2 /nobreak > nul

REM Iniciar Chrome 2
start "Chrome-9223" /D "%CD%" "%CHROME_PATH%" ^
  --remote-debugging-port=9223 ^
  --remote-debugging-address=127.0.0.1 ^
  --user-data-dir="%CD%\chrome-profile-2" ^
  --no-first-run ^
  --no-default-browser-check ^
  --disable-default-apps ^
  --disable-popup-blocking ^
  --disable-background-networking ^
  --disable-extensions ^
  about:blank

timeout /t 2 /nobreak > nul

REM Iniciar Chrome 3
start "Chrome-9224" /D "%CD%" "%CHROME_PATH%" ^
  --remote-debugging-port=9224 ^
  --remote-debugging-address=127.0.0.1 ^
  --user-data-dir="%CD%\chrome-profile-3" ^
  --no-first-run ^
  --no-default-browser-check ^
  --disable-default-apps ^
  --disable-popup-blocking ^
  --disable-background-networking ^
  --disable-extensions ^
  about:blank

timeout /t 2 /nobreak > nul

REM Iniciar Chrome 4
start "Chrome-9225" /D "%CD%" "%CHROME_PATH%" ^
  --remote-debugging-port=9225 ^
  --remote-debugging-address=127.0.0.1 ^
  --user-data-dir="%CD%\chrome-profile-4" ^
  --no-first-run ^
  --no-default-browser-check ^
  --disable-default-apps ^
  --disable-popup-blocking ^
  --disable-background-networking ^
  --disable-extensions ^
  about:blank

timeout /t 2 /nobreak > nul

REM Iniciar Chrome 5
start "Chrome-9226" /D "%CD%" "%CHROME_PATH%" ^
  --remote-debugging-port=9226 ^
  --remote-debugging-address=127.0.0.1 ^
  --user-data-dir="%CD%\chrome-profile-5" ^
  --no-first-run ^
  --no-default-browser-check ^
  --disable-default-apps ^
  --disable-popup-blocking ^
  --disable-background-networking ^
  --disable-extensions ^
  about:blank

timeout /t 2 /nobreak > nul

REM Iniciar Chrome 6
start "Chrome-9227" /D "%CD%" "%CHROME_PATH%" ^
  --remote-debugging-port=9227 ^
  --remote-debugging-address=127.0.0.1 ^
  --user-data-dir="%CD%\chrome-profile-6" ^
  --no-first-run ^
  --no-default-browser-check ^
  --disable-default-apps ^
  --disable-popup-blocking ^
  --disable-background-networking ^
  --disable-extensions ^
  about:blank

echo.
echo ✅ 6 Chrome iniciados
echo.
echo 🎯 Verificando puertos...
timeout /t 3 /nobreak > nul

netstat -an | findstr 9222
netstat -an | findstr 9223
netstat -an | findstr 9224
netstat -an | findstr 9225
netstat -an | findstr 9226
netstat -an | findstr 9227

echo.
echo 💡 Ahora ejecuta en otra terminal:
echo    node server.js
echo.
pause