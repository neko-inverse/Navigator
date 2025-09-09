@echo off
REM Windows启动脚本 - 运行后端服务

echo 正在启动后端服务...
bun start.js

REM 如果bun命令未找到，尝试使用npm
if %errorlevel% neq 0 (
    echo bun命令未找到，尝试使用npm...
    npm install
    npm start
)

pause