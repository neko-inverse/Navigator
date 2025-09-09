# 导航应用后端服务

这个后端服务为导航应用提供实时数据同步功能，使用Node.js、Express和WebSocket技术实现。

## 功能特点

- 提供REST API接口，支持分类和网站数据的增删改查
- 使用WebSocket实现数据实时同步，一处修改多处可见
- 数据持久化到文件系统，保证数据不丢失
- 支持多个客户端同时连接，实时接收数据更新

## 技术栈

- Node.js
- Express.js
- WebSocket (express-ws)
- Bun (JavaScript运行时)

## 目录结构

```
backend/
├── package.json      # 项目依赖和脚本
├── server.js         # 服务器主文件
├── start.js          # 启动脚本
├── start.bat         # Windows批处理启动文件
├── README.md         # 项目说明文档
└── data/
    └── appData.json  # 数据存储文件
```

## 安装依赖

在项目根目录下运行：

```bash
cd backend
bun install
```

## 单独启动后端服务

### 使用Bun（推荐）

```bash
cd backend
bun start.js
```

### 使用Windows批处理文件

```bash
cd backend
start.bat
```

## 同时启动前端和后端服务

在项目根目录下运行：

```bash
bun run start
```

## API 接口

### 分类管理

- **获取所有分类**
  - URL: `/api/categories`
  - Method: `GET`
  - Response: `{ "categories": [...] }`

- **添加分类**
  - URL: `/api/categories`
  - Method: `POST`
  - Request Body: `{ "name": "分类名称", "icon": "图标" }`
  - Response: `{ "success": true, "category": {...} }`

- **更新分类**
  - URL: `/api/categories/:id`
  - Method: `PUT`
  - Request Body: `{ "name": "新分类名称", "icon": "新图标" }`
  - Response: `{ "success": true, "category": {...} }`

- **删除分类**
  - URL: `/api/categories/:id`
  - Method: `DELETE`
  - Response: `{ "success": true }`

### 网站管理

- **获取所有网站**
  - URL: `/api/websites`
  - Method: `GET`
  - Response: `{ "websites": [...] }`

- **获取分类下的网站**
  - URL: `/api/categories/:id/websites`
  - Method: `GET`
  - Response: `{ "websites": [...] }`

- **添加网站**
  - URL: `/api/websites`
  - Method: `POST`
  - Request Body: `{ "name": "网站名称", "url": "网站URL", "icon": "图标", "categoryId": "分类ID" }`
  - Response: `{ "success": true, "website": {...} }`

- **更新网站**
  - URL: `/api/websites/:id`
  - Method: `PUT`
  - Request Body: `{ "name": "新网站名称", "url": "新网站URL", "icon": "新图标" }`
  - Response: `{ "success": true, "website": {...} }`

- **删除网站**
  - URL: `/api/websites/:id`
  - Method: `DELETE`
  - Response: `{ "success": true }`

## WebSocket 实时同步

- **连接URL**: `ws://localhost:3000`
- **消息类型**: JSON格式
- **消息示例**: `{ "type": "update", "data": { "categories": [...], "websites": [...] } }`

## 数据结构

### 分类 (Category)

```json
{
  "id": "唯一标识符",
  "name": "分类名称",
  "icon": "分类图标"
}
```

### 网站 (Website)

```json
{
  "id": "唯一标识符",
  "name": "网站名称",
  "url": "网站URL",
  "icon": "网站图标",
  "categoryId": "所属分类ID"
}
```

## 注意事项

1. 确保`data`目录存在，并且服务器有写入权限
2. 默认情况下，服务器监听3000端口
3. 数据文件路径为`./data/appData.json`
4. 当数据发生变更时，服务器会自动保存并通知所有已连接的客户端
5. 如果需要修改服务器配置，可以直接编辑`server.js`文件

## 故障排除

- **端口被占用**: 可以修改`server.js`文件中的`PORT`常量
- **数据文件不存在**: 服务器会自动创建初始数据文件
- **数据同步问题**: 检查WebSocket连接是否正常建立

## 开发说明

- 使用`nodemon`实现代码热重载，修改`server.js`后无需手动重启服务器
- 添加新API端点时，建议遵循现有的错误处理和数据验证模式