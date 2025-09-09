<template>
  <div class="category-section">
    <div class="category-header">
      <h2 class="category-title">
        <span class="category-icon">{{ category.icon }}</span>
        {{ category.name }}
      </h2>
      <div class="category-actions" v-if="editable">
        <button @click="addWebsiteToCategory" class="add-website-btn">
          添加网站
        </button>
        <button @click="editCategory" class="edit-category-btn">
          编辑分类
        </button>
        <button @click="deleteCategory" class="delete-category-btn">
          删除分类
        </button>
      </div>
    </div>
    <div class="websites-grid">
      <WebsiteCard
        v-for="website in websites"
        :key="website.id"
        :website="website"
        :editable="editable"
        @edit="editWebsite"
        @delete="deleteWebsite"
      />
      <div v-if="websites.length === 0" class="empty-state">
        暂无网站，点击"添加网站"开始添加
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import WebsiteCard from './WebsiteCard.vue';
import { getWebsitesByCategory, setupDataUpdateCallback, removeDataUpdateCallback } from '../services/dataService.js';

// 定义组件属性
const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  }
});

// 定义组件事件
const emit = defineEmits(['add-website', 'edit-category', 'delete-category', 'edit-website', 'delete-website']);

// 分类下的网站列表
const websites = ref([]);

// 加载分类下的网站
const loadWebsites = async () => {
  try {
    websites.value = await getWebsitesByCategory(props.category.id);
  } catch (error) {
    console.error('加载网站失败:', error);
    // 保持现有数据或使用空数组
    websites.value = [];
  }
};

// 添加网站到分类
const addWebsiteToCategory = () => {
  emit('add-website', props.category.id);
};

// 编辑分类
const editCategory = () => {
  emit('edit-category', props.category);
};

// 删除分类
const deleteCategory = () => {
  const userConfirmed = window.confirm(`确定要删除分类"${props.category.name}"吗？这将同时删除该分类下的所有网站。`);
  if (userConfirmed) {
    emit('delete-category', props.category.id);
  }
};

// 编辑网站
const editWebsite = (website) => {
  emit('edit-website', website);
};

// 删除网站
const deleteWebsite = (websiteId) => {
  const userConfirmed = window.confirm('确定要删除这个网站吗？');
  if (userConfirmed) {
    emit('delete-website', websiteId);
  }
};

// 定义数据更新回调函数
const handleDataUpdate = () => {
  loadWebsites();
};

// 初始加载
onMounted(async () => {
  await loadWebsites();
  
  // 设置数据更新回调，当数据变化时重新加载网站
  setupDataUpdateCallback(handleDataUpdate);
});

// 组件卸载时移除回调，避免内存泄漏
onUnmounted(() => {
  removeDataUpdateCallback(handleDataUpdate);
});

// 监听分类ID变化
watch(() => props.category.id, async () => {
  await loadWebsites();
});
</script>

<style scoped>
.category-section {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.category-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  font-size: 24px;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.category-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-website-btn {
  background: #2196F3;
  color: white;
}

.add-website-btn:hover {
  background: #1976D2;
}

.edit-category-btn {
  background: #FF9800;
  color: white;
}

.edit-category-btn:hover {
  background: #F57C00;
}

.delete-category-btn {
  background: #f44336;
  color: white;
}

.delete-category-btn:hover {
  background: #da190b;
}

.websites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-style: italic;
}

@media (max-width: 640px) {
  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .category-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .category-actions button {
    flex: 1;
    min-width: 80px;
  }
  
  .websites-grid {
    grid-template-columns: 1fr;
  }
}
</style>