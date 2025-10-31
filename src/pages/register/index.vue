<template>
  <div class="register-container">
    <div class="register-form">
      <h2 class="register-title">用户注册</h2>
      
      <div class="form-group">
        <label for="username">用户名 *</label>
        <input 
          type="text" 
          id="username" 
          v-model="registerForm.username"
          placeholder="请输入用户名"
          class="form-input"
        />
      </div>
      
      <div class="form-group">
        <label for="password">密码 *</label>
        <input 
          type="password" 
          id="password" 
          v-model="registerForm.password"
          placeholder="请输入密码"
          class="form-input"
        />
      </div>
      
      <div class="form-group">
        <label for="email">邮箱（选填）</label>
        <input 
          type="email" 
          id="email" 
          v-model="registerForm.email"
          placeholder="请输入邮箱地址"
          class="form-input"
        />
      </div>
      
      <div class="form-group">
        <label for="phone">手机号（选填）</label>
        <input 
          type="tel" 
          id="phone" 
          v-model="registerForm.phone"
          placeholder="请输入手机号码"
          class="form-input"
        />
      </div>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <button 
        @click="handleRegister" 
        :disabled="isLoading"
        class="register-button"
      >
        {{ isLoading ? '注册中...' : '注册' }}
      </button>
      
      <div class="login-link">
        已有账号？<a href="/login">立即登录</a>
      </div>
    </div>
    
    <div class="back-home">
      <a href="/" class="back-home-link">暂不登录，返回主页</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/stores/user'
import type { UserRegistrationRequest } from '@/util/interface'

const router = useRouter()
const userStore = useUserInfoStore()

const registerForm = ref<UserRegistrationRequest>({
  username: '',
  password: '',
  email: '',
  phone: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

const handleRegister = async () => {
  // 简单的表单验证
  if (!registerForm.value.username || !registerForm.value.password) {
    errorMessage.value = '用户名和密码不能为空'
    return
  }
  
  // 移除空的可选字段
  const formData = { ...registerForm.value }
  if (!formData.email) delete formData.email
  if (!formData.phone) delete formData.phone
  
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    const result = await userStore.register(formData)
    
    if (result.success) {
      // 注册成功后提示用户并跳转到登录页
      alert('注册成功，请登录')
      await router.push('/login')
    } else {
      errorMessage.value = result.message || '注册失败'
    }
  } catch (error: any) {
    errorMessage.value = error.message || '注册失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  position: relative;
  background-color: #f5f5f5;
}

.register-form {
  background-color: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.register-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #409eff;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
  margin-bottom: 15px;
  text-align: center;
}

.register-button {
  width: 100%;
  padding: 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.register-button:hover:not(:disabled) {
  background-color: #66b1ff;
}

.register-button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #409eff;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
  .back-home {
    position: absolute;
    bottom: 30px;
    right: 30px;
  }
  
  .back-home-link {
    color: #606266;
    text-decoration: none;
    font-size: 14px;
    padding: 8px 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  
  .back-home-link:hover {
    color: #409eff;
    background-color: #ecf5ff;
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
</style>