// 文件数据服务 - 在浏览器环境中结合使用静态文件和localStorage

const DATA_FILE_PATH = '/src/data/data.json';
const LOCAL_STORAGE_KEY = 'navigator_data';

class FileDataService {
  constructor() {
    this.isDataLoaded = false;
    this.data = null;
  }

  // 初始化数据 - 首先尝试从localStorage加载，如果没有则从文件加载
  async initializeData() {
    // 检查localStorage中是否有数据
    const localStorageData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localStorageData) {
      this.data = JSON.parse(localStorageData);
      this.isDataLoaded = true;
      return this.data;
    }

    // 如果localStorage中没有数据，从文件加载
    try {
      const response = await fetch(DATA_FILE_PATH);
      if (!response.ok) {
        throw new Error(`无法加载数据文件: ${response.status}`);
      }
      this.data = await response.json();
      this.isDataLoaded = true;
      
      // 保存到localStorage以便下次使用
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.data));
      
      return this.data;
    } catch (error) {
      console.error('初始化数据失败:', error);
      // 返回默认数据作为后备
      this.data = this.getDefaultData();
      this.isDataLoaded = true;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.data));
      return this.data;
    }
  }

  // 获取所有数据
  async getAllData() {
    if (!this.isDataLoaded) {
      await this.initializeData();
    }
    return this.data;
  }

  // 保存所有数据到localStorage
  async saveAllData(data) {
    try {
      this.data = data;
      this.isDataLoaded = true;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      console.log('数据已保存到localStorage');
      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      return false;
    }
  }

  // 获取默认数据
  getDefaultData() {
    return {
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
  }

  // 静态方法获取实例
  static getInstance() {
    if (!FileDataService.instance) {
      FileDataService.instance = new FileDataService();
    }
    return FileDataService.instance;
  }
}

export default FileDataService;