<template>
  <div class="website-card">
    <a :href="website.url" target="_blank" rel="noopener noreferrer" class="card-link">
      <div class="card-icon">
        <img :src="website.icon" :alt="website.name" v-if="website.icon && website.icon.startsWith('http')">
        <span v-else>{{ website.icon || '🔗' }}</span>
      </div>
      <div class="card-info">
        <h3 class="card-title">{{ website.name }}</h3>
        <p class="card-url">{{ formatUrl(website.url) }}</p>
      </div>
    </a>
    <div class="card-actions" v-if="editable">
      <button @click="editWebsite" class="action-btn edit-btn">编辑</button>
      <button @click="deleteWebsite" class="action-btn delete-btn">删除</button>
    </div>
  </div>
</template>

<script setup>
// defineProps 和 defineEmits 是 Vue 3 的编译器宏，不需要显式导入

// 定义组件属性
const props = defineProps({
  website: {
    type: Object,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  }
});

// 定义组件事件
const emit = defineEmits(['edit', 'delete']);

// 格式化URL显示
const formatUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

// 编辑网站
const editWebsite = () => {
  emit('edit', props.website);
};

// 删除网站
const deleteWebsite = () => {
  emit('delete', props.website.id);
};
</script>

<style scoped>
.website-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.website-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  margin-right: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.card-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-icon span {
  font-size: 24px;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-url {
  margin: 0;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.website-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-btn {
  background: #4CAF50;
  color: white;
}

.edit-btn:hover {
  background: #45a049;
}

.delete-btn {
  background: #f44336;
  color: white;
}

.delete-btn:hover {
  background: #da190b;
}

@media (max-width: 640px) {
  .website-card {
    padding: 12px;
  }
  
  .card-icon {
    width: 36px;
    height: 36px;
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .card-actions {
    opacity: 1;
  }
}
</style>