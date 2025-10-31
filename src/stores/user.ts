import { defineStore } from 'pinia'
import { request } from "@/util/request"
import type { UserLoginRequest, UserRegistrationRequest } from "@/util/interface"

export const useUserInfoStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    isLoggedIn: false,
    token: localStorage.getItem('token') || ''
  }),
  
  actions: {
    // 用户登录
    async login(userData: UserLoginRequest){
      return request({
        url: '/users/login',
        method: 'POST',
        data: userData
      }).then((res) => {
        // 保存token到localStorage和状态
        const { token, user } = res.data
        console.log(res.data)
        localStorage.setItem('token', token)
        this.token = token
        this.userInfo = user
        this.isLoggedIn = true
        
        return { success: true }
      }).catch((error) => {
        console.error('登录失败:', error)
        return { success: false, message: error.message || '登录失败' }
      })
    },
    
    // 用户注册
    async register(userData: UserRegistrationRequest){
      return request({
        url: '/users/register',
        method: 'POST',
        data: userData
      }).then((res) => {
        return { success: true }
      }).catch((error) => {
        console.error('注册失败:', error)
        return { success: false, message: error.message || '注册失败' }
      })
    },
    
    // 用户登出
    async logout(){
      request({
        url: '/users/logout',
        method: 'POST'
      }).then((res) => {
        // 成功回调
      }).catch((error) => {
        console.error('登出失败:', error)
      }).finally(() => {
        // 清除本地状态和token
        this.clearUserInfo()
      })
    },
    // 清除用户信息
    clearUserInfo(){
      localStorage.removeItem('token')
      this.token = ''
      this.userInfo = null
      this.isLoggedIn = false
    }
  },
  persist: true
})
