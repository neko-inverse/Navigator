@echo off
cls

:: 设置中文显示
echo 正在设置中文显示...
chcp 65001 >nul

:: 打印欢迎信息
echo.
echo ===============================================================================
echo                         Windows双击一键启动
echo ===============================================================================
echo 此脚本将帮助您完成以下操作：
echo 1. 设置npm镜像源（淘宝）以提高安装速度和稳定性
echo 2. 安装前端项目依赖
echo 3. 安装后端项目依赖
echo 4. 启动后端服务
echo 5. 启动前端服务
echo 6. 自动打开浏览器访问前端页面

echo 正在准备环境...

:: 检查并自动安装Node.js
echo 检查Node.js安装情况...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 未找到Node.js，正在自动下载并安装...
    
    :: 创建临时目录
    mkdir %temp%\nodejs_installer >nul 2>nul
    cd %temp%\nodejs_installer
    
    :: 下载Node.js安装包（这里使用LTS版本，根据实际情况可以调整）
    echo 正在下载Node.js安装包...
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.15.0/node-v20.15.0-x64.msi' -OutFile 'nodejs_installer.msi'"
    
    :: 安装Node.js
    echo 正在安装Node.js...
    msiexec /i nodejs_installer.msi /quiet /qn /norestart
    
    :: 等待安装完成
    timeout /t 30 /nobreak >nul
    
    :: 刷新环境变量
    echo 正在刷新环境变量...
    call "%USERPROFILE%\AppData\Local\Microsoft\Windows\Apps\RefreshEnv.cmd" >nul 2>nul
    
    :: 验证安装
    where node >nul 2>nul
    if %errorlevel% neq 0 (
        echo 错误：Node.js安装失败，请手动安装后再运行此脚本。
        echo 您可以从官网下载安装：https://nodejs.org/
        pause
        exit /b 1
    )
    
    :: 清理临时文件
    cd ..
    rd /s /q nodejs_installer >nul 2>nul
)
echo 已检测到Node.js

:: 检查并自动安装npm（通常Node.js已包含npm）
echo 检查npm安装情况...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo 未找到npm，正在自动安装...
    powershell -Command "Invoke-WebRequest -Uri 'https://www.npmjs.com/install.sh' -OutFile 'install_npm.sh'"
    echo 请手动安装npm后再运行此脚本。
    pause
    exit /b 1
)
echo 已检测到npm

:: 检查并自动安装Bun.js
echo 检查Bun.js安装情况...
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo 未找到Bun.js，正在自动安装...
    powershell -Command "iwr bun.sh/install.ps1 -useb | iex"
    
    :: 刷新环境变量
    call "%USERPROFILE%\AppData\Local\Microsoft\Windows\Apps\RefreshEnv.cmd" >nul 2>nul
    
    :: 验证安装
    where bun >nul 2>nul
    if %errorlevel% neq 0 (
        echo 警告：Bun.js安装失败，将使用npm继续...
    ) else (
        echo 已检测到Bun.js
    )
)

:: 设置npm镜像源为淘宝镜像
echo 设置npm镜像源为淘宝镜像...
npm config set registry https://registry.npmmirror.com/
echo npm镜像源已设置为淘宝镜像：https://registry.npmmirror.com/

:: 如果Bun已安装，设置Bun镜像源
where bun >nul 2>nul
if %errorlevel% equ 0 (
    echo 设置Bun镜像源为淘宝镜像...
    bun config set registry https://registry.npmmirror.com/
    echo Bun镜像源已设置为淘宝镜像：https://registry.npmmirror.com/
)

:: 安装前端依赖
echo ===============================================================================
echo 正在安装前端项目依赖...
echo ===============================================================================
:: 优先使用Bun安装依赖，如不可用则使用npm
where bun >nul 2>nul
if %errorlevel% equ 0 (
    echo 使用Bun安装前端依赖...
    bun install
) else (
    echo 使用npm安装前端依赖...
    npm install
)
if %errorlevel% neq 0 (
    echo 错误：前端依赖安装失败，请检查网络连接或稍后重试。
    pause
    exit /b 1
)

echo 前端依赖安装完成！

:: 切换到后端目录并安装依赖
echo ===============================================================================
echo 正在安装后端项目依赖...
echo ===============================================================================
cd backend
:: 优先使用Bun安装依赖，如不可用则使用npm
where bun >nul 2>nul
if %errorlevel% equ 0 (
    echo 使用Bun安装后端依赖...
    bun install
) else (
    echo 使用npm安装后端依赖...
    npm install
)
if %errorlevel% neq 0 (
    echo 错误：后端依赖安装失败，请检查网络连接或稍后重试。
    cd ..
    pause
    exit /b 1
)

echo 后端依赖安装完成！

:: 切换回项目根目录
cd ..

:: 创建启动后端的临时脚本
echo @echo off > start_backend.bat
echo echo 正在启动后端服务... >> start_backend.bat
echo cd backend >> start_backend.bat
echo :: 优先使用Bun启动服务 >> start_backend.bat
echo where bun >nul 2>nul >> start_backend.bat
echo if %%errorlevel%% equ 0 ( >> start_backend.bat
echo     echo 使用Bun启动后端服务... >> start_backend.bat
echo     bun run start >> start_backend.bat
echo ) else ( >> start_backend.bat
echo     echo 使用npm启动后端服务... >> start_backend.bat
echo     npm run start >> start_backend.bat
echo ) >> start_backend.bat
echo exit >> start_backend.bat

:: 创建启动前端的临时脚本
echo @echo off > start_frontend.bat
echo echo 正在启动前端服务... >> start_frontend.bat
echo echo 等待后端服务启动... >> start_frontend.bat
echo timeout /t 3 /nobreak >nul >> start_frontend.bat
echo :: 优先使用Bun启动服务 >> start_frontend.bat
echo where bun >nul 2>nul >> start_frontend.bat
echo if %%errorlevel%% equ 0 ( >> start_frontend.bat
echo     echo 使用Bun启动前端服务... >> start_frontend.bat
echo     bun run dev >> start_frontend.bat
echo ) else ( >> start_frontend.bat
echo     echo 使用npm启动前端服务... >> start_frontend.bat
echo     npm run dev >> start_frontend.bat
echo ) >> start_frontend.bat
echo exit >> start_frontend.bat

:: 创建打开浏览器的临时脚本
echo @echo off > open_browser.bat
echo echo 等待前端服务启动... >> open_browser.bat
echo timeout /t 8 /nobreak >nul >> open_browser.bat
echo echo 正在打开浏览器访问前端页面... >> open_browser.bat
echo start http://localhost:5173 >> open_browser.bat
echo exit >> open_browser.bat

:: 启动服务
echo ===============================================================================
echo 正在启动服务，请稍候...
echo ===============================================================================
echo 注意：将打开三个窗口分别运行后端、前端服务和浏览器。
echo 如果服务启动成功，您可以在浏览器中看到Navigator应用。
echo 如需停止服务，请关闭所有窗口。

:: 启动后端服务
echo 正在启动后端服务...
start "Navigator - 后端服务" cmd /k start_backend.bat

:: 等待一小段时间
timeout /t 1 /nobreak >nul

:: 启动前端服务
start "Navigator - 前端服务" cmd /k start_frontend.bat

:: 等待一小段时间
timeout /t 1 /nobreak >nul

:: 启动浏览器
echo 正在准备打开浏览器...
start "Navigator - 浏览器" cmd /k open_browser.bat

:: 清理临时脚本
echo @echo off > cleanup.bat
echo timeout /t 15 /nobreak >nul >> cleanup.bat
echo del /q start_backend.bat start_frontend.bat open_browser.bat cleanup.bat >> cleanup.bat
echo exit >> cleanup.bat
start /min cmd /c cleanup.bat

:: 等待一段时间后退出当前窗口
echo 脚本执行完成！正在退出...
timeout /t 3 /nobreak >nul
exit