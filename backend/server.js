import express from 'express';
import cors from 'cors';
import expressWs from 'express-ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 处理ES模块的__dirname问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建Express应用
const app = express();
// 添加WebSocket支持
const { app: wsApp } = expressWs(app);

// 配置中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 定义数据文件路径
const DATA_FILE_PATH = path.resolve(__dirname, '../src/data/data.json');

// 确保数据文件存在
const ensureDataFileExists = () => {
  if (!fs.existsSync(DATA_FILE_PATH)) {
    const defaultData = {
      categories: [
        {
          id: '1',
          name: '开发工具',
          icon: '💻'
        },
        {
          id: '2',
          name: '学习资源',
          icon: '📚'
        },
        {
          id: '3',
          name: '社交媒体',
          icon: '📱'
        }
      ],
      websites: [
        {
          id: '1',
          name: 'GitHub',
          url: 'https://github.com',
          categoryId: '1',
          icon: 'https://github.githubassets.com/favicons/favicon.ico'
        },
        {
          id: '2',
          name: 'Stack Overflow',
          url: 'https://stackoverflow.com',
          categoryId: '1',
          icon: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico'
        },
        {
          id: '3',
          name: 'MDN Web Docs',
          url: 'https://developer.mozilla.org',
          categoryId: '2',
          icon: 'https://developer.mozilla.org/favicon.ico'
        }
      ]
    };
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(defaultData, null, 2));
    console.log(`数据文件已创建: ${DATA_FILE_PATH}`);
  }
};

// 初始化数据文件
ensureDataFileExists();

// 存储所有WebSocket连接
const clients = new Set();

// WebSocket连接处理
wsApp.ws('/ws', (ws, req) => {
  console.log('WebSocket客户端已连接');
  clients.add(ws);
  
  // 向新连接的客户端发送当前数据
  try {
    const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    ws.send(JSON.stringify({
      type: 'INITIAL_DATA',
      data: JSON.parse(data)
    }));
  } catch (error) {
    console.error('发送初始数据失败:', error);
  }

  // 监听客户端消息
  ws.on('message', (message) => {
    console.log('接收到消息:', message.toString());
    // 这里可以根据需要处理客户端消息
  });

  // 监听连接关闭
  ws.on('close', () => {
    console.log('WebSocket客户端已断开连接');
    clients.delete(ws);
  });
});

// 广播数据更新给所有客户端
const broadcastUpdate = (data) => {
  const updateMessage = JSON.stringify({
    type: 'DATA_UPDATE',
    data
  });
  
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(updateMessage);
    }
  });
};

// API端点: 获取所有数据
app.get('/api/data', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('读取数据文件失败:', error);
    res.status(500).json({ error: '读取数据失败' });
  }
});

// API端点: 保存所有数据
app.post('/api/data', (req, res) => {
  try {
    const data = req.body;
    // 验证数据格式
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: '无效的数据格式' });
    }
    
    // 写入数据文件
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
    console.log('数据已保存到文件');
    
    // 广播更新给所有客户端
    broadcastUpdate(data);
    
    res.json({ success: true, message: '数据保存成功' });
  } catch (error) {
    console.error('保存数据文件失败:', error);
    res.status(500).json({ error: '保存数据失败' });
  }
});

// API端点: 获取所有分类
app.get('/api/categories', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
    res.json({ categories: data.categories || [] });
  } catch (error) {
    console.error('读取数据失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// API端点: 获取单个分类
app.get('/api/categories/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
    const category = data.categories.find(c => c.id === req.params.id);
    if (!category) {
      return res.status(404).json({ error: '分类不存在' });
    }
    res.json(category);
  } catch (error) {
    console.error('读取数据失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// API端点: 添加分类
app.post('/api/categories', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
    const newCategory = {
      id: Date.now().toString(),
      ...req.body
    };
    data.categories.push(newCategory);
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
    broadcastUpdate(data);
    res.status(201).json({ success: true, category: newCategory });
  } catch (error) {
    console.error('添加分类失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// API端点: 更新分类
app.put('/api/categories/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
    const index = data.categories.findIndex(c => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: '分类不存在' });
    }
    data.categories[index] = {
      ...data.categories[index],
      ...req.body
    };
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
    broadcastUpdate(data);
    res.json({ success: true, category: data.categories[index] });
  } catch (error) {
    console.error('更新分类失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// API端点: 删除分类
app.delete('/api/categories/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
    // 先删除该分类下的所有网站
    data.websites = data.websites.filter(w => w.categoryId !== req.params.id);
    // 再删除分类
    data.categories = data.categories.filter(c => c.id !== req.params.id);
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
    broadcastUpdate(data);
    res.json({ success: true });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// API端点: 获取所有网站
app.get('/api/websites', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
    res.json({ websites: data.websites || [] });
  } catch (error) {
    console.error('读取数据失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// API端点: 获取分类下的网站
app.get('/api/categories/:id/websites', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
    const websites = data.websites.filter(w => w.categoryId === req.params.id);
    res.json({ websites });
  } catch (error) {
    console.error('读取数据失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// API端点: 获取单个网站
app.get('/api/websites/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
    const website = data.websites.find(w => w.id === req.params.id);
    if (!website) {
      return res.status(404).json({ error: '网站不存在' });
    }
    res.json(website);
  } catch (error) {
    console.error('读取数据失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// API端点: 添加网站
app.post('/api/websites', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
    const newWebsite = {
      id: Date.now().toString(),
      ...req.body
    };
    data.websites.push(newWebsite);
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
    broadcastUpdate(data);
    res.status(201).json({ success: true, website: newWebsite });
  } catch (error) {
    console.error('添加网站失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// API端点: 更新网站
app.put('/api/websites/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
    const index = data.websites.findIndex(w => w.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: '网站不存在' });
    }
    data.websites[index] = {
      ...data.websites[index],
      ...req.body
    };
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
    broadcastUpdate(data);
    res.json({ success: true, website: data.websites[index] });
  } catch (error) {
    console.error('更新网站失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// API端点: 删除网站
app.delete('/api/websites/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
    data.websites = data.websites.filter(w => w.id !== req.params.id);
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
    broadcastUpdate(data);
    res.json({ success: true });
  } catch (error) {
    console.error('删除网站失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`后端服务已启动，端口: ${PORT}`);
  console.log(`WebSocket服务: ws://localhost:${PORT}/ws`);
  console.log(`API端点: http://localhost:${PORT}/api`);
});