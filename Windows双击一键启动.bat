@echo off
cd /d "%~dp0"

echo === 1/3  根目录 npm install ===
call npm install
if errorlevel 1 (
    echo 根目录 npm install 失败，脚本终止
    pause
    exit /b 1
)

echo === 2/3  进入 backend 并 npm install ===
cd backend
call npm install
if errorlevel 1 (
    echo backend npm install 失败，脚本终止
    pause
    exit /b 1
)

start http://localhost:5173

echo === 3/3  返回根目录并 npm run start ===
cd ..
call npm run start

pause