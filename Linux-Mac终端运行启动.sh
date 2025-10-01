#!/bin/bash

# 设置中文显示
export LANG="zh_CN.UTF-8"
export LC_ALL="zh_CN.UTF-8"

# 打印欢迎信息
clear
echo "======================================================================="
echo "                         Linux-Mac终端运行启动"
echo "======================================================================="
echo "此脚本将帮助您完成以下操作："
echo "1. 自动检测并安装Node.js环境（如需）"
echo "2. 自动检测并安装Bun.js环境（如需，提高性能）"
echo "3. 设置npm/Bun镜像源（淘宝）以提高安装速度和稳定性"
echo "4. 安装前端项目依赖（优先使用Bun）"
echo "5. 安装后端项目依赖（优先使用Bun）"
echo "6. 启动后端服务（优先使用Bun）"
echo "7. 启动前端服务（优先使用Bun）"
echo "8. 自动打开浏览器访问前端页面"

echo "正在准备环境..."

# 检查并安装Node.js
install_nodejs() {
    echo "未检测到Node.js，正在自动安装..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # Mac OS
        if command -v brew &> /dev/null; then
            echo "使用Homebrew安装Node.js..."
            brew install node
        else
            echo "未找到Homebrew，正在安装Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            echo "使用Homebrew安装Node.js..."
            brew install node
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt &> /dev/null; then
            # Ubuntu/Debian
            echo "使用apt安装Node.js..."
            sudo apt update
            sudo apt install -y nodejs npm
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            echo "使用yum安装Node.js..."
            sudo yum install -y nodejs npm
        elif command -v dnf &> /dev/null; then
            # Fedora
            echo "使用dnf安装Node.js..."
            sudo dnf install -y nodejs npm
        elif command -v pacman &> /dev/null; then
            # Arch Linux
            echo "使用pacman安装Node.js..."
            sudo pacman -Syu --noconfirm nodejs npm
        else
            echo "无法识别的Linux发行版，尝试手动安装Node.js..."
            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
    fi
    
    # 验证安装
    if command -v node &> /dev/null; then
        echo "Node.js安装成功！"
    else
        echo "错误：Node.js安装失败，请手动安装。"
        echo "您可以从官网下载安装：https://nodejs.org/"
        read -p "按Enter键退出..."
        exit 1
    fi
}

# 检查并安装Bun.js
install_bunjs() {
    echo "未检测到Bun.js，正在自动安装..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # Mac OS
        curl -fsSL https://bun.sh/install | bash
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://bun.sh/install | bash
    fi
    
    # 添加Bun到PATH（临时）
    export PATH="$HOME/.bun/bin:$PATH"
    
    # 验证安装
    if command -v bun &> /dev/null; then
        echo "Bun.js安装成功！"
    else
        echo "警告：Bun.js安装失败，将使用npm。"
    fi
}

# 检查是否安装了Node.js
echo "检查Node.js安装情况..."
if ! command -v node &> /dev/null
then
    install_nodejs
else
    echo "已检测到Node.js"
fi

# 检查是否安装了npm
echo "检查npm安装情况..."
if ! command -v npm &> /dev/null
then
    echo "未检测到npm，正在安装..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install npm
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt &> /dev/null; then
            sudo apt install -y npm
        elif command -v yum &> /dev/null; then
            sudo yum install -y npm
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y npm
        elif command -v pacman &> /dev/null; then
            sudo pacman -Syu --noconfirm npm
        fi
    fi
    if command -v npm &> /dev/null; then
        echo "npm安装成功！"
    else
        echo "错误：npm安装失败，请手动安装。"
        read -p "按Enter键退出..."
        exit 1
    fi
else
    echo "已检测到npm"
fi

# 检查是否安装了Bun.js
echo "检查Bun.js安装情况..."
if ! command -v bun &> /dev/null
then
    install_bunjs
else
    echo "已检测到Bun.js"
fi

# 设置npm/Bun镜像源
echo "设置npm/Bun镜像源为淘宝镜像..."
npm config set registry https://registry.npmmirror.com/
echo "npm镜像源已设置为淘宝镜像：https://registry.npmmirror.com/"

# 如果有Bun，设置Bun镜像源
if command -v bun &> /dev/null
then
    echo "设置Bun镜像源为淘宝镜像..."
    bun config set registry https://registry.npmmirror.com/
echo "Bun镜像源已设置为淘宝镜像：https://registry.npmmirror.com/"
fi

# 安装前端依赖
echo "======================================================================="
echo "正在安装前端项目依赖..."
echo "======================================================================="

# 优先使用Bun安装依赖
if command -v bun &> /dev/null
then
    echo "使用Bun安装前端依赖..."
    bun install
    bun_install_status=$?
    
    if [ $bun_install_status -ne 0 ]
    then
        echo "Bun安装前端依赖失败，尝试使用npm安装..."
        npm install
        if [ $? -ne 0 ]
        then
            echo "错误：前端依赖安装失败，请检查网络连接或稍后重试。"
            read -p "按Enter键退出..."
            exit 1
        fi
    fi
else
    # 使用npm安装
    npm install
    if [ $? -ne 0 ]
    then
        echo "错误：前端依赖安装失败，请检查网络连接或稍后重试。"
        read -p "按Enter键退出..."
        exit 1
    fi
fi
echo "前端依赖安装完成！"

# 切换到后端目录并安装依赖
echo "======================================================================="
echo "正在安装后端项目依赖..."
echo "======================================================================="
cd backend

# 优先使用Bun安装依赖
if command -v bun &> /dev/null
then
    echo "使用Bun安装后端依赖..."
    bun install
    bun_install_status=$?
    
    if [ $bun_install_status -ne 0 ]
    then
        echo "Bun安装后端依赖失败，尝试使用npm安装..."
        npm install
        if [ $? -ne 0 ]
        then
            echo "错误：后端依赖安装失败，请检查网络连接或稍后重试。"
            cd ..
            read -p "按Enter键退出..."
            exit 1
        fi
    fi
else
    # 使用npm安装
    npm install
    if [ $? -ne 0 ]
    then
        echo "错误：后端依赖安装失败，请检查网络连接或稍后重试。"
        cd ..
        read -p "按Enter键退出..."
        exit 1
    fi
fi
echo "后端依赖安装完成！"

# 切换回项目根目录
cd ..

# 创建启动后端的临时脚本
cat > start_backend.sh << EOF
#!/bin/bash
echo "正在启动后端服务..."
cd backend
# 优先使用Bun启动服务
if command -v bun &> /dev/null
then
    echo "使用Bun启动后端服务（性能更佳）..."
    bun run start
else
    echo "使用npm启动后端服务..."
    npm run start
fi
EOF
chmod +x start_backend.sh

# 创建启动前端的临时脚本
cat > start_frontend.sh << EOF
#!/bin/bash
echo "正在启动前端服务..."
echo "等待后端服务启动..."
sleep 3
# 优先使用Bun启动服务
if command -v bun &> /dev/null
then
    echo "使用Bun启动前端服务（性能更佳）..."
    bun run dev
else
    echo "使用npm启动前端服务..."
    npm run dev
fi
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