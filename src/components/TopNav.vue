<template>
  <nav class="top-nav">
    <div class="nav-container">
      <!-- 左侧导航 -->
      <div class="nav-left">
        <!-- Logo和首页 -->
        <router-link to="/" class="nav-item nav-home" exact>
          <home-filled class="nav-icon" />
          <span>首页</span>
        </router-link>
        
        <!-- 核心功能：智能行程规划 -->
        <router-link to="/planning" class="nav-item nav-planning" exact>
          <map-icon class="nav-icon" />
          <span>智能行程规划</span>
        </router-link>
        
        <!-- 辅助功能：行程记录管理 -->
        <router-link to="/trips" class="nav-item nav-trips" exact>
          <ticket class="nav-icon" />
          <span>行程记录管理</span>
        </router-link>
      </div>
      
      <!-- 右侧用户区域 -->
      <div class="nav-right">
        <!-- 登录状态 -->
        <div v-if="userStore.isLoggedIn" class="user-info">
          <el-dropdown trigger="click" @command="handleDropdownCommand">
            <div class="user-profile">
              <el-avatar size="small" class="user-avatar">
                {{ getFirstChar(userStore.userInfo.username) }}
              </el-avatar>
              <span class="user-name">{{ userStore.userInfo.username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserInfoStore } from '@/stores/user';
import { 
  HomeFilled, 
  MapLocation as MapIcon, 
  Ticket 
} from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserInfoStore();


// 获取用户名第一个字符作为默认头像
const getFirstChar = (name?: string): string => {
  if (!name) return '游';
  return name.charAt(0);
};

// 处理下拉菜单命令
const handleDropdownCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await userStore.logout();
      router.push('/');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  } else if (command === 'profile') {
    // 可以跳转到个人中心页面
    console.log('跳转到个人中心');
  }
};
</script>

<style scoped>
/* 顶部导航栏主样式 */
.top-nav {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

/* 导航容器 */
.nav-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

/* 左侧导航 */
.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 导航项基础样式 */
.nav-item {
  color: #333;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  padding: 10px 18px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 1px solid transparent;
}

/* 图标样式 - 统一、缩小且美化 */
  .nav-icon {
    font-size: 12px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
    padding: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  /* 首页图标特定样式 */
  .nav-home .nav-icon {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    color: #1890ff;
  }
  
  /* 规划图标特定样式 */
  .nav-planning .nav-icon {
    background: rgba(255, 255, 255, 0.9);
    color: #409eff;
    box-shadow: 0 1px 3px rgba(64, 158, 255, 0.3);
  }
  
  /* 行程图标特定样式 */
  .nav-trips .nav-icon {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    color: #67c23a;
  }

/* 悬停效果 */
.nav-item:hover {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.06);
  transform: translateY(-1px);
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
}

/* 首页导航项 */
.nav-home {
  font-weight: 600;
  color: #333;
}

.nav-home.router-link-active {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.08);
  border-color: rgba(24, 144, 255, 0.2);
}

/* 智能行程规划 - 核心功能突出显示 */
.nav-planning {
  color: #606266;
  font-weight: 500;
}

.nav-planning:hover {
  background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(64, 158, 255, 0.4);
}

.nav-planning.router-link-active {
  font-weight: 600;
  background: linear-gradient(135deg, #409eff 0%, #1890ff 100%);
  color: white;
  box-shadow: 0 3px 8px rgba(64, 158, 255, 0.3);
}

/* 行程记录管理 - 辅助功能 */
.nav-trips {
  color: #606266;
  font-weight: 500;
}

.nav-trips:hover {
  background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(64, 158, 255, 0.4);
}

.nav-trips.router-link-active {
  font-weight: 600;
  background: linear-gradient(135deg, #409eff 0%, #1890ff 100%);
  color: white;
  box-shadow: 0 3px 8px rgba(64, 158, 255, 0.3);
}

/* 右侧用户区域 */
.nav-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 120px;
}

/* 用户信息容器 */
.user-info {
  display: flex;
  align-items: center;
}

/* 用户资料展示 - 精致化设计 */
.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-radius: 28px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid rgba(220, 220, 220, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
}

/* 精致化悬停效果 */
.user-profile:hover {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-color: rgba(64, 158, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.12);
}

/* 用户头像 - 精致化设计 */
.user-avatar {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  border: 2px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1;
}

/* 头像悬停效果 */
.user-profile:hover .user-avatar {
  transform: scale(1.15);
  box-shadow: 0 3px 10px rgba(64, 158, 255, 0.3);
}

/* 头像内部文字 */
.user-avatar::v-deep(.el-avatar__text) {
  font-size: 16px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 用户名 - 精致化设计 */
.user-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s ease;
  position: relative;
}

/* 用户名悬停效果 */
.user-profile:hover .user-name {
  color: #409eff;
}

/* 微妙的装饰元素 */
.user-profile::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 12px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #67c23a;
  transform: translateY(-50%);
  opacity: 0.8;
  transition: all 0.3s ease;
}

/* 悬停时的装饰效果 */
.user-profile:hover::after {
  background: #409eff;
  box-shadow: 0 0 6px rgba(64, 158, 255, 0.6);
}

/* 下拉菜单样式优化 */
:deep(.el-dropdown-menu) {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  background: white;
  overflow: hidden;
}

/* 下拉菜单项样式 */
:deep(.el-dropdown-menu__item) {
  transition: all 0.2s ease;
  border-radius: 0;
  font-size: 14px;
  padding: 10px 20px;
}

/* 下拉菜单项悬停效果 */
:deep(.el-dropdown-menu__item:hover) {
  background-color: #f0f9ff;
  color: #409eff;
}

/* 下拉菜单项禁用状态 */
:deep(.el-dropdown-menu__item.is-disabled) {
  color: #c0c4cc;
}

/* 下拉菜单分隔线 */
:deep(.el-dropdown-menu__divider) {
  margin: 4px 0;
  background-color: #f0f0f0;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
    height: 60px;
  }
  
  .nav-left {
    gap: 8px;
  }
  
  .nav-item {
    font-size: 13px;
    padding: 8px 12px;
    gap: 6px;
  }
  
  .nav-icon {
    font-size: 16px;
  }
  
  .user-name {
    display: none;
  }
  
  .user-profile {
    padding: 4px 8px;
  }
  
  .login-btn {
    padding: 6px 16px;
    font-size: 13px;
  }
  
  /* 在小屏幕上简化核心功能按钮 */
  .nav-planning {
    min-width: 80px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 12px;
  }
  
  .nav-item span {
    display: none;
  }
  
  .nav-item {
    padding: 8px;
    min-width: 40px;
    justify-content: center;
  }
  
  .login-btn span {
    display: none;
  }
  
  .login-btn {
    padding: 8px;
    min-width: 40px;
    justify-content: center;
  }
}
</style>