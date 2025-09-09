// 后端API服务
class ApiDataService {
  constructor() {
    this.apiUrl = 'http://localhost:3001/api';
    this.wsUrl = 'ws://localhost:3001/ws';
    this.ws = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  // 连接WebSocket
  connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve(this.ws);
        return;
      }

      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket连接已建立');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve(this.ws);
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleWebSocketMessage(message);
          } catch (error) {
            console.error('解析WebSocket消息失败:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket连接已关闭');
          this.isConnected = false;
          // 尝试重新连接
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket连接错误:', error);
          this.isConnected = false;
          reject(error);
        };
      } catch (error) {
        console.error('创建WebSocket连接失败:', error);
        this.attemptReconnect();
        reject(error);
      }
    });
  }

  // 尝试重新连接
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
    } else {
      console.error('达到最大重新连接次数，停止尝试');
    }
  }

  // 处理WebSocket消息
  handleWebSocketMessage(message) {
    console.log('接收到WebSocket消息:', message);
    switch (message.type) {
      case 'INITIAL_DATA':
        console.log('处理初始数据消息');
        this.notifyListeners('initial-data', message.data);
        break;
      case 'DATA_UPDATE':
        console.log('处理数据更新消息:', message.data);
        console.log('数据更新消息中的分类数据:', message.data.categories);
        this.notifyListeners('data-update', message.data);
        break;
      default:
        console.log('未知的消息类型:', message.type);
    }
  }

  // 注册事件监听器
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // 移除事件监听器
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 通知所有监听器
  notifyListeners(event, data) {
    console.log(`通知${event}事件的监听器，共${this.listeners.has(event) ? this.listeners.get(event).length : 0}个监听器`);
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback, index) => {
        try {
          console.log(`调用监听器${index + 1}`);
          console.log(`监听器${index + 1}接收到的数据:`, data);
          callback(data);
        } catch (error) {
          console.error(`处理${event}事件失败:`, error);
        }
      });
    }
  }

  // 通过API获取数据
  async fetchData(endpoint, method = 'GET', body = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${this.apiUrl}/${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态码: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`获取${endpoint}数据失败:`, error);
      // 如果API调用失败，返回null，让调用方决定如何处理
      return null;
    }
  }

  // 获取所有数据
  async getAllData() {
    return this.fetchData('data');
  }

  // 保存所有数据
  async saveAllData(data) {
    return this.fetchData('data', 'POST', data);
  }

  // 获取所有分类
  async getCategories() {
    const result = await this.fetchData('categories');
    return result?.categories || [];
  }

  // 获取单个分类
  async getCategory(id) {
    return this.fetchData(`categories/${id}`);
  }

  // 添加分类
  async addCategory(categoryData) {
    const result = await this.fetchData('categories', 'POST', categoryData);
    return result?.category || null;
  }

  // 更新分类
  async updateCategory(id, categoryData) {
    const result = await this.fetchData(`categories/${id}`, 'PUT', categoryData);
    return result?.category || null;
  }

  // 删除分类
  async deleteCategory(id) {
    return this.fetchData(`categories/${id}`, 'DELETE');
  }

  // 获取所有网站
  async getWebsites() {
    const result = await this.fetchData('websites');
    return result?.websites || [];
  }

  // 获取分类下的网站
  async getWebsitesByCategory(categoryId) {
    const result = await this.fetchData(`categories/${categoryId}/websites`);
    return result?.websites || [];
  }

  // 获取单个网站
  async getWebsite(id) {
    return this.fetchData(`websites/${id}`);
  }

  // 添加网站
  async addWebsite(websiteData) {
    const result = await this.fetchData('websites', 'POST', websiteData);
    return result?.website || null;
  }

  // 更新网站
  async updateWebsite(id, websiteData) {
    const result = await this.fetchData(`websites/${id}`, 'PUT', websiteData);
    return result?.website || null;
  }

  // 删除网站
  async deleteWebsite(id) {
    return this.fetchData(`websites/${id}`, 'DELETE');
  }

  // 断开连接
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // 静态方法获取实例
  static getInstance() {
    if (!ApiDataService.instance) {
      ApiDataService.instance = new ApiDataService();
    }
    return ApiDataService.instance;
  }
}

export default ApiDataService;