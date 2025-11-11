<script setup lang="ts">
import TopNav from '@/components/TopNav.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <div class="layout-container">
    <!-- 只在非首页页面显示导航栏 -->
    <TopNav v-if="route.path === '/planning'"/>
    <main class="main-container" :class="{ 'has-nav': route.path === '/planning' }">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
}

/* 只在有导航栏的页面添加顶部间距 */
.main-container.has-nav {
  margin-top: 60px; /* 与顶部导航栏高度保持一致 */
}
</style>