// 数据服务 - 处理分类和导航网站的数据存储与管理

import ApiDataService from './apiDataService';

const apiService = ApiDataService.getInstance();
const dataUpdateCallbacks = new Set();

// 初始化WebSocket连接
export function initializeService() {
  return apiService.connect().then(() => {
    // 注册数据更新监听器
    apiService.on('data-update', (updatedData) => {
      // 通知所有注册的回调函数
      dataUpdateCallbacks.forEach(callback => {
        try {
          callback(updatedData);
        } catch (error) {
          console.error('执行数据更新回调失败:', error);
        }
      });
    });
    return true;
  }).catch(error => {
    console.error('初始化服务失败:', error);
    return false;
  });
}

// 添加数据更新回调
export function setupDataUpdateCallback(callback) {
  if (typeof callback === 'function') {
    dataUpdateCallbacks.add(callback);
    console.log(`添加了一个数据更新回调，当前共有${dataUpdateCallbacks.size}个回调`);
  }
}

// 移除数据更新回调
export function removeDataUpdateCallback(callback) {
  if (callback) {
    dataUpdateCallbacks.delete(callback);
    console.log(`移除了一个数据更新回调，当前共有${dataUpdateCallbacks.size}个回调`);
  }
}

// 获取所有数据
export async function getAllData() {
  return apiService.getAllData();
}

// 保存所有数据
export async function saveAllData(data) {
  return apiService.saveAllData(data);
}

// 添加分类
export async function addCategory(category) {
  try {
    const result = await apiService.addCategory(category);
    if (!result) {
      throw new Error('添加分类失败');
    }
    return result;
  } catch (error) {
    console.error('添加分类失败:', error);
    throw error;
  }
}

// 更新分类
export async function updateCategory(id, categoryData) {
  try {
    const result = await apiService.updateCategory(id, categoryData);
    if (!result) {
      throw new Error('更新分类失败');
    }
    return result;
  } catch (error) {
    console.error('更新分类失败:', error);
    throw error;
  }
}

// 删除分类
export async function deleteCategory(id) {
  try {
    const result = await apiService.deleteCategory(id);
    if (!result) {
      throw new Error('删除分类失败');
    }
    return id;
  } catch (error) {
    console.error('删除分类失败:', error);
    throw error;
  }
}

// 添加网站
export async function addWebsite(website) {
  try {
    const result = await apiService.addWebsite(website);
    if (!result) {
      throw new Error('添加网站失败');
    }
    return result;
  } catch (error) {
    console.error('添加网站失败:', error);
    throw error;
  }
}

// 更新网站
export async function updateWebsite(id, websiteData) {
  try {
    // 检查网站是否存在
    const existingWebsite = await getWebsite(id);
    if (!existingWebsite) {
      throw new Error('网站不存在');
    }
    
    const result = await apiService.updateWebsite(id, websiteData);
    if (!result) {
      throw new Error('更新网站失败');
    }
    return result;
  } catch (error) {
    console.error('更新网站失败:', error);
    throw error;
  }
}

// 删除网站
export async function deleteWebsite(id) {
  try {
    const result = await apiService.deleteWebsite(id);
    if (!result) {
      throw new Error('删除网站失败');
    }
    return id;
  } catch (error) {
    console.error('删除网站失败:', error);
    throw error;
  }
}

// 获取所有分类
export async function getCategories() {
  try {
    return await apiService.getCategories();
  } catch (error) {
    console.error('获取分类失败:', error);
    throw error;
  }
}

// 获取单个分类
export async function getCategory(id) {
  try {
    const category = await apiService.getCategory(id);
    if (!category) {
      throw new Error('分类不存在');
    }
    return category;
  } catch (error) {
    console.error('获取分类失败:', error);
    throw error;
  }
}

// 获取所有网站
export async function getWebsites() {
  try {
    return await apiService.getWebsites();
  } catch (error) {
    console.error('获取网站失败:', error);
    throw error;
  }
}

// 获取分类下的网站
export async function getWebsitesByCategory(categoryId) {
  try {
    return await apiService.getWebsitesByCategory(categoryId);
  } catch (error) {
    console.error('获取分类下网站失败:', error);
    throw error;
  }
}

// 获取单个网站
export async function getWebsite(id) {
  try {
    const website = await apiService.getWebsite(id);
    if (!website) {
      throw new Error('网站不存在');
    }
    return website;
  } catch (error) {
    console.error('获取网站失败:', error);
    throw error;
  }
}