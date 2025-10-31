import { createRouter, createWebHistory} from 'vue-router'
import { setupLayouts } from "virtual:generated-layouts"
import generatedRoutes from 'virtual:generated-pages'
import { useUserInfoStore } from '@/stores/user'

generatedRoutes.push(
    // {
    //   path: '/',
    //   name: 'home',
    //   component: () => import('../views/HomeView.vue')
    // },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // }
)
// 合并生成的路由

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(generatedRoutes)
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserInfoStore()

  // 检查是否需要登录的路由（这里可以根据实际需求修改规则）
  const requiresAuth = !to.path.startsWith('/login') &&
                      !to.path.startsWith('/register') &&
                      to.path !== '/'

  // 如果路由需要认证但用户未登录，重定向到登录页
  if (requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
