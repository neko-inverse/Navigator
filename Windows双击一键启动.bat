@echo off
cd /d "%~dp0"

echo === 1/3  ��Ŀ¼ npm install ===
call npm install
if errorlevel 1 (
    echo ��Ŀ¼ npm install ʧ�ܣ��ű���ֹ
    pause
    exit /b 1
)

echo === 2/3  ���� backend �� npm install ===
cd backend
call npm install
if errorlevel 1 (
    echo backend npm install ʧ�ܣ��ű���ֹ
    pause
    exit /b 1
)

start http://localhost:5173

echo === 3/3  ���ظ�Ŀ¼�� npm run start ===
cd ..
call npm run start

pause