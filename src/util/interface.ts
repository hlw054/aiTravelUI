// 用户注册请求接口
export interface UserRegistrationRequest {
  username: string;
  password: string;
  email?: string;
  phone?: string;
}

// 用户登录请求接口
export interface UserLoginRequest {
  username: string;
  password: string;
}