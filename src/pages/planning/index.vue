<template>
  <div class="planning-page">
    <!-- 页面头部标题区域 -->
    <div class="page-header">
      <h1 class="header-title">个性化旅行规划师</h1>
      <p class="header-subtitle">根据您的喜好，为您打造完美的旅行体验</p>
    </div>

    <!-- 上部区域：行程条件输入区 -->
    <div class="top-section">
      <!-- 左侧 - 地图预览区 -->
      <div class="map-preview-area">
        <GaodeMap 
          ref="mapRef"
          :center="mapCenter" 
          :zoom="mapZoom"
          :markers="mapMarkers"
          :paths="mapPaths"
          @map-ready="handleMapReady"
          @click="handleMapClick"
        />
      </div>

      <!-- 右侧 - 输入面板 -->
      <div class="input-panel">
        <h2>智能旅行规划</h2>

        <!-- 输入方式切换 -->
        <div class="input-type-switch">
          <el-radio-group v-model="activeInputType" size="large" class="switch-group">
            <el-radio-button label="form" class="switch-button">表单输入</el-radio-button>
            <el-radio-button label="voice" class="switch-button">语音输入</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 表单输入模式 -->
        <div v-if="activeInputType === 'form'" class="input-content form-input">
          <el-form :model="formData" label-width="80px" class="travel-form">
            <el-form-item label="目的地" prop="destination" :rules="[{ required: true, message: '请输入目的地', trigger: 'blur' }]">
              <el-input v-model="formData.destination" placeholder="请输入目的地" class="form-input-field" />
            </el-form-item>

            <el-form-item label="出行日期" prop="dateRange" :rules="[{ required: true, message: '请选择日期范围', trigger: 'change' }]">
              <el-date-picker
                v-model="formData.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="form-input-field"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="总预算" prop="budget" :rules="[{ required: true, message: '请输入总预算', trigger: 'blur' }]">
              <el-input-number
                v-model="formData.budget"
                placeholder="请输入预算金额"
                :min="1"
                :step="100"
                prefix-icon="el-icon-money"
                class="form-input-field"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="同行人数" prop="peopleCount" :rules="[{ required: true, message: '请输入同行人数', trigger: 'blur' }]">
              <el-input-number
                v-model="formData.peopleCount"
                :min="1"
                :max="20"
                placeholder="同行人数"
                class="form-input-field"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="旅行偏好" prop="preferences" :rules="[{ required: true, message: '请选择至少一项旅行偏好', trigger: 'change' }]">
              <el-select
                v-model="formData.preferences"
                multiple
                placeholder="请选择旅行偏好"
                class="form-input-field"
                style="width: 100%"
              >
                <el-option label="美食" value="food" />
                <el-option label="购物" value="shopping" />
                <el-option label="自然风光" value="nature" />
                <el-option label="历史文化" value="culture" />
                <el-option label="亲子家庭" value="family" />
                <el-option label="动漫圣地" value="anime" />
                <el-option label="刺激冒险" value="adventure" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="特殊要求" prop="specialRequests" class="special-requests-item">
              <el-input
                v-model="formData.specialRequests"
                type="textarea"
                :rows="3"
                placeholder="请输入特殊要求或备注（可选）"
                resize="none"
                class="form-input-field special-requests-input"
              />
              <div class="special-requests-tip">您可以在这里添加任何特殊要求，如饮食限制、无障碍需求等</div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 语音输入模式 -->
        <div v-else class="input-content voice-input">
          <div class="voice-input-container">
            <!-- 待机状态 -->
            <div v-if="voiceStatus === 'idle'" class="voice-idle-state">
              <div class="voice-icon idle-icon">🎤</div>
              <h4 class="voice-state-title">语音输入助手</h4>
              <p class="voice-tip">点击下方麦克风按钮开始说话，清晰描述您的旅行需求</p>
              <div class="voice-example-container">
                <p class="voice-example-label">示例:</p>
                <p class="voice-example-text">"我想去东京，5天，预算10000元，喜欢美食和动漫，2人同行"</p>
              </div>
            </div>

            <!-- 录音中状态 -->
            <div v-else-if="voiceStatus === 'recording'" class="voice-recording-state">
              <div class="recording-animation">
                <div class="pulse-circle"></div>
                <div class="pulse-circle pulse-medium"></div>
                <div class="pulse-circle pulse-large"></div>
              </div>
              <h4 class="voice-state-title recording-title">正在聆听...</h4>
              <p class="recording-tip">请清晰描述您的旅行目的地、天数、预算和偏好等信息</p>
            </div>

            <!-- 完成状态 -->
            <div v-else-if="voiceStatus === 'completed'" class="voice-completed-state" style="width: 80%">
              <div style="display: flex;align-items: center">
                <div class="completed-icon">✓</div>
                <h4 class="voice-state-title completed-title">识别完成！</h4>
              </div>
              <el-input
                v-model="voiceText"
                type="textarea"
                :rows="4"
                class="recognized-text-input"
                placeholder="请检查并修改识别结果"
              ></el-input>
              <p class="completed-tip">确认无误后，点击下方按钮生成行程</p>
            </div>
          </div>
        </div>

        <!-- 生成按钮 -->
        <div class="generate-button-container">
          <el-button
            v-if="activeInputType === 'voice' && voiceStatus === 'recording'"
            type="danger"
            size="large"
            @click="toggleVoiceRecording"
            class="stop-button"
          >
            <el-icon><Close /></el-icon>
            停止录音
          </el-button>

          <el-button
            v-else
            :type="activeInputType === 'voice' ? 'primary' : 'primary'"
            size="large"
            @click="handleButtonClick"
            :disabled="activeInputType === 'voice' ? false : !canGenerate"
            class="action-button"
          >
            <template v-if="activeInputType === 'voice'">
              <el-icon v-if="voiceStatus === 'idle'">
                <Microphone /></el-icon>
              <el-icon v-else>
                <MagicStick /></el-icon>
              {{ voiceStatus === 'idle' ? '开始录音' : '智能生成行程' }}
            </template>
            <template v-else>
              <el-icon><MagicStick /></el-icon>
              智能生成行程
            </template>
          </el-button>
          
          <!-- 重新录音按钮，仅在语音识别完成状态显示 -->
          <el-button
            v-if="activeInputType === 'voice' && voiceStatus === 'completed'"
            size="large"
            @click="resetVoiceRecording"
            class="action-button ml-2"
          >
            <el-icon><Refresh /></el-icon>
            重新录音
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 下部区域：行程生成展示区 -->
    <div class="bottom-section">
      <!-- 初始状态占位 -->
      <div v-if="!showResult" class="result-placeholder">
        <h3>填写您的旅行需求并点击「智能生成行程」按钮</h3>
        <p>我们将为您创建个性化的旅行计划</p>
      </div>

      <!-- 行程生成结果（默认隐藏） -->
      <div v-else class="result-container">
        <div class="result-layout">
          <!-- 左侧 - 行程总览面板 -->
          <div class="itinerary-overview-panel">
            <h3 class="overview-title">行程总览</h3>

            <!-- 基本信息卡片 -->
            <div class="overview-cards">
              <div class="overview-card">
                <div class="card-icon calendar">📅</div>
                <div class="card-content">
                  <div class="card-label">总天数</div>
                  <div class="card-value">{{ itineraryData.totalDays }}天</div>
                </div>
              </div>
              <div class="overview-card">
                <div class="card-icon money">💰</div>
                <div class="card-content">
                  <div class="card-label">总预算</div>
                  <div class="card-value">¥{{ itineraryData.totalBudget.toLocaleString() }}</div>
                </div>
              </div>
              <div class="overview-card">
                <div class="card-icon person">👥</div>
                <div class="card-content">
                  <div class="card-label">人均预算</div>
                  <div class="card-value">¥{{ (itineraryData.totalBudget / itineraryData.peopleCount).toLocaleString() }}</div>
                </div>
              </div>
            </div>

            <!-- 费用分布环形图 -->
            <div class="expense-distribution">
              <h4 class="section-title">费用预估分布</h4>
              <div class="expense-chart">
                <div class="donut-chart">
                  <div class="donut-inner">
                    <div class="donut-percentage">100%</div>
                    <div class="donut-label">总支出</div>
                  </div>
                </div>
              </div>
              <div class="expense-legend">
                <div v-for="(item, index) in itineraryData.expenseDistribution" :key="index" class="legend-item">
                  <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
                  <div class="legend-label">{{ item.category }}</div>
                  <div class="legend-value">¥{{ item.amount.toLocaleString() }} ({{ item.percentage }}%)</div>
                </div>
              </div>
            </div>

            <!-- AI生成提示 -->
            <div class="ai-generated-notice">
              <div class="notice-icon">🤖</div>
              <div class="notice-content">
                <p class="notice-text">本行程由AI智能生成，仅供参考</p>
                <p class="notice-subtext">您可以根据实际情况灵活调整行程安排</p>
              </div>
            </div>
          </div>
          <!-- 右侧 - 行程可视化区 -->
          <div class="itinerary-visualization">
            <h3 class="visualization-title">每日行程安排</h3>
            <!-- 分页式日期导航 -->
            <div class="date-navigation-paginated">
              <div class="date-navigation-controls">
                <div style="display: flex;align-items: center;margin-left: 40px">
                  <el-button
                    icon="ArrowLeft"
                    size="small"
                    :disabled="currentPage <= 1"
                    @click="currentPage = currentPage - 1"
                    class="nav-control-button"
                    style="margin-right: 15px"
                  ></el-button>

                  <el-radio-group v-model="selectedDay" size="small" class="day-tabs">
                    <el-radio-button
                      v-for="index in currentPageDays"
                      :key="index"
                      :label="index"
                      class="day-tab-button"
                    >
                      第{{ index + 1 }}天
                    </el-radio-button>
                  </el-radio-group>

                  <el-button
                    icon="ArrowRight"
                    size="small"
                    :disabled="currentPage >= totalPages"
                    @click="currentPage = currentPage + 1"
                    class="nav-control-button"
                    style="margin-left: 15px"
                  ></el-button>
                </div>
                
                <div class="page-indicator">
                  <span>{{ currentPage }} / {{ totalPages }}</span>
                </div>
              </div>
            </div>

            <!-- 每日行程时间轴 -->
            <div class="day-timeline">
              <div v-for="(activity, index) in currentDayActivities" :key="index" class="timeline-item">
                <div class="timeline-left">
                    <div class="timeline-time">{{ activity.time }}</div>
                    <div class="timeline-connector"></div>
                  </div>
                <div class="timeline-middle">
                  <div :class="['timeline-node', activity.type]">
                    <span class="node-icon">{{ getActivityIcon(activity.type) }}</span>
                  </div>
                </div>
                <div class="timeline-right">
                    <div class="activity-card" :class="{ 'transport-card': activity.type === 'transport' }">
                    <div class="activity-header">
                      <h4 class="activity-name">{{ activity.name }}</h4>
                      <span class="activity-cost">¥{{ activity.cost.toLocaleString() }}</span>
                    </div>
                    <p class="activity-description">{{ activity.description }}</p>
                    <div class="activity-footer">
                      <span class="activity-duration">预计时长：{{ activity.duration }}</span>
                    </div>
                    
                    <!-- 交通信息增强显示 -->
                    <div class="transport-info" v-if="activity.transportInfo && activity.transportInfo.from && activity.transportInfo.to">
                      <div class="transport-route">
                        <div class="route-item">
                          <span class="route-label">出发地：</span>
                          <span class="route-value">{{ activity.transportInfo.from }}</span>
                        </div>
                        <div class="route-arrow">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M5.5 12.5L10.5 8L5.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </div>
                        <div class="route-item">
                          <span class="route-label">目的地：</span>
                          <span class="route-value">{{ activity.transportInfo.to }}</span>
                        </div>
                      </div>
                      <div class="transport-details" v-if="activity.transportInfo.mode">
                        <span class="transport-mode">{{ activity.transportInfo.mode }}出行</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 全局遮罩层和Loading状态 -->
  <div v-if="isLoading" class="global-loading-mask">
    <div class="loading-content">
      <el-loading type="spinner" color="#1890ff" :fullscreen="false" />
      <h3>正在为您生成个性化旅行计划</h3>
      <p class="waiting-time">已等待 {{ formatTime(waitingTime) }}</p>
      <p class="loading-tip">根据您的需求定制专属行程，请稍候...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Microphone, MagicStick, Close, Loading } from '@element-plus/icons-vue';
import { request } from '../../util/request';



// 控制是否显示行程结果
const showResult = ref(false);

// 控制是否显示loading状态
const isLoading = ref(false);

// 等待时间倒计时（秒）
const waitingTime = ref(0);

// 倒计时计时器
let countdownTimer = null;

// 输入方式 - 默认使用语音输入模式
const activeInputType = ref<'form' | 'voice'>('form');

// 表单数据
const formData = reactive({
  destination: '',
  dateRange: null as [Date, Date] | null,
  budget: null as number | null,
  peopleCount: null as number | null,
  preferences: [] as string[],
  specialRequests: ''
});

// 语音输入状态
const voiceStatus = ref<'idle' | 'recording' | 'completed'>('idle');
const voiceText = ref('');

// 计算是否可以生成行程（表单验证）
const canGenerate = computed(() => {
  // 表单模式：验证所有表单字段
  if (activeInputType.value === 'form') {
    return (
      formData.destination?.trim() !== '' &&
      formData.dateRange !== null &&
      formData.budget !== null &&
      formData.peopleCount !== null &&
      formData.preferences.length > 0
    );
  }
  // 语音模式：只要语音识别完成且有内容就可以生成
  else if (activeInputType.value === 'voice') {
    return voiceStatus.value === 'completed' && voiceText.value.trim() !== '';
  }
  return false;
});

// 初始化SpeechRecognition实例
let recognition = null;

// 检查浏览器支持
const checkBrowserSupport = () => {
  // 使用Web Speech API的SpeechRecognition接口
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return !!SpeechRecognition;
};

// 格式化等待时间（秒转为分:秒）
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 初始化语音识别
const initSpeechRecognition = () => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    ElMessage.error('您的浏览器不支持语音识别功能，请使用Chrome或Edge浏览器');
    return null;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false; // 识别一次就结束
  recognition.interimResults = false; // 不返回临时结果
  recognition.lang = 'zh-CN'; // 设置为中文

  // 识别开始事件
  recognition.onstart = () => {
    ElMessage.info('语音识别已启动，请清晰地说出您的旅行需求...');
  };

  // 获得识别结果事件
  recognition.onresult = (event: any) => {
    const result = event.results[0][0].transcript;
    voiceText.value = result;
    voiceStatus.value = 'completed';
    ElMessage.success('语音识别完成');
  };

  // 识别结束事件
  recognition.onend = () => {
  };

  // 识别错误事件
  recognition.onerror = (event: any) => {
    console.error('语音识别错误:', event.error);
    voiceStatus.value = 'idle';
    if (event.error === 'no-speech' || event.error === 'audio-capture') {
      ElMessage.warning('未检测到语音，请检查麦克风权限');
    } else {
      ElMessage.error('语音识别出错，请重试');
    }
  };

  return recognition;
};

// 切换语音录制状态
const toggleVoiceRecording = () => {
  if (voiceStatus.value === 'recording' && recognition) {
    // 停止录音
    recognition.stop();
  } else if (voiceStatus.value === 'completed') {
    // 重置语音状态，准备重新开始
    voiceStatus.value = 'idle';
    voiceText.value = '';
  } else {
    // 检查浏览器支持
    if (!checkBrowserSupport()) {
      ElMessage.error('您的浏览器不支持语音识别功能，请使用Chrome或Edge浏览器');
      return;
    }

    // 请求麦克风权限
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        // 开始录音
        voiceStatus.value = 'recording';
        voiceText.value = '';
        
        // 初始化并启动语音识别
        recognition = initSpeechRecognition();
        if (recognition) {
          recognition.start();
        }
      })
      .catch(err => {
        console.error('麦克风权限错误:', err);
        ElMessage.error('需要麦克风权限才能使用语音识别功能');
        voiceStatus.value = 'idle';
      });
  }
};

// 处理按钮点击事件
const handleButtonClick = () => {
  // 在语音输入模式且状态非completed时切换录音状态，其他情况生成行程
  if (activeInputType.value === 'voice' && voiceStatus.value !== 'completed') {
    toggleVoiceRecording();
  } else {
    generateItinerary();
  }
};

// 重置语音状态，回到初始录音阶段
const resetVoiceRecording = () => {
  // 停止当前的语音识别（如果正在运行）
  if (recognition && (voiceStatus.value === 'recording')) {
    recognition.stop();
  }
  
  // 重置状态变量
  voiceStatus.value = 'idle';
  voiceText.value = '';
  recognition = null;
  
  console.log('语音状态已重置，可以重新开始录音');
};

// 获取语音按钮文本
const getButtonText = () => {
  switch (voiceStatus.value) {
    case 'idle':
      return '开始语音输入';
    case 'recording':
      return '停止录音';
    case 'completed':
      return '重新开始';
    default:
      return '开始语音输入';
  }
};

// 模拟行程数据生成函数
const generateItineraryData = () => {
  const destination = formData.destination || '东京';
  const days = formData.dateRange ? Math.ceil((formData.dateRange[1].getTime() - formData.dateRange[0].getTime()) / (1000 * 60 * 60 * 24)) + 1 : 3;
  const budget = formData.budget || 10000;
  const peopleCount = formData.peopleCount || 2;
  const preferences = formData.preferences.length > 0 ? formData.preferences : ['美食', '动漫', '购物'];

  // 基于目的地和偏好生成行程
  const destinationThemes = {
    '东京': ['东京塔', '浅草寺', '秋叶原', '明治神宫', '银座', '涩谷', '新宿'],
    '大阪': ['大阪城', '道顿堀', '环球影城', '奈良公园', '心斋桥'],
    '北京': ['故宫', '长城', '颐和园', '天坛', '王府井'],
    '上海': ['外滩', '东方明珠', '迪士尼', '南京路', '豫园']
  };

  const availableThemes = destinationThemes[destination] || destinationThemes['东京'];
  const budgetDistribution = {
    '住宿': 0.4 * budget,
    '餐饮': 0.25 * budget,
    '交通': 0.15 * budget,
    '门票': 0.12 * budget,
    '购物': 0.08 * budget
  };

  // 生成每日行程
  const dailyItineraries = [];
  for (let day = 1; day <= days; day++) {
    const activities = [];

    // 第一天包含酒店入住
    if (day === 1) {
      activities.push({
        id: `day${day}-1`,
        name: `${destination}酒店入住`,
        type: 'hotel',
        time: '10:00',
        duration: '30分钟',
        description: `在${destination}市中心的高级酒店办理入住手续`,
        cost: Math.round(budgetDistribution['住宿'] / days)
      });
    }

    // 根据天数生成不同数量的活动
    const activitiesPerDay = day === days ? 3 : 4;
    const startHour = day === 1 ? 12 : 9;

    for (let i = 0; i < activitiesPerDay; i++) {
      const baseId = day === 1 ? i + 2 : i + 1;
      const hour = (startHour + Math.floor(i * 2.5)).toString().padStart(2, '0');
      const minute = (i % 2 === 0 ? '00' : '30');

      // 根据偏好选择活动类型
      let type = 'attraction';
      let name = '';
      let description = '';
      let cost = 0;

      if (day === days && i === activitiesPerDay - 1) {
        // 最后一天最后一项是返程
        type = 'transport';
        name = '机场返程';
        description = `乘坐机场快线前往${destination}国际机场`;
        cost = Math.round(budgetDistribution['交通'] / 2);
      } else if (i % 4 === 1) {
        // 每四项中的第二项是餐饮
        type = 'restaurant';
        name = `${destination}特色餐厅`;
        description = `品尝正宗${destination}料理，体验当地美食文化`;
        cost = Math.round(budgetDistribution['餐饮'] / days);
      } else if (preferences.includes('购物') && i % 4 === 2) {
        // 购物偏好且每四项中的第三项是购物
        type = 'shopping';
        name = `${destination}购物区`;
        description = `体验${destination}购物氛围，购买特色商品和纪念品`;
        cost = Math.round(budgetDistribution['购物'] / days);
      } else {
        // 其他情况是景点
        type = 'attraction';
        // 从可用主题中选择，避免重复
        const themeIndex = ((day - 1) * activitiesPerDay + i) % availableThemes.length;
        name = availableThemes[themeIndex];
        description = `参观${destination}著名景点${name}，感受当地文化氛围`;
        cost = Math.round(budgetDistribution['门票'] / (days * 2));
      }

      // 最后一天的倒数第二项是特色活动
      if (day === days && i === activitiesPerDay - 2) {
        type = 'shopping';
        name = '特色伴手礼购买';
        description = `为亲友选购${destination}特色伴手礼和纪念品`;
        cost = Math.round(budgetDistribution['购物'] / days * 1.5);
      }

      // 添加活动
      activities.push({
        id: `day${day}-${baseId}`,
        name: name,
        type: type,
        time: `${hour}:${minute}`,
        duration: i % 4 === 1 ? '90分钟' : '120分钟', // 餐饮90分钟，其他120分钟
        description: description,
        cost: cost,
        // 添加前一个活动的交通信息
        transportFromPrevious: i > 0 && day === 1 ? {
          duration: Math.floor(Math.random() * 20) + 15 + '分钟', // 15-35分钟
          cost: Math.floor(Math.random() * 20) + 10,
          mode: ['地铁', '出租车', '公交'][Math.floor(Math.random() * 3)]
        } : null
      });
    }

    // 如果不是最后一天，添加返回酒店的交通
    if (day < days) {
      activities.push({
        id: `day${day}-return`,
        name: '返回酒店休息',
        type: 'transport',
        time: '18:30',
        duration: '45分钟',
        description: '乘坐地铁或出租车返回酒店休息',
        cost: Math.round(budgetDistribution['交通'] / (days * 3))
      });
    }

    // 为第二天及以后的活动添加交通信息
    if (day > 1) {
      for (let i = 1; i < activities.length; i++) {
        if (activities[i].type !== 'transport') {
          activities[i].transportFromPrevious = {
            duration: Math.floor(Math.random() * 20) + 15 + '分钟', // 15-35分钟
            cost: Math.floor(Math.random() * 20) + 10,
            mode: ['地铁', '出租车', '公交', '步行'][Math.floor(Math.random() * 4)]
          };
        }
      }
    }
    
    dailyItineraries.push({
      day: day,
      activities: activities
    });
  }

  return {
    destination,
    totalDays: days,
    totalBudget: budget,
    peopleCount,
    preferences: preferences.map(pref => {
      const prefMap = {
        'food': '美食',
        'shopping': '购物',
        'nature': '自然风光',
        'culture': '历史文化',
        'family': '亲子家庭',
        'anime': '动漫圣地',
        'adventure': '刺激冒险'
      };
      return prefMap[pref] || pref;
    }),
    expenseDistribution: [
      { category: '住宿', amount: budgetDistribution['住宿'], percentage: 40, color: '#409eff' },
      { category: '餐饮', amount: budgetDistribution['餐饮'], percentage: 25, color: '#67c23a' },
      { category: '交通', amount: budgetDistribution['交通'], percentage: 15, color: '#e6a23c' },
      { category: '门票', amount: budgetDistribution['门票'], percentage: 12, color: '#f56c6c' },
      { category: '购物', amount: budgetDistribution['购物'], percentage: 8, color: '#909399' }
    ],
    dailyItineraries
  };
};

// 引入高德地图组件
import GaodeMap from '../../components/GaodeMap.vue';

// 地图相关状态
const mapRef = ref<any>(null);
const mapCenter = ref<[number, number]>([116.404, 39.915]); // 默认北京
const mapZoom = ref<number>(12);
const mapMarkers = ref<Array<{
  position: [number, number];
  title?: string;
  content?: string;
}>>([
]);
const mapPaths = ref<Array<[number, number]>>([
]);

// 地图就绪回调
const handleMapReady = (map: any) => {
  console.log('地图已就绪');
  // 地图加载完成后，可以调整视图以显示所有标记点
  if (mapRef.value) {
    mapRef.value.setFitView();
  }
};

// 处理地图点击事件
const handleMapClick = async (event: any) => {
  console.log('地图被点击:', event);
  const { lnglat } = event;
  const longitude = lnglat.lng;
  const latitude = lnglat.lat;
  
  // 检查是否点击了已存在的标记点附近（如果有标记点）
  if (mapMarkers.value && mapMarkers.value.length > 0) {
    const existingMarker = mapMarkers.value[0];
    const markerLng = existingMarker.position[0];
    const markerLat = existingMarker.position[1];
    
    // 计算两点之间的距离（简单的欧几里得距离，单位为度）
    const distance = Math.sqrt(
      Math.pow(longitude - markerLng, 2) + Math.pow(latitude - markerLat, 2)
    );
    
    // 如果点击位置与标记点距离小于0.1度（约11公里），则认为是再次点击该点
    if (distance < 0.1) {
      // 清空标记点
      mapMarkers.value = [];
      // 清空目的地
      formData.destination = '';
      ElMessage.info('已取消选择目的地');
      return;
    }
  }
  
  try {
    // 使用高德地图的逆地理编码API获取城市名称，使用组件中配置的API key
    const apiKey = '102a950c5c6e5d3564b08c05e0b8a8ef';
    const response = await fetch(
      `https://restapi.amap.com/v3/geocode/regeo?key=${apiKey}&location=${longitude},${latitude}`
    );
    const data = await response.json();
    console.log(data)
    if (data.status === '1' && data.regeocode) {
      // 检查是否在中国境内
      const country = data.regeocode.addressComponent.country;
      if (country && country.includes('中国')) {
          // 尝试获取城市名称，优先使用city，其次是district，最后是省
          let cityName = data.regeocode.addressComponent.city
          if(data.regeocode.addressComponent.city.length == 0)
            cityName = data.regeocode.addressComponent.province;
          // 更新目的地
          formData.destination = cityName.toString();
          
          // 清空现有的标记点，确保一次只显示一个标记
          mapMarkers.value = [];

          // 更新地图中心点为城市中心点（使用高德地图的城市中心点）
          // 这里我们使用城市名称进行地理编码来获取城市中心点
          try {
          // 调用高德地理编码API获取城市中心点
          const geoUrl = `https://restapi.amap.com/v3/geocode/geo?key=${apiKey}&address=${encodeURIComponent(cityName)}&city=${encodeURIComponent(cityName)}`;
          const geoResponse = await fetch(geoUrl);
          const geoData = await geoResponse.json();
          
          if (geoData.status === '1' && geoData.geocodes && geoData.geocodes.length > 0) {
            // 获取城市中心点坐标
            const centerPoint = geoData.geocodes[0].location.split(',');
            const cityLongitude = parseFloat(centerPoint[0]);
            const cityLatitude = parseFloat(centerPoint[1]);
            
            // 更新地图中心点为城市中心点
            mapCenter.value = [cityLongitude, cityLatitude];
            
            // 添加标记点在城市中心点
            mapMarkers.value = [{ 
              position: [cityLongitude, cityLatitude], 
              title: cityName, 
              content: `您选择的目的地：${cityName}` 
            }];
          } else {
            // 如果获取城市中心点失败，回退到使用点击位置
            mapCenter.value = [longitude, latitude];
            mapMarkers.value = [{ 
              position: [longitude, latitude], 
              title: cityName, 
              content: `您选择的目的地：${cityName}` 
            }];
          }
        } catch (error) {
          console.error('获取城市中心点失败:', error);
          // 出错时回退到使用点击位置
          mapCenter.value = [longitude, latitude];
          mapMarkers.value = [{ 
            position: [longitude, latitude], 
            title: cityName, 
            content: `您选择的目的地：${cityName}` 
          }];
        }
        
        ElMessage.success(`已选择目的地：${cityName}`);
      } else {
        // 不在中国境内的情况
        ElMessage.warning('请选择中国境内的地点');
      }
    } else {
      ElMessage.warning('无法获取城市信息，请点击其他位置重试');
    }
  } catch (error) {
    console.error('获取城市信息失败:', error);
    ElMessage.error('网络错误，请检查网络连接后重试');
  }
};

// 模拟行程数据
const itineraryData = reactive(generateItineraryData());

// 当前选中的天数
const selectedDay = ref(0);

// 分页相关响应式数据
const currentPage = ref(1);
const itemsPerPage = 7; // 每页显示7天

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(itineraryData.dailyItineraries.length / itemsPerPage);
});

// 计算当前页显示的天数索引
const currentPageDays = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, itineraryData.dailyItineraries.length);
  const days = [];
  for (let i = startIndex; i < endIndex; i++) {
    days.push(i);
  }
  return days;
});

// 监听页码变化，确保选中的日期在当前页范围内
watch([currentPage, selectedDay], ([newPage, newSelectedDay]) => {
  // 确保有行程数据
  if (itineraryData.dailyItineraries.length === 0) return;
  
  const startIndex = (newPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, itineraryData.dailyItineraries.length);
  
  // 确保选中的日期在有效范围内
  if (typeof newSelectedDay !== 'number' || newSelectedDay < 0 || newSelectedDay >= itineraryData.dailyItineraries.length) {
    selectedDay.value = 0;
    currentPage.value = 1;
    return;
  }
  
  // 确保选中的日期在当前页范围内
  if (newSelectedDay < startIndex || newSelectedDay >= endIndex) {
    selectedDay.value = startIndex;
  }
});

// 确保在有行程数据时，currentPage始终有效
watch(() => itineraryData.dailyItineraries.length, (newLength) => {
  if (newLength > 0) {
    const newTotalPages = Math.ceil(newLength / itemsPerPage);
    if (currentPage.value > newTotalPages) {
      currentPage.value = newTotalPages;
    }
  }
});

// 计算当前天的活动（重组为场景-交通-场景-交通的模式）
const currentDayActivities = computed(() => {
  const originalActivities = itineraryData.dailyItineraries[selectedDay.value]?.activities || [];
  const reorganizedActivities = [];
  
  originalActivities.forEach((activity, index) => {
    // 添加所有活动（包括交通类和非交通类）
    reorganizedActivities.push(activity);
    
    // 如果是非交通类活动且有前往下一个活动的交通信息，则创建交通活动
    if (activity.type !== 'transport' && activity.transportToNext) {
      // 创建一个独立的交通活动对象
      const transportActivity = {
        id: `transport-${activity.id}`,
        name: `${activity.transportToNext.from} 到 ${activity.transportToNext.to}`,
        type: 'transport',
        time: '交通时间',
        duration: activity.transportToNext.duration,
        description: `${activity.transportToNext.mode}出行 · 从${activity.transportToNext.from}到${activity.transportToNext.to}`,
        cost: activity.transportToNext.cost,
        transportInfo: activity.transportToNext
      };
      reorganizedActivities.push(transportActivity);
    }
  });
  
  // 确保我们不会重复添加原始的交通活动和计算出的交通活动
  // 移除任何重复的交通活动（保留原始交通活动）
  const uniqueActivities = [];
  const activityIds = new Set();
  
  reorganizedActivities.forEach(activity => {
    // 对于非交通活动，直接添加
    if (activity.type !== 'transport') {
      if (!activityIds.has(activity.id)) {
        activityIds.add(activity.id);
        uniqueActivities.push(activity);
      }
    } 
    // 对于交通活动，检查是否已经有相同的描述
    else {
      // 生成一个基于描述的唯一标识
      const descriptionId = `${activity.description}-${activity.duration}-${activity.cost}`;
      if (!activityIds.has(descriptionId)) {
        activityIds.add(descriptionId);
        uniqueActivities.push(activity);
      }
    }
  });
  
  return uniqueActivities;
});

// 获取活动图标
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'hotel':
      return '🏨';
    case 'restaurant':
      return '🍽️';
    case 'attraction':
      return '📸';
    case 'shopping':
      return '🛍️';
    case 'transport':
      return '🚇';
    default:
      return '📍';
  }
};

// 获取交通信息文本
const getTransportInfo = (transportInfo: any) => {
  if (!transportInfo) return '';
  
  const { mode, duration, cost, from, to } = transportInfo;
  let result = '';
  
  if (mode) {
    result += `${mode}出行`;
  }
  
  if (from && to) {
    if (result) result += ' · ';
    result += `${from} → ${to}`;
  }
  
  if (duration) {
    if (result) result += ' · ';
    result += `${duration}`;
  }
  
  if (cost && cost > 0) {
    if (result) result += ' · ';
    result += `¥${cost}`;
  }
  
  return result;
  };

// 生成行程
// 将后端返回的数据格式转换为前端所需的格式
const transformBackendDataToFrontend = (backendData: any) => {
  // 数据验证
  if (!backendData || !backendData.schedulesByDay) {
    console.error('无效的后端数据格式:', backendData);
    throw new Error('后端返回的数据格式不正确');
  }
  
  // 提取后端数据，添加默认值以防某些字段不存在
  const { 
    totalDays = 1, 
    totalPeople = 1, 
    totalBudget = 0, 
    schedulesByDay = {},
    travelPlanId = null
  } = backendData;
  
  // 深拷贝schedulesByDay以避免修改原始数据
  const schedulesByDayCopy: { [key: number]: any[] } = {};
  
  // 初始化每日活动数组
  for (let day = 1; day <= totalDays; day++) {
    if (schedulesByDay[day] && Array.isArray(schedulesByDay[day])) {
      schedulesByDayCopy[day] = [];
      
      // 处理每天的行程
      schedulesByDay[day].forEach((schedule: any, index: number) => {
        // 确保每个行程对象包含必要的字段
        const { 
          type = 'TICKET', 
          startTime = new Date().toISOString(), 
          endTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          cost = 0, 
          location = '未知地点', 
          description = schedule.description || '暂无描述' 
        } = schedule;
        
        // 计算时长，添加容错处理
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        // 检查日期是否有效
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn('无效的时间格式，使用默认时长:', schedule);
          const duration = '1小时0分钟';
          const time = '09:00';
          
          // 创建活动对象
          const activity = {
            id: `day${day}-${index + 1}`,
            name: location,
            type: 'attraction', // 默认类型
            time: time,
            duration: duration,
            description: description,
            cost: cost,
            transportFromPrevious: null
          };
          
          schedulesByDayCopy[day].push(activity);
          return;
        }
        
        const durationMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
        const duration = `${Math.floor(durationMinutes / 60)}小时${durationMinutes % 60}分钟`;
        
        // 格式化时间（HH:mm）
        const time = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
        
        // 映射类型
        let activityType = 'attraction';
        switch (type) {
          case 'ACCOMMODATION':
            activityType = 'hotel';
            break;
          case 'DINING':
            activityType = 'restaurant';
            break;
          case 'TRANSPORTATION':
            activityType = 'transport';
            break;
          case 'SHOPPING':
            activityType = 'shopping';
            break;
          case 'TICKET':
            activityType = 'attraction';
            break;
        }
        
        // 创建活动对象
        const activity = {
          id: `day${day}-${index + 1}`,
          name: location,
          type: activityType,
          time: time,
          duration: duration,
          description: description,
          cost: cost,
          transportFromPrevious: null // 稍后会填充交通信息
        };
        
        schedulesByDayCopy[day].push(activity);
      });
    } else {
      schedulesByDayCopy[day] = [];
    }
  }
  
  // 为每天的活动添加交通信息
  Object.keys(schedulesByDayCopy).forEach(dayStr => {
    const dayActivities = schedulesByDayCopy[parseInt(dayStr)];
    const daySchedules = schedulesByDay[parseInt(dayStr)] || [];
    
    // 处理原始交通活动，确保它们有足够的信息
    dayActivities.forEach((activity, index) => {
      if (activity.type === 'transport') {
        const originalSchedule = daySchedules[index];
        if (originalSchedule && originalSchedule.type === 'TRANSPORTATION') {
          // 提取位置信息中的出发地和目的地
          let from = '';
          let to = '';
          if (originalSchedule.location && originalSchedule.location.includes('→')) {
            const parts = originalSchedule.location.split('→');
            if (parts.length >= 2) {
              from = parts[0].trim();
              to = parts[1].trim();
            }
          }
          
          // 设置交通信息
          activity.transportInfo = {
            duration: activity.duration,
            cost: activity.cost,
            mode: from.includes('机场') || to.includes('机场') ? '机场快线' : '公共交通',
            from: from,
            to: to
          };
          
          // 更新活动名称，使其更具描述性
          if (from && to) {
            activity.name = `${from} 到 ${to}`;
          }
        }
      }
    });
    
    // 为非交通活动添加前往下一个活动的交通信息
    for (let i = 0; i < dayActivities.length - 1; i++) {
      const currentActivity = dayActivities[i];
      const nextActivity = dayActivities[i + 1];
      
      // 如果当前是非交通活动，且下一个不是交通活动，则添加交通信息
      if (currentActivity.type !== 'transport' && nextActivity.type !== 'transport') {
        // 查找原始schedule对象获取时间信息
        const currentSchedule = daySchedules.find((s: any) => 
          new Date(s.startTime).getTime() === new Date(daySchedules[i]?.startTime).getTime()
        );
        const nextSchedule = daySchedules.find((s: any) => 
          new Date(s.startTime).getTime() === new Date(daySchedules[i + 1]?.startTime).getTime()
        );
        
        if (currentSchedule && nextSchedule && currentSchedule.endTime && nextSchedule.startTime) {
          const currentEnd = new Date(currentSchedule.endTime);
          const nextStart = new Date(nextSchedule.startTime);
          
          const transportMinutes = Math.floor((nextStart.getTime() - currentEnd.getTime()) / (1000 * 60));
          if (transportMinutes > 0) {
            currentActivity.transportToNext = {
              duration: `${transportMinutes}分钟`,
              cost: Math.floor(Math.random() * 20) + 10,
              mode: ['地铁', '出租车', '公交', '步行'][Math.floor(Math.random() * 4)],
              from: currentActivity.name,
              to: nextActivity.name
            };
          }
        }
      }
    }
  });
  
  // 构建dailyItineraries数组
  const dailyItineraries = Object.keys(schedulesByDayCopy)
    .map(dayStr => ({
      day: parseInt(dayStr),
      activities: schedulesByDayCopy[parseInt(dayStr)]
    }))
    .sort((a, b) => a.day - b.day); // 确保按天数排序
  
  // 计算不同类别的花费分布
  let accommodationBudget = 0;
  let diningBudget = 0;
  let transportationBudget = 0;
  let attractionsBudget = 0;
  let shoppingBudget = 0;
  
  // 遍历所有行程计算预算分布
  Object.keys(schedulesByDayCopy).forEach(dayStr => {
    schedulesByDayCopy[parseInt(dayStr)].forEach(activity => {
      switch (activity.type) {
        case 'hotel':
          accommodationBudget += activity.cost;
          break;
        case 'restaurant':
          diningBudget += activity.cost;
          break;
        case 'transport':
          transportationBudget += activity.cost;
          break;
        case 'attraction':
          attractionsBudget += activity.cost;
          break;
        case 'shopping':
          shoppingBudget += activity.cost;
          break;
      }
    });
  });
  
  // 构建expenseDistribution数组
  const expenseDistribution = [
    { category: '住宿', amount: accommodationBudget, percentage: totalBudget > 0 ? Math.round((accommodationBudget / totalBudget) * 100) : 0, color: '#409eff' },
    { category: '餐饮', amount: diningBudget, percentage: totalBudget > 0 ? Math.round((diningBudget / totalBudget) * 100) : 0, color: '#67c23a' },
    { category: '交通', amount: transportationBudget, percentage: totalBudget > 0 ? Math.round((transportationBudget / totalBudget) * 100) : 0, color: '#e6a23c' },
    { category: '门票', amount: attractionsBudget, percentage: totalBudget > 0 ? Math.round((attractionsBudget / totalBudget) * 100) : 0, color: '#f56c6c' },
    { category: '购物', amount: shoppingBudget, percentage: totalBudget > 0 ? Math.round((shoppingBudget / totalBudget) * 100) : 0, color: '#909399' }
  ];
  
  // 返回转换后的数据
  return {
    destination: formData.destination || '未知目的地',
    totalDays: totalDays,
    totalBudget: totalBudget,
    peopleCount: totalPeople,
    preferences: formData.preferences.length > 0 ? formData.preferences : ['默认'],
    expenseDistribution: expenseDistribution,
    dailyItineraries: dailyItineraries,
    travelPlanId: travelPlanId // 保留旅行计划ID
  };
};

const generateItinerary = async () => {
  if (!canGenerate.value) {
    ElMessage.error('请填写完整的旅行信息');
    return;
  }

  // 显示loading状态
  isLoading.value = true;
  waitingTime.value = 0;
  
  // 启动倒计时
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  countdownTimer = setInterval(() => {
    waitingTime.value++;
  }, 1000);

  // 清空现有数据，显示加载状态
  showResult.value = false;

  try {
    // 准备请求数据
    const requestData = activeInputType.value === 'form' 
      ? `我想去${formData.destination}旅行，日期是${formData.dateRange}，预算${formData.budget}元，共${formData.peopleCount}人。${formData.preferences && `我的偏好是：${formData.preferences}。` || ''}${formData.specialRequests && `特别要求：${formData.specialRequests}` || ''}`
      : voiceText.value;
    
    console.log('请求数据:', requestData);

    // 调用真实后端API
    const response = await request({
      url: '/ai/generate-travel-plan',
      method: 'post',
      data: requestData
    });

    // 处理响应数据
    if (response && response.data) {
      console.log('后端响应数据:', response.data);
      
      // 更新响应式数据 - 使用转换函数将后端数据转换为前端所需格式
      const frontendData = transformBackendDataToFrontend(response.data);
      console.log('转换后的前端数据:', frontendData);
      
      Object.assign(itineraryData, frontendData);
      selectedDay.value = 0; // 重置到第一天

      // 显示结果
      showResult.value = true;

      // 显示底部区域并滚动到结果区域
      setTimeout(() => {
        const bottomSection = document.querySelector('.bottom-section');
        if (bottomSection) {
          bottomSection.classList.add('show');
          bottomSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

      ElMessage.success('行程生成成功！');
    } else {
      throw new Error('无效的响应数据');
    }
  } catch (error: any) {
    console.error('行程生成失败:', error);
    // 根据错误类型显示不同的错误信息
    if (error.response) {
      // 服务器返回了错误状态码
      ElMessage.error(`行程生成失败: ${error.response.data?.message || '服务器错误'}`);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      ElMessage.error('网络连接失败，请检查您的网络连接后重试');
    } else {
      // 其他错误
      ElMessage.error(`行程生成失败: ${error.message || '未知错误'}`);
    }
  } finally {
    // 清除loading状态和倒计时
    isLoading.value = false;
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }
};

// 日期选择变化事件处理
const handleDateRangeChange = () => {
  // 可以在这里添加日期范围变更的逻辑
  if (formData.dateRange) {
    const days = Math.ceil((formData.dateRange[1].getTime() - formData.dateRange[0].getTime()) / (1000 * 60 * 60 * 24)) + 1;
    // 可以根据天数提供一些提示或建议
    if (days > 7) {
      ElMessage.info(`您计划了${days}天的行程，建议合理安排休息时间`);
    }
  }
};

// 监听日期范围变化
const dateRangeRef = computed(() => formData.dateRange);
watch(dateRangeRef, handleDateRangeChange, { deep: true });

// 监听偏好变化
const preferencesRef = computed(() => formData.preferences);
watch(preferencesRef, () => {
  // 可以在这里添加偏好变更的逻辑
  if (formData.preferences.length > 0) {
    // 可以根据选择的偏好提供一些提示或建议
    if (formData.preferences.includes('美食')) {
      // 可以添加美食相关的提示
    }
  }
}, { deep: true });
</script>

<style scoped>
/* AI生成提示样式 */
.ai-generated-notice {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border: 1px solid #bae7ff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
  gap: 12px;
}

.notice-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.notice-content {
  flex: 1;
}

.notice-text {
  font-size: 14px;
  color: #1890ff;
  margin: 4px 0 2px 0;
  font-weight: 500;
}

.notice-subtext {
  font-size: 12px;
  color: #666;
  margin: 0;
}

/* 支持大量天数的滚动导航样式 */
.date-navigation-scrollable {
  overflow-x: auto;
  overflow-y: hidden;
  margin-bottom: 20px;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #d9d9d9 transparent;
}

.date-navigation-scrollable::-webkit-scrollbar {
  height: 6px;
}

.date-navigation-scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.date-navigation-scrollable::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 3px;
}

.date-navigation {
  display: inline-block;
  padding-bottom: 5px;
}

.day-tab-button {
  min-width: 70px;
  font-size: 12px;
}

/* 活动间交通信息样式 */
.transport-between-info {
  display: block;
  margin-top: 8px;
  padding: 6px 12px;
  background-color: #f5f5f5;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.transport-between-info:hover {
  background-color: #e8f4ff;
  color: #1890ff;
  cursor: pointer;
}
/* 页面整体布局 */
.planning-page {
  min-height: calc(100vh - 60px); /* 减去顶部导航栏高度 */
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  padding: 0 calc(8vw); /* 左右各占屏幕8%，总共16% */
  box-sizing: border-box;
}

/* 页面头部标题区域 */
.page-header {
  text-align: center;
  padding: 40px 0 20px;
  margin-bottom: 20px;
}

.header-title {
  font-size: 32px;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 12px;
}

.header-subtitle {
  font-size: 18px;
  color: #606266;
  margin: 0;
}

/* 上部区域 */
.top-section {
  height: calc(100vh - 280px); /* 减去顶部导航栏高度和头部区域高度 */
  display: flex;
  align-items: flex-start; /* 顶部对齐 */
  justify-content: center;
  gap: 40px; /* 增加两个内容区域之间的距离 */
  padding: 20px 0;
  box-sizing: border-box;
  overflow: hidden;
}

/* 地图预览区 */
.map-preview-area {
  flex: 0.6;
  height: 100%;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 24px; /* 添加与输入面板相同的内边距 */
  box-sizing: border-box; /* 确保padding不会增加总高度 */
}

/* 地图样式已在组件内部定义 */

/* 输入面板 */
.input-panel {
  flex: 0.4;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 24px 15px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 600px; /* 设置固定高度，确保两个部分高度一致 */
  box-sizing: border-box; /* 确保padding不会增加总高度 */
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .top-section {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
  
  .map-preview-area {
    flex: none;
    height: 40vh;
    aspect-ratio: auto;
  }
  
  .input-panel {
    flex: none;
    min-height: 60vh;
  }
  
  .result-layout {
    flex-direction: column;
  }
  
  .itinerary-overview-panel,
  .itinerary-visualization {
    flex: none;
    height: auto;
  }
}

@media (max-width: 768px) {
  .planning-page {
    padding: 0 10px;
  }
  
  .top-section {
    padding: 10px 0;
    gap: 15px;
  }
  
  .input-panel {
    padding: 16px;
  }
  
  .input-panel h2 {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .day-tabs {
    width: 100%;
    overflow-x: auto;
  }
  
  .timeline-left {
    width: 60px;
    padding-right: 10px;
  }
  
  .timeline-time {
    font-size: 12px;
  }
  
  .activity-card {
    padding: 12px;
  }
  
  .activity-name {
    font-size: 14px;
  }
  
  .activity-description {
    font-size: 13px;
  }
  
  .transport-info {
    font-size: 12px;
    padding: 3px 8px;
  }
}

@media (max-width: 480px) {
  .planning-page {
    padding: 0 5px;
  }
  
  .top-section {
    gap: 10px;
  }
  
  .input-panel {
    padding: 12px;
  }
  
  .bottom-section {
    padding: 0 0 10px 0;
  }
  
  .timeline-node {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
  
  .activity-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

.input-panel h2 {
  margin-bottom: 24px;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

/* 下部区域：行程结果展示区 */
.bottom-section {
  min-height: calc(100vh - 60px); /* 减去顶部导航栏高度 */
  display: none;
  box-sizing: border-box;
  padding: 40px 0 0 0; /* 增加上部间距 */
  background-color: #f5f7fa;
  transition: all 0.3s ease-in-out;
}

.bottom-section.show {
  display: block;
}

/* 结果占位 */
.result-placeholder {
  height: 100%;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #909399;
  padding: 40px;
}

.result-placeholder h3 {
  margin-bottom: 12px;
  color: #606266;
  font-size: 18px;
}

.result-placeholder p {
  font-size: 14px;
}

/* 输入方式切换样式 */
.input-type-switch {
  margin-top: -10px;
  margin-bottom: 15px;
}

.switch-group {
  display: flex;
  border-radius: 10px;
  padding: 4px;
  width: 190px;
}

.switch-button {
  flex: 1;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.switch-button .el-radio-button__inner {
  border-radius: 8px;
  padding: 10px 0;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.switch-button.is-active .el-radio-button__inner {
  background-color: #409eff;
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  border-color: #409eff;
}

/* 表单样式优化 */
.travel-form {
  width: 100%;
}

.travel-form .el-form-item {
  margin-bottom: 20px;
}

.travel-form .el-form-item__label {
  font-weight: 500;
  color: #606266;
  font-size: 15px;
}

.form-input-field {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
}

.form-input-field:hover {
  border-color: #409eff;
}

.form-input-field:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

/* 特殊要求输入框样式 */
.special-requests-item {
  margin-bottom: 28px;
}

.special-requests-input {
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.special-requests-tip {
  margin-top: 8px;
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

/* 语音输入相关样式 */
.voice-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

.reset-button {
  min-width: 120px;
}

/* 语音输入容器样式 */
.voice-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  text-align: center;
  min-height: 300px;
}

/* 语音状态图标 */
.voice-icon {
  font-size: 48px;
  margin-bottom: 16px;
  transition: transform 0.3s ease;
}

.idle-icon {
  color: #409eff;
}

.idle-icon:hover {
  transform: scale(1.1);
}

/* 状态标题样式 */
.voice-state-title {
  margin-bottom: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.recording-title {
  color: #f56c6c;
}

.processing-title {
  color: #e6a23c;
}

.completed-title {
  color: #67c23a;
}

/* 提示文本样式 */
.voice-tip,
.recording-tip,
.processing-tip,
.completed-tip {
  margin-bottom: 16px;
  color: #606266;
  font-size: 15px;
  line-height: 1.5;
}

.recording-tip {
  color: #f56c6c;
}

.processing-tip {
  color: #e6a23c;
}

.completed-tip {
  color: #67c23a;
  font-weight: 500;
}

/* 示例文本容器 */
.voice-example-container {
  background-color: #f0f2f5;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  max-width: 100%;
  box-sizing: border-box;
}

.voice-example-label {
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
  font-size: 14px;
}

.voice-example-text {
  background-color: white;
  padding: 12px;
  border-radius: 6px;
  color: #303133;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  font-style: italic;
  border-left: 3px solid #409eff;
}

/* 录音动画效果 */
.recording-animation {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
}

.pulse-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f56c6c;
  transform: translate(-50%, -50%);
  animation: pulse 1.5s ease-in-out infinite;
}

.pulse-medium {
  width: 60px;
  height: 60px;
  background-color: rgba(245, 108, 108, 0.7);
  animation-delay: 0.2s;
}

.pulse-large {
  width: 80px;
  height: 80px;
  background-color: rgba(245, 108, 108, 0.4);
  animation-delay: 0.4s;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  70% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
}

/* 加载动画 */
.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f0f2f5;
  border-top: 4px solid #e6a23c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 完成图标 */
.completed-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #67c23a;
  color: white;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  animation: scaleIn 0.3s ease-out;
  margin-right: 20px;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 语音识别输入框样式 */
.voice-text-input,
.recognized-text-input {
  width: 100%;
  margin-top: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.6;
  transition: all 0.3s ease;
  border: 2px solid #e4e7ed;
}

.voice-text-input:hover,
.recognized-text-input:hover {
  border-color: #c0c4cc;
}

.voice-text-input:focus,
.recognized-text-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

/* 语音完成状态下的按钮组 */
.voice-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  justify-content: center;
  width: 100%;
}

.reset-button {
  min-width: 120px;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.reset-button:hover {
  border-color: #409eff;
  color: #409eff;
}

/* 生成按钮容器 */
.generate-button-container {
  margin-top: auto;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.generate-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.generate-button:active:not(:disabled) {
  transform: translateY(0);
}

/* 停止录音按钮样式 */
.stop-button {
  min-width: 160px;
  border-radius: 8px;
  font-size: 16px;
  padding: 12px 24px;
  background-color: #f56c6c;
  border-color: #f56c6c;
  transition: all 0.3s ease;
}

.stop-button:hover {
  background-color: #f78989;
  border-color: #f78989;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.stop-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

/* 动作按钮样式 */
.action-button {
  min-width: 160px;
  border-radius: 8px;
  font-size: 16px;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.action-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* 语音输入状态指示器 */
.voice-status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.status-idle {
  background-color: #409eff;
}

.status-recording {
  background-color: #f56c6c;
  animation: pulse 1.5s ease-in-out infinite;
}

.status-processing {
  background-color: #e6a23c;
  animation: spin 1s linear infinite;
}

.status-completed {
  background-color: #67c23a;
}

/* 结果容器 */
.result-container {
  height: calc(100vh - 60px); /* 减去顶部导航栏和内边距 */
  display: flex;
  flex-direction: column;
}

.result-layout {
  display: flex;
  align-items: center;
  height: calc(100vh - 60px); /* 减去顶部导航栏和内边距 */
  gap: 20px;
}

/* 行程总览面板 - 增加宽度5%，从0.35变为0.4 */
.itinerary-overview-panel {
  flex: 0.4;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px - 128px); /* 减去顶部导航栏和内边距 */
  overflow-y: auto;
}

.overview-title {
  margin-bottom: 24px;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

/* 总览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.overview-card {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.card-icon.calendar {
  background-color: #e6f7ff;
}

.card-icon.money {
  background-color: #f0f9eb;
}

.card-icon.person {
  background-color: #fdf6ec;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.card-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 费用分布 */
.expense-distribution {
  margin-bottom: 32px;
}

.section-title {
  margin-bottom: 16px;
  color: #606266;
  font-size: 16px;
  font-weight: 500;
}

/* 简单环形图 */
.donut-chart {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 25%, #e6a23c 50%, #f56c6c 75%, #909399 100%);
  border-radius: 50%;
  padding: 10px;
}

.donut-inner {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-percentage {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.donut-label {
  font-size: 14px;
  color: #909399;
}

/* 费用分布图例 */
.expense-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  font-size: 14px;
  color: #606266;
}

.legend-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

/* 旅行偏好标签 */
.preference-tags {
  margin-bottom: 20px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preference-tag {
  background-color: #ecf5ff;
  color: #409eff;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.preference-tag:hover {
  background-color: #409eff;
  color: #ffffff;
}

/* 行程可视化区 */
.itinerary-visualization {
  flex: 0.65;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px - 128px); /* 减去顶部导航栏和内边距 */
  overflow: hidden;
}

.visualization-title {
  margin-bottom: 24px;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

/* 日期导航 - 分页式 */
.date-navigation-paginated {
  margin-bottom: 20px;
}

.date-navigation-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-control-button {
  min-width: 28px;
  height: 28px;
  border-radius: 14px;
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
  background-color: #ffffff;
}

.nav-control-button:hover:not(:disabled) {
  background-color: #409eff;
  color: #ffffff;
  border-color: #409eff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.nav-control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.day-tabs {
  display: inline-flex;
  flex-wrap: nowrap;
  max-width: calc(100% - 100px);
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 4px;
  transition: all 0.3s ease;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .date-navigation-controls {
    flex-wrap: wrap;
  }
  
  .page-indicator {
    order: 2;
    padding: 4px 8px;
    font-size: 11px;
  }
  
  .day-tabs {
    max-width: 100%;
    order: 3;
    width: 100%;
  }
  
  .nav-control-button {
    min-width: 32px;
    height: 32px;
  }
  
  .day-tabs .el-radio-button__wrapper {
    padding: 6px 8px;
    font-size: 12px;
  }
}

.day-tabs::-webkit-scrollbar {
  display: none;
}

.page-indicator {
  font-size: 12px;
  color: #606266;
  background-color: #f5f7fa;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.page-indicator:hover {
  background-color: #e6f7ff;
  color: #409eff;
}

/* 日期切换的过渡动画 */
.day-tab-button {
  transition: all 0.3s ease;
}

/* 分页切换时的淡入效果 */
.date-navigation-controls {
  transition: opacity 0.3s ease;
}

.day-tabs .el-radio-button__wrapper {
  border-radius: 6px;
  margin: 0 4px;
}

/* 每日行程时间轴 */
.day-timeline {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.timeline-item {
  display: flex;
  margin-bottom: 24px;
  position: relative;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.3s ease forwards;
}



@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.timeline-item:nth-child(1) { animation-delay: 0.1s; }
.timeline-item:nth-child(2) { animation-delay: 0.2s; }
.timeline-item:nth-child(3) { animation-delay: 0.3s; }
.timeline-item:nth-child(4) { animation-delay: 0.4s; }
.timeline-item:nth-child(5) { animation-delay: 0.5s; }
.timeline-item:nth-child(6) { animation-delay: 0.6s; }
.timeline-item:nth-child(7) { animation-delay: 0.7s; }
.timeline-item:nth-child(8) { animation-delay: 0.8s; }

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-left {
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-right: 16px;
  position: relative;
}

.timeline-time {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}

.timeline-connector {
  flex: 1;
  width: 2px;
  background-color: #ebeef5;
  position: absolute;
  top: 30px;
  bottom: -16px;
  right: 15px;
}

.timeline-item:last-child .timeline-connector {
  display: none;
}

.timeline-middle {
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.timeline-node {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.timeline-node:hover {
  transform: scale(1.1);
}

.timeline-node.hotel {
  background-color: #e6f7ff;
}

.timeline-node.restaurant {
  background-color: #f0f9eb;
}

.timeline-node.attraction {
  background-color: #fdf6ec;
}

.timeline-node.shopping {
  background-color: #fef0f0;
}

.timeline-node.transport {
  background-color: #f0f0f0;
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-right {
  flex: 1;
  padding-left: 16px;
}

.activity-card {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateX(-20px);
  animation: fadeInSlide 0.5s ease forwards;
}

/* 交通卡片特殊样式 */
.transport-card {
  background-color: #e6f7ff;
  border-left: 3px solid #409eff;
}

/* 交通信息样式 */
.transport-info {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.transport-route {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.route-item {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.route-label {
  font-size: 12px;
  color: #606266;
  margin-right: 4px;
  font-weight: 500;
}

.route-value {
  font-size: 12px;
  color: #303133;
  font-weight: 600;
}

.route-arrow {
  margin: 0 12px;
  color: #409eff;
}

.transport-details {
  margin-top: 6px;
}

.transport-mode {
  font-size: 12px;
  color: #409eff;
  padding: 2px 8px;
  background-color: rgba(64, 158, 255, 0.1);
  border-radius: 10px;
}

@keyframes fadeInSlide {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 全局遮罩层样式 */
.global-loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeInSlide 0.3s ease-in-out;
}

.loading-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  min-width: 320px;
}

.loading-content h3 {
  margin: 20px 0 10px;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.waiting-time {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin: 10px 0;
}

.loading-tip {
  color: #666;
  font-size: 14px;
  margin-top: 10px;
  opacity: 0.9;
}

.activity-card:hover {
  background-color: #ecf5ff;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.activity-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.activity-cost {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
}

.activity-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.5;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-duration {
  font-size: 14px;
  color: #909399;
  background-color: #ffffff;
  padding: 2px 8px;
  border-radius: 12px;
}

.transport-info {
  font-size: 14px;
  color: #409eff;
  background-color: #ecf5ff;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>