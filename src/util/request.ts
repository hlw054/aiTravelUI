import axios, { type AxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios"
import { SERVER_ADDR } from "../config"
import { useUserInfoStore } from '../stores/user'
import router from '../router'
import { ElMessage } from 'element-plus'

// 创建axios实例
const instance = axios.create({
  baseURL: SERVER_ADDR,
  timeout: 5000,
  withCredentials: true
})

// 请求拦截器 - 只创建一次
instance.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    // 如果token存在，添加到请求头
    if (token) {
      config.headers = config.headers || {}
      config.headers['satoken'] = `${token}`
    }
    console.log(config)
    return config;
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error);
  }
);

// 响应拦截器 - 只创建一次
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 处理响应数据
    console.log('response: ' , response)
    const res = response.data
    // 统一处理响应
    if (res.code !== 0) {
      // 这里可以根据业务需求处理不同的错误码
      console.error('接口错误:', res.msg)
      // 检查响应数据中的code字段
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    return res;
  },
  (error: AxiosError) => {
    // 处理401错误（token过期或无效）
    if (error.response && error.response.status === 401) {
      // token失效，进行相应处理，例如跳转到登录页面
      console.log('token 过期')
      const user = useUserInfoStore()
      user.userInfo = null
      user.isLoggedIn = false
      user.token = ''
      localStorage.removeItem('token')
      ElMessage.warning('登录过期')
      router.push('/login')
    }
    console.error('请求失败:', error.message)
    return Promise.reject(error);
  }
);

function request(args: AxiosRequestConfig<any>) {
  return instance.request(args)
}

export { request }