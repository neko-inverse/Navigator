<template>
  <div v-if="show" class="edit-form-overlay" @click.self="closeForm">
    <div class="edit-form" @click="handleModalContentClick">
      <div class="form-header">
        <h3>{{ title }}</h3>
        <button @click="closeForm" class="close-btn">&times;</button>
      </div>
      <form @submit.prevent="saveData" class="form-content">
        <div v-if="type === 'category'" class="form-fields">
          <div class="form-group">
            <label for="category-name">分类名称</label>
            <input
              id="category-name"
              v-model="formData.name"
              type="text"
              required
              placeholder="请输入分类名称"
            />
          </div>
          <div class="form-group">
            <label for="category-icon">分类图标</label>
            <input
              id="category-icon"
              v-model="formData.icon"
              type="text"
              placeholder="请输入emoji图标或图片URL"
            />
          </div>
        </div>
        <div v-else-if="type === 'website'" class="form-fields">
          <div class="form-group">
            <label for="website-name">网站名称</label>
            <input
              id="website-name"
              v-model="formData.name"
              type="text"
              required
              placeholder="请输入网站名称"
            />
          </div>
          <div class="form-group">
            <label for="website-url">网站URL</label>
            <input
              id="website-url"
              v-model="formData.url"
              type="url"
              required
              placeholder="请输入网站URL（包含http(s)://）"
            />
          </div>
          <div class="form-group">
            <label for="website-category">所属分类</label>
            <select id="website-category" v-model="formData.categoryId" required>
              <option value="">请选择分类</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="website-icon">网站图标</label>
            <input
              id="website-icon"
              v-model="formData.icon"
              type="text"
              placeholder="请输入图标URL或emoji"
            />
          </div>
        </div>
        <div class="form-actions">
          <button type="button" @click="close" class="cancel-btn">取消</button>
          <button type="submit" class="submit-btn">{{ submitText }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { addCategory, updateCategory, addWebsite, updateWebsite } from '../services/dataService.js';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  },
  type: {
    type: String,
    default: 'category'
  },
  categories: {
    type: Array,
    default: () => []
  },
  selectedCategoryId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

const formData = ref({
  name: '',
  icon: '',
  url: '',
  categoryId: null
});

// 计算表单标题
const title = computed(() => {
  if (props.type === 'category') {
    return props.item && props.item.id ? '编辑分类' : '新建分类';
  } else if (props.type === 'website') {
    return props.item && props.item.id ? '编辑网站' : '新建网站';
  }
  return '编辑项目';
});

// 计算提交按钮文本
const submitText = computed(() => {
  return props.item && props.item.id ? '更新' : '添加';
});

// 监听props变化，更新表单数据
watch(
  () => [props.show, props.item, props.type, props.selectedCategoryId],
  ([show, item, type, selectedCategoryId]) => {
    if (show) {
      // 填充表单数据
      if (type === 'category') {
        formData.value = {
          name: item && item.name || '',
          icon: item && item.icon || ''
        };
      } else if (type === 'website') {
        // 如果是编辑模式，使用item中的分类ID；如果是添加模式且有选中的分类ID，使用选中的分类ID
        const categoryId = item && item.id ? (item.categoryId || '') : (selectedCategoryId || '');
        formData.value = {
          name: item && item.name || '',
          url: item && item.url || '',
          icon: item && item.icon || '',
          categoryId: categoryId
        };
      }
    }
  },
  { immediate: true, deep: true }
);

// 重置表单
const resetForm = () => {
  formData.value = {
    name: '',
    icon: '',
    url: '',
    categoryId: null
  };
};

// 关闭表单
const closeForm = () => {
  resetForm();
  emit('close');
};

// 保存数据
const saveData = async () => {
  try {
    if (props.type === 'category') {
      if (props.item && props.item.id) {
        // 更新分类
        await updateCategory(props.item.id, formData.value);
      } else {
        // 添加分类
        await addCategory(formData.value);
      }
    } else if (props.type === 'website') {
      if (props.item && props.item.id) {
        // 更新网站
        await updateWebsite(props.item.id, formData.value);
      } else {
        // 添加网站
        await addWebsite(formData.value);
      }
    }
    
    // 保存成功后关闭表单
    closeForm();
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败，请重试！');
  }
};

// 阻止点击模态框内容时关闭模态框
const handleModalContentClick = (event) => {
  event.stopPropagation();
};
</script>

<style scoped>
.edit-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.edit-form {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.form-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
}

.form-content {
  padding: 20px;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2196F3;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn {
  background: #f5f5f5;
  color: #333;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.submit-btn {
  background: #2196F3;
  color: white;
}

.submit-btn:hover {
  background: #1976D2;
}

@media (max-width: 640px) {
  .edit-form {
    width: 95%;
    margin: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    width: 100%;
  }
}
</style>