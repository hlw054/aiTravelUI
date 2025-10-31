<template>
  <div class="home-container">
    <div class="home-header">
      <h1 class="app-title">AI旅行规划师</h1>
      <p class="app-subtitle">2025最新智能旅行体验</p>
    </div>
    
    <div class="home-content">
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h2>探索世界，从这里开始</h2>
            <p>2025年，我们的AI技术全新升级，能够实时分析全球旅游热点、预测人流、智能优化路线，为您打造个性化的完美旅程。</p>
            <div class="action-buttons">
              <el-button type="primary" size="large" @click="startPlanning">开始规划</el-button>
            </div>
            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-number">100万+</span>
                <span class="stat-text">用户信赖</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">200+</span>
                <span class="stat-text">国家覆盖</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">98%</span>
                <span class="stat-text">用户好评</span>
              </div>
            </div>
          </div>
          
          <!-- 用户卡片/登录卡片 -->
          <div v-if="userStore.isLoggedIn && userStore.userInfo" class="user-profile-card">
            <el-avatar class="user-avatar" :size="100">
              {{ userStore.userInfo.username.charAt(0).toUpperCase() }}
            </el-avatar>
            <h3 class="user-welcome">欢迎回来</h3>
            <p class="user-name">{{ userStore.userInfo.username }}</p>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-number">0</span>
                <span class="stat-text">已规划行程</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">0</span>
                <span class="stat-text">收藏目的地</span>
              </div>
            </div>
            <div class="user-actions">
              <el-button type="primary" size="large" @click="startPlanning">我的旅行</el-button>
              <el-button size="large" @click="logout" style="margin-left: 0">退出登录</el-button>
            </div>
          </div>
          <div v-else class="login-card">
            <div class="login-card-header">
              <h3>立即登录，开启个性化旅程</h3>
              <p>登录后可享受AI智能规划、行程保存等专属服务</p>
            </div>
            <div class="login-buttons">
              <el-button type="primary" size="large" @click="router.push('/login')">登录</el-button>
              <el-button size="large" @click="router.push('/register')" style="margin-left: 0">注册</el-button>
            </div>
            <div class="login-features">
              <div class="feature-item">
                <el-icon><Calendar /></el-icon>
                <span>行程云端同步</span>
              </div>
              <div class="feature-item">
                <el-icon><Wallet /></el-icon>
                <span>智能预算管理</span>
              </div>
              <div class="feature-item">
                <el-icon><Star /></el-icon>
                <span>个性化推荐</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="features-section">
        <h3>2025年全新功能</h3>
        <div class="features-grid">
          <div class="feature-card">
            <el-icon class="feature-icon"><Location /></el-icon>
            <h4>智能目的地推荐</h4>
            <p>基于AI大模型和实时数据，精准推荐符合您喜好的全球目的地，避开人群享受独特体验</p>
          </div>
          <div class="feature-card">
            <el-icon class="feature-icon"><Calendar /></el-icon>
            <h4>行程自动规划</h4>
            <p>一键生成AI优化的详细行程，包含最佳游玩时间、交通方案和个性化推荐</p>
          </div>
          <div class="feature-card">
            <el-icon class="feature-icon"><Wallet /></el-icon>
            <h4>预算智能管理</h4>
            <p>2025年最新汇率实时计算，智能预算分配和省钱建议，让每一分钱都花在刀刃上</p>
          </div>
        </div>
      </div>
      
      <div class="trending-destinations">
        <h3>2025年热门中国目的地</h3>
        <div class="destinations-grid">
          <div class="destination-card">
            <div class="destination-image"></div>
            <div class="destination-info">
              <h4>北京</h4>
              <p>领略千年古都魅力，探索故宫与长城的壮丽</p>
              <span class="popularity-tag">超热门</span>
            </div>
          </div>
          <div class="destination-card">
            <div class="destination-image"></div>
            <div class="destination-info">
              <h4>上海</h4>
              <p>体验国际大都市的繁华与现代建筑奇观</p>
              <span class="popularity-tag">超热门</span>
            </div>
          </div>
          <div class="destination-card">
            <div class="destination-image"></div>
            <div class="destination-info">
              <h4>杭州</h4>
              <p>漫步西湖，感受江南水乡的诗情画意</p>
              <span class="popularity-tag">推荐</span>
            </div>
          </div>
          <div class="destination-card">
            <div class="destination-image"></div>
            <div class="destination-info">
              <h4>成都</h4>
              <p>品味地道川菜，与可爱的大熊猫亲密接触</p>
              <span class="popularity-tag">新兴</span>
            </div>
          </div>
          <div class="destination-card">
            <div class="destination-image"></div>
            <div class="destination-info">
              <h4>三亚</h4>
              <p>享受阳光沙滩，体验热带海岛度假天堂</p>
              <span class="popularity-tag">推荐</span>
            </div>
          </div>
          <div class="destination-card">
            <div class="destination-image"></div>
            <div class="destination-info">
              <h4>西安</h4>
              <p>探寻秦朝兵马俑，追溯中华文明的起源</p>
              <span class="popularity-tag">推荐</span>
            </div>
          </div>
          <div class="destination-card">
            <div class="destination-image"></div>
            <div class="destination-info">
              <h4>张家界</h4>
              <p>欣赏壮观的石英砂岩峰林，体验阿凡达取景地</p>
              <span class="popularity-tag">新兴</span>
            </div>
          </div>
          <div class="destination-card">
            <div class="destination-image"></div>
            <div class="destination-info">
              <h4>厦门</h4>
              <p>漫步鼓浪屿，感受闽南风情与海滨浪漫</p>
              <span class="popularity-tag">推荐</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="testimonials-section">
        <h3>用户真实评价</h3>
        <div class="testimonials-slider">
          <div class="testimonial-item">
            <div class="rating"><el-icon><StarFilled /></el-icon><el-icon><StarFilled /></el-icon><el-icon><StarFilled /></el-icon><el-icon><StarFilled /></el-icon><el-icon><StarFilled /></el-icon></div>
            <p class="testimonial-text">"AI旅行规划师为我规划的北京五日游太棒了！避开了旺季人流高峰，还推荐了很多当地人常去的隐藏美食，故宫和长城的体验非常棒！"</p>
            <p class="testimonial-author">— 李先生</p>
          </div>
          <div class="testimonial-item">
            <div class="rating"><el-icon><StarFilled /></el-icon><el-icon><StarFilled /></el-icon><el-icon><StarFilled /></el-icon><el-icon><StarFilled /></el-icon><el-icon><StarFilled /></el-icon></div>
            <p class="testimonial-text">"用这个AI工具规划的杭州西湖之旅太贴心了，根据天气实时调整路线，还找到了最佳摄影点，拍出了很多令人惊艳的照片！"</p>
            <p class="testimonial-author">— 赵女士</p>
          </div>
          <div class="testimonial-item">
            <div class="rating"><el-icon><StarFilled /></el-icon><el-icon><StarFilled /></el-icon><el-icon><StarFilled /></el-icon><el-icon><StarFilled /></el-icon><el-icon><StarFilled /></el-icon></div>
            <p class="testimonial-text">"成都之行多亏了AI旅行规划师，不仅找到了最正宗的川菜馆，还提前预约了大熊猫基地的参观，行程安排得恰到好处！"</p>
            <p class="testimonial-author">— 陈先生</p>
          </div>
        </div>
      </div>
      
      <div class="faq-section">
        <h3>常见问题</h3>
        <div class="faq-list">
          <div class="faq-item">
            <div class="faq-question">AI旅行规划师如何保证行程的个性化？</div>
            <div class="faq-answer">我们的系统基于您的兴趣偏好、旅行风格、预算等多维度数据，结合2025年最新的AI算法，为您量身定制独一无二的旅行计划。</div>
          </div>
          <div class="faq-item">
            <div class="faq-question">是否支持实时调整行程？</div>
            <div class="faq-answer">是的，您可以随时在旅行过程中根据实际情况调整行程，系统会智能地重新规划后续安排。</div>
          </div>
          <div class="faq-item">
            <div class="faq-question">如何保障用户数据安全？</div>
            <div class="faq-answer">我们采用2025年最新的加密技术和隐私保护措施，确保您的个人信息和旅行数据得到最高级别的安全保障。</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="home-footer">
      <div class="footer-content">
        <div class="footer-logo">
          <h2>AI旅行规划师</h2>
          <p>2025年最智能的旅行助手</p>
        </div>
        <div class="footer-links">
          <a href="#">关于我们</a>
          <a href="#">服务条款</a>
          <a href="#">隐私政策</a>
          <a href="#">联系我们</a>
        </div>
        <div class="footer-social">
          <a href="#"><el-icon><Message /></el-icon></a>
            <a href="#"><el-icon><Share /></el-icon></a>
            <a href="#"><el-icon><Star /></el-icon></a>
            <a href="#"><el-icon><StarFilled /></el-icon></a>
        </div>
      </div>
      <p>&copy; 2025 AI旅行规划师. 保留所有权利。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/stores/user'
import { MapLocation, Location, Calendar, Wallet, Message, Share, Star, StarFilled } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserInfoStore()

const startPlanning = () => {
  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    router.push('/login')
  } else {
    // 跳转到规划页面或执行其他操作
    router.push('/planning') // 跳转到实际的规划页面
  }
}

const logout = () => {
  // 调用用户存储中的退出登录方法
  userStore.logout()
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.home-header {
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: white;
  padding: 2rem 0;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.app-title {
  font-size: 2.5rem;
  margin: 0;
  font-weight: 600;
}

.app-subtitle {
  font-size: 1.2rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
}

.home-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.hero-section {
  background: white;
  border-radius: 12px;
  margin-bottom: 3rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 30%;
  height: 100%;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
  z-index: 0;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-text {
  padding: 3rem;
  flex: 1;
  min-width: 300px;
  position: relative;
}

.hero-text h2 {
  font-size: 2.2rem;
  color: #303133;
  margin-bottom: 1rem;
}

.hero-text p {
  font-size: 1.1rem;
  color: #606266;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.hero-stats {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 0.5rem;
}

.stat-text {
  color: #606266;
  font-size: 0.9rem;
}

.hero-image {
  flex: 1;
  min-width: 300px;
  margin-top: 2rem;
  position: relative;
  z-index: 1;
}

.placeholder-image {
  width: 100%;
  height: 350px;
  background-color: #ecf5ff;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 5rem;
  color: #409eff;
  position: relative;
  overflow: hidden;
}

.placeholder-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(64, 158, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(64, 158, 255, 0.2) 50%, rgba(64, 158, 255, 0.2) 75%, transparent 75%, transparent);
  background-size: 20px 20px;
  opacity: 0.3;
}

.features-section {
  margin-bottom: 3rem;
}

.features-section h3 {
  text-align: center;
  font-size: 1.8rem;
  color: #303133;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 1rem;
}

.features-section h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, #409eff, #67c23a);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-top: 3px solid transparent;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  border-top-color: #409eff;
}

.feature-icon {
  font-size: 3rem;
  color: #409eff;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #ecf5ff;
  border-radius: 50%;
  display: inline-block;
}

.feature-card h4 {
  font-size: 1.3rem;
  color: #303133;
  margin-bottom: 0.8rem;
}

.feature-card p {
  color: #606266;
  line-height: 1.7;
}

.trending-destinations {
  margin-bottom: 3rem;
}

.trending-destinations h3 {
  text-align: center;
  font-size: 1.8rem;
  color: #303133;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 1rem;
}

.trending-destinations h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, #409eff, #67c23a);
}

.destinations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.destination-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.destination-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.destination-image {
  height: 200px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  position: relative;
  overflow: hidden;
}

.destination-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%);
}

.destination-info {
  padding: 1.5rem;
  position: relative;
}

.destination-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #303133;
}

.destination-info p {
  margin: 0 0 1rem 0;
  color: #606266;
  font-size: 0.95rem;
}

.popularity-tag {
  display: inline-block;
  padding: 0.3rem 0;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.popularity-tag[class*="超热门"] {
  background: #fef0f0;
  color: #f56c6c;
}

.popularity-tag[class*="推荐"] {
  background: #ecf5ff;
  color: #409eff;
}

.popularity-tag[class*="新兴"] {
  background: #f0f9eb;
  color: #67c23a;
}

.testimonials-section {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  margin-bottom: 3rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.testimonials-section h3 {
  text-align: center;
  font-size: 1.8rem;
  color: #303133;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 1rem;
}

.testimonials-section h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, #409eff, #67c23a);
}

.testimonials-slider {
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  scrollbar-width: thin;
  scrollbar-color: #409eff #f5f7fa;
}

.testimonials-slider::-webkit-scrollbar {
  height: 6px;
}

.testimonials-slider::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 3px;
}

.testimonials-slider::-webkit-scrollbar-thumb {
  background: #409eff;
  border-radius: 3px;
}

.testimonial-item {
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  position: relative;
}

.testimonial-item::before {
  content: '"';
  position: absolute;
  top: 0.5rem;
  left: 1rem;
  font-size: 4rem;
  color: rgba(64, 158, 255, 0.1);
  font-family: serif;
}

.rating {
  color: #f7ba1e;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.testimonial-text {
  color: #606266;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  padding-left: 1rem;
  position: relative;
  z-index: 1;
}

.testimonial-author {
  color: #303133;
  font-weight: 600;
  text-align: right;
  font-size: 1rem;
}

.faq-section {
  margin-bottom: 3rem;
  background: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.faq-section h3 {
  text-align: center;
  font-size: 1.8rem;
  color: #303133;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 1rem;
}

.faq-section h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, #409eff, #67c23a);
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.faq-item {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 1.5rem;
}

.faq-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.faq-question {
  font-size: 1.1rem;
  color: #303133;
  font-weight: 500;
  margin-bottom: 0.8rem;
  cursor: pointer;
  transition: color 0.3s ease;
  position: relative;
  padding-left: 1.5rem;
}

.faq-question::before {
  content: 'Q:';
  position: absolute;
  left: 0;
  color: #409eff;
  font-weight: bold;
}

.faq-question:hover {
  color: #409eff;
}

.faq-answer {
  color: #606266;
  line-height: 1.7;
  position: relative;
  padding-left: 1.5rem;
}

.faq-answer::before {
  content: 'A:';
  position: absolute;
  left: 0;
  color: #67c23a;
  font-weight: bold;
}

.home-footer {
  background: #303133;
  color: white;
  padding: 3rem 2rem 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2rem;
}

.footer-logo {
  flex: 1;
  min-width: 200px;
}

.footer-logo h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.footer-logo p {
  margin: 0;
  opacity: 0.7;
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
}

.footer-links a {
  color: white;
  text-decoration: none;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.footer-links a:hover {
  opacity: 1;
}

.footer-social {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.footer-social a {
  color: white;
  font-size: 1.2rem;
  opacity: 0.7;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.footer-social a:hover {
  opacity: 1;
  transform: translateY(-3px);
}

.home-footer > p {
  margin: 0;
  opacity: 0.5;
  text-align: center;
  font-size: 0.9rem;
}

/* 用户资料卡片样式 */
.user-profile-card {
  background: transparent;
  padding: 1rem 5.7rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 250px;
}

.user-avatar {
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #409eff, #67c23a);
  font-size: 2.5rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.user-welcome {
  color: #303133;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.user-name {
  color: #303133;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.user-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  width: 100%;
}

/* 登录引导卡片样式 */
.login-card {
  background: transparent;
  padding: 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.login-card-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-card-header h3 {
  color: #303133;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.login-card-header p {
  color: #606266;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
}

.login-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  max-width: 250px;
}

.login-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  width: 100%;
  max-width: 250px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #303133;
  font-size: 0.95rem;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
}

.feature-item el-icon {
  color: #303133;
  font-size: 1.1rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .home-content {
    padding: 1rem;
  }
  
  .hero-section {
    padding: 2rem;
    flex-direction: column;
    text-align: center;
  }
  
  .hero-text {
    margin-right: 0;
    margin-bottom: 2rem;
  }
  
  .action-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .hero-stats {
    justify-content: center;
  }
  
  .features-grid,
  .destinations-grid {
    grid-template-columns: 1fr;
  }
  
  .testimonials-section,
  .faq-section {
    padding: 2rem 1rem;
  }
  
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-links {
    justify-content: center;
  }
  
  .footer-social {
    justify-content: center;
  }
  
  .user-profile-card,
  .login-card {
    width: 100%;
  }
}
</style>