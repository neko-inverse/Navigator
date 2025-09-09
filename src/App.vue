<template>
  <div class="app">
    <!-- 头部 -->
    <header class="app-header">
      <h1 class="app-title">网站导航</h1>
      <div class="header-actions">
        <button @click="toggleEditMode" class="edit-mode-btn">
          {{ editMode ? '退出编辑' : '编辑模式' }}
        </button>
        <button v-if="editMode" @click="showAddCategoryForm = true" class="add-category-btn">
          添加分类
        </button>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="app-main">
      <div v-if="categories.length === 0" class="empty-state">
        <p>暂无分类，点击"添加分类"开始创建您的导航页</p>
        <button @click="showAddCategoryForm = true" class="get-started-btn">开始使用</button>
      </div>
      <div v-else class="categories-container">
        <CategorySection
          v-for="category in categories"
          :key="category.id"
          :category="category"
          :editable="editMode"
          @add-website="handleAddWebsite"
          @edit-category="handleEditCategory"
          @delete-category="handleDeleteCategory"
          @edit-website="handleEditWebsite"
          @delete-website="handleDeleteWebsite"
        />
      </div>
    </main>

    <!-- 底部 -->
    <footer class="app-footer">
      <p>网站导航 © {{ new Date().getFullYear() }}</p>
    </footer>

    <!-- 编辑表单 -->
    <EditForm
      :show="showAddCategoryForm || showEditCategoryForm"
      type="category"
      :item="editingCategory || {}"
      @close="closeCategoryForm"
    />
    <EditForm
      :show="showAddWebsiteForm || showEditWebsiteForm"
      type="website"
      :item="editingWebsite || {}"
      :categories="categories"
      :selected-category-id="selectedCategoryId"
      @close="closeWebsiteForm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import CategorySection from './components/CategorySection.vue';
import EditForm from './components/EditForm.vue';
import { 
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  addWebsite,
  updateWebsite,
  deleteWebsite,
  setupDataUpdateCallback,
  initializeService
} from './services/dataService.js';

// 状态
const categories = ref([]);
const editMode = ref(false);
const showAddCategoryForm = ref(false);
const showEditCategoryForm = ref(false);
const showAddWebsiteForm = ref(false);
const showEditWebsiteForm = ref(false);
const editingCategory = ref(null);
const editingWebsite = ref(null);
const selectedCategoryId = ref('');

// 加载分类
const loadCategories = async () => {
  try {
    categories.value = await getCategories();
  } catch (error) {
    console.error('加载分类失败:', error);
    // 即使出错，也可以使用默认数据或保持现有数据
  }
};

// 数据更新回调函数
const handleDataUpdate = async (updatedData) => {
  console.log('接收到数据更新:', updatedData);
  // 直接使用接收到的更新数据，避免再次请求
  if (updatedData && updatedData.categories) {
    categories.value = updatedData.categories;
  } else {
    // 如果没有直接提供分类数据，则重新加载
    await loadCategories();
  }
};

// 切换编辑模式
const toggleEditMode = () => {
  editMode.value = !editMode.value;
};

// 添加分类
const handleAddCategory = () => {
  showAddCategoryForm.value = true;
  showEditCategoryForm.value = false;
  editingCategory.value = null;
};

// 编辑分类
const handleEditCategory = (category) => {
  showEditCategoryForm.value = true;
  showAddCategoryForm.value = false;
  editingCategory.value = { ...category };
};

// 删除分类
const handleDeleteCategory = async (categoryId) => {
  try {
    await deleteCategory(categoryId);
    await loadCategories();
  } catch (error) {
    console.error('删除分类失败:', error);
    alert('删除分类失败，请重试');
  }
};

// 添加网站
const handleAddWebsite = (categoryId) => {
  showAddWebsiteForm.value = true;
  showEditWebsiteForm.value = false;
  editingWebsite.value = null;
  selectedCategoryId.value = categoryId;
};

// 编辑网站
const handleEditWebsite = (website) => {
  showEditWebsiteForm.value = true;
  showAddWebsiteForm.value = false;
  editingWebsite.value = { ...website };
};

// 删除网站
const handleDeleteWebsite = async (websiteId) => {
  try {
    await deleteWebsite(websiteId);
    await loadCategories(); // 重新加载以更新视图
  } catch (error) {
    console.error('删除网站失败:', error);
    alert('删除网站失败，请重试');
  }
};

// 关闭分类表单
const closeCategoryForm = () => {
  showAddCategoryForm.value = false;
  showEditCategoryForm.value = false;
  editingCategory.value = null;
};

// 关闭网站表单
const closeWebsiteForm = () => {
  showAddWebsiteForm.value = false;
  showEditWebsiteForm.value = false;
  editingWebsite.value = null;
  selectedCategoryId.value = '';
};



// 初始加载
onMounted(async () => {
  // 初始化数据服务
  const initialized = await initializeService();
  if (!initialized) {
    console.warn('WebSocket连接失败，将使用HTTP API');
  }
  
  // 先设置数据更新回调，确保能捕获任何更新
  setupDataUpdateCallback(handleDataUpdate);
  
  // 然后加载初始数据
  await loadCategories();
});
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.app-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.edit-mode-btn,
.add-category-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-mode-btn {
  background: #f5f5f5;
  color: #333;
}

.edit-mode-btn:hover {
  background: #e0e0e0;
}

.add-category-btn {
  background: #4CAF50;
  color: white;
}

.add-category-btn:hover {
  background: #45a049;
}

.app-main {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.get-started-btn {
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.get-started-btn:hover {
  background: #1976D2;
}

.categories-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.app-footer {
  background: white;
  padding: 16px 24px;
  text-align: center;
  color: #666;
  border-top: 1px solid #eee;
}

.app-footer p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .app-header {
    padding: 12px 16px;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .app-title {
    text-align: center;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .app-main {
    padding: 16px;
  }
}
</style>
