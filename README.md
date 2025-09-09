# 网站导航应用

一个基于 Vue 3 和 Express 的现代化网站导航应用，支持实时数据同步和分类管理。

## 📋 项目简介

这是一个用于管理和快速访问常用网站的导航应用，具有以下特点：

- 🏷️ 分类管理：创建、编辑、删除网站分类
- 🌐 网站管理：添加、编辑、删除各类网站链接
- ⚡ 实时同步：使用 WebSocket 实现数据变更实时更新
- 📱 响应式设计：适配桌面和移动设备
- 🎨 简洁界面：直观易用的用户界面

## 🛠️ 技术栈

### 前端
- **框架**：Vue 3 + Vite
- **语法**：Composition API + `<script setup>`
- **样式**：原生 CSS
- **路由**：Vue Router
- **构建工具**：Vite

### 后端
- **运行环境**：Node.js
- **Web 框架**：Express
- **WebSocket**：express-ws
- **数据存储**：JSON 文件系统
- **跨域处理**：cors

## 🚀 快速开始

### 环境要求
- Node.js 18+（推荐使用最新 LTS 版本）
- npm、yarn 或 bun（推荐使用 bun 以获得最佳性能）

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
# yarn install

# 或使用 bun
# bun install
```

### 开发模式

启动前端和后端开发服务器：

```bash
# 使用 npm
npm run start

# 或使用 yarn
# yarn start

# 或使用 bun
# bun start
```

Windows 用户可使用专用脚本：

```bash
npm run start:win
```

服务启动后：
- 前端应用访问：`http://localhost:5173`
- 后端 API 访问：`http://localhost:3001/api`
- WebSocket 连接：`ws://localhost:3001/ws`

## 📁 项目结构

```
navigator-app/
├── src/                  # 前端源码
│   ├── components/       # Vue 组件
│   ├── services/         # 数据服务
│   ├── data/             # 数据存储目录
│   ├── assets/           # 静态资源
│   ├── App.vue           # 根组件
│   ├── main.js           # 入口文件
│   └── style.css         # 全局样式
├── backend/              # 后端源码
│   ├── server.js         # 服务器主文件
│   ├── start.js          # 启动脚本
│   └── package.json      # 后端依赖配置
├── index.html            # HTML 入口
├── vite.config.js        # Vite 配置
└── package.json          # 项目配置和依赖
```

## 🔧 功能说明

### 前端核心功能

1. **分类管理**
   - 创建新分类，设置分类名称和图标
   - 编辑现有分类信息
   - 删除分类（会同时删除该分类下的所有网站）

2. **网站管理**
   - 添加新网站，设置名称、URL、所属分类和图标
   - 编辑现有网站信息
   - 删除不需要的网站

3. **数据同步**
   - WebSocket 实时数据更新
   - 自动重连机制确保连接稳定性

### 后端核心功能

1. **RESTful API**
   - 分类 CRUD 操作
   - 网站 CRUD 操作
   - 数据批量获取和保存

2. **WebSocket 服务**
   - 实时数据广播
   - 客户端连接管理
   - 初始数据推送

3. **数据存储**
   - JSON 文件持久化存储
   - 自动创建默认数据

## 📚 API 文档

### 分类 API

- **获取所有分类**
  ```
  GET /api/categories
  ```

- **获取单个分类**
  ```
  GET /api/categories/:id
  ```

- **创建分类**
  ```
  POST /api/categories
  Body: { name: string, icon: string }
  ```

- **更新分类**
  ```
  PUT /api/categories/:id
  Body: { name: string, icon: string }
  ```

- **删除分类**
  ```
  DELETE /api/categories/:id
  ```

### 网站 API

- **获取所有网站**
  ```
  GET /api/websites
  ```

- **获取单个网站**
  ```
  GET /api/websites/:id
  ```

- **获取分类下的网站**
  ```
  GET /api/categories/:id/websites
  ```

- **创建网站**
  ```
  POST /api/websites
  Body: { name: string, url: string, categoryId: string, icon: string }
  ```

- **更新网站**
  ```
  PUT /api/websites/:id
  Body: { name: string, url: string, categoryId: string, icon: string }
  ```

- **删除网站**
  ```
  DELETE /api/websites/:id
  ```

### 数据 API

- **获取所有数据**
  ```
  GET /api/data
  ```

- **保存所有数据**
  ```
  POST /api/data
  Body: { categories: [...], websites: [...] }
  ```

## 📱 WebSocket 通信

应用使用 WebSocket 实现实时数据更新，主要消息类型包括：

- **INITIAL_DATA**：连接建立时发送的初始数据
- **DATA_UPDATE**：数据变更时广播的更新消息

## 🔐 数据安全

- 本应用为本地开发和个人使用设计
- 数据存储在本地 JSON 文件中
- 如需部署到生产环境，请考虑添加适当的身份验证和授权机制

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 发起 Pull Request

## 📄 许可证

MIT License

## 💡 开发提示

- 数据存储在 `src/data/data.json` 文件中
- 后端服务默认监听 3001 端口
- 前端开发服务器默认监听 5173 端口
- 可通过修改 `apiDataService.js` 中的配置来更改 API 和 WebSocket 地址

## 📞 联系我们

如有任何问题或建议，请提交 Issue 或联系项目维护者。
