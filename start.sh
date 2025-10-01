#!/bin/bash

# 设置中文显示
export LANG="zh_CN.UTF-8"
export LC_ALL="zh_CN.UTF-8"

# 打印欢迎信息
clear
echo "======================================================================="
echo "                           Navigator项目一键启动脚本"
echo "======================================================================="
echo "此脚本将帮助您完成以下操作："
echo "1. 设置npm镜像源（淘宝）以提高安装速度和稳定性"
echo "2. 安装前端项目依赖"
echo "3. 安装后端项目依赖"
echo "4. 启动后端服务"
echo "5. 启动前端服务"
echo "6. 自动打开浏览器访问前端页面"

echo "正在准备环境..."

# 检查是否安装了Node.js
echo "检查Node.js安装情况..."
if ! command -v node &> /dev/null
then
    echo "错误：未找到Node.js。请先安装Node.js后再运行此脚本。"
    echo "您可以从官网下载安装：https://nodejs.org/"
    read -p "按Enter键退出..."
    exit 1
fi
echo "已检测到Node.js"

# 检查是否安装了npm
echo "检查npm安装情况..."
if ! command -v npm &> /dev/null
then
    echo "错误：未找到npm。请先安装npm后再运行此脚本。"
    read -p "按Enter键退出..."
    exit 1
fi
echo "已检测到npm"

# 设置npm镜像源为淘宝镜像
echo "设置npm镜像源为淘宝镜像..."
npm config set registry https://registry.npmmirror.com/
echo "npm镜像源已设置为淘宝镜像：https://registry.npmmirror.com/"

# 安装前端依赖
echo "======================================================================="
echo "正在安装前端项目依赖..."
echo "======================================================================="
npm install
if [ $? -ne 0 ]
then
    echo "错误：前端依赖安装失败，请检查网络连接或稍后重试。"
    read -p "按Enter键退出..."
    exit 1
fi
echo "前端依赖安装完成！"

# 切换到后端目录并安装依赖
echo "======================================================================="
echo "正在安装后端项目依赖..."
echo "======================================================================="
cd backend
npm install
if [ $? -ne 0 ]
then
    echo "错误：后端依赖安装失败，请检查网络连接或稍后重试。"
    cd ..
    read -p "按Enter键退出..."
    exit 1
fi
echo "后端依赖安装完成！"

# 切换回项目根目录
cd ..

# 创建启动后端的临时脚本
cat > start_backend.sh << EOF
#!/bin/bash
echo "正在启动后端服务..."
cd backend
npm run start
EOF
chmod +x start_backend.sh

# 创建启动前端的临时脚本
cat > start_frontend.sh << EOF
#!/bin/bash
echo "正在启动前端服务..."
echo "等待后端服务启动..."
sleep 3
npm run dev
EOF
chmod +x start_frontend.sh

# 创建打开浏览器的临时脚本
cat > open_browser.sh << EOF
#!/bin/bash
echo "等待前端服务启动..."
sleep 8
echo "正在打开浏览器访问前端页面..."
# 根据不同操作系统打开浏览器
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac OS
    open http://localhost:5173
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:5173
    elif command -v gnome-open &> /dev/null; then
        gnome-open http://localhost:5173
    else
        echo "请手动打开浏览器访问：http://localhost:5173"
    fi
else
    # 其他系统
    echo "请手动打开浏览器访问：http://localhost:5173"
fi
EOF
chmod +x open_browser.sh

# 启动服务
echo "======================================================================="
echo "正在启动服务，请稍候..."
echo "======================================================================="
echo "注意：将启动后端、前端服务并尝试打开浏览器。"
echo "如果服务启动成功，您可以在浏览器中看到Navigator应用。"
echo "如需停止服务，请关闭所有相关终端窗口。"

# 创建清理临时脚本的脚本
cat > cleanup.sh << EOF
#!/bin/bash
sleep 15
rm -f start_backend.sh start_frontend.sh open_browser.sh cleanup.sh
EOF
chmod +x cleanup.sh

# 启动清理脚本（后台运行）
./cleanup.sh &

# 启动后端服务
echo "正在启动后端服务..."
./start_backend.sh &

# 等待一小段时间
sleep 1

# 启动前端服务
echo "正在启动前端服务..."
./start_frontend.sh &

# 等待一小段时间
sleep 1

# 启动浏览器
echo "正在准备打开浏览器..."
./open_browser.sh

# 脚本执行完成
echo "脚本执行完成！正在退出..."
sleep 3