// 服务端数据服务 - 用于生产环境

// 注意：在实际生产环境中，这里应该连接到真实的后端 API
// 本文件提供了一个模拟的后端数据服务接口

class ServerDataService {
  constructor() {
    this.baseUrl = process.env.VITE_API_BASE_URL || '/api';
  }

  // 获取所有数据
  async getAllData() {
    try {
      const response = await fetch(`${this.baseUrl}/data`);
      if (response.ok) {
        return await response.json();
      }
      // 如果接口调用失败，使用本地存储的备份数据
      console.warn('使用本地备份数据');
      const localData = localStorage.getItem('navigator_data_backup');
      return localData ? JSON.parse(localData) : null;
    } catch (error) {
      console.error('获取数据失败:', error);
      // 出错时也返回本地备份
      const localData = localStorage.getItem('navigator_data_backup');
      return localData ? JSON.parse(localData) : null;
    }
  }

  // 保存所有数据
  async saveAllData(data) {
    try {
      const response = await fetch(`${this.baseUrl}/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      // 无论如何都备份到本地存储
      localStorage.setItem('navigator_data_backup', JSON.stringify(data));
      
      return response.ok;
    } catch (error) {
      console.error('保存数据失败:', error);
      // 出错时只保存到本地备份
      localStorage.setItem('navigator_data_backup', JSON.stringify(data));
      return false;
    }
  }

  // 获取当前环境下的活跃数据服务
  static getActiveDataService() {
    // 在生产环境中使用服务器数据服务
    // 在开发环境中继续使用 localStorage
    if (import.meta.env.PROD) {
      return new ServerDataService();
    } else {
      return null; // 在非生产环境中返回 null，继续使用 localStorage
    }
  }
}

export default ServerDataService;