<template>
  <div class="trips-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>我的旅行计划</h1>
      <p class="page-subtitle">管理您的所有旅行行程安排</p>
    </div>

    <!-- 旅行计划列表 -->
    <div class="trips-container">
      <div v-if="loading" class="loading-container">
        <el-loading v-loading="loading" type="spinner" color="#1890ff" />
      </div>
      
      <div v-else-if="tripsList.length === 0" class="empty-state">
        <el-empty description="暂无旅行计划" />
        <el-button type="primary" @click="$router.push('/planning')">创建新计划</el-button>
      </div>
      
      <div v-else class="trips-list">
        <div 
          v-for="trip in tripsList" 
          :key="trip.id" 
          class="trip-card"
          @click="showTripDetail(trip.id)"
        >
          <!-- 行程卡片顶部 -->
          <div class="trip-card-header">
            <div class="trip-status-badge" :class="getTripStatusClass(trip)">
              {{ getTripStatusText(trip) }}
            </div>
            <h3 class="trip-title">旅行计划 #{{ trip.id }}</h3>
          </div>
          
          <!-- 行程基本信息 -->
          <div class="trip-info">
            <div class="trip-meta">
              <div class="meta-item primary">
                <el-icon :size="18"><Calendar /></el-icon>
                <div class="meta-content">
                  <span class="meta-label">行程天数</span>
                  <span class="meta-value">{{ trip.totalDays }} 天</span>
                </div>
              </div>
              <div class="meta-item">
                <el-icon :size="18"><User /></el-icon>
                <div class="meta-content">
                  <span class="meta-label">出行人数</span>
                  <span class="meta-value">{{ trip.totalPeople }} 人</span>
                </div>
              </div>
              <div class="meta-item highlight">
                <el-icon :size="18"><Wallet /></el-icon>
                <div class="meta-content">
                  <span class="meta-label">总预算</span>
                  <span class="meta-value">¥{{ trip.totalBudget.toLocaleString() }}</span>
                </div>
              </div>
            </div>
            
            <!-- 预算分布卡片 -->
            <div class="trip-budgets-card">
              <h4 class="budgets-title">预算分布</h4>
              <div class="trip-budgets">
                <div class="budget-item">
                  <div class="budget-label">住宿</div>
                  <div class="budget-value">¥{{ trip.accommodationBudget.toLocaleString() }}</div>
                  <div class="budget-progress">
                    <div 
                      class="budget-progress-bar" 
                      :style="{width: getBudgetPercentage(trip.accommodationBudget, trip.totalBudget) + '%'}"
                    ></div>
                  </div>
                </div>
                <div class="budget-item">
                  <div class="budget-label">餐饮</div>
                  <div class="budget-value">¥{{ trip.diningBudget.toLocaleString() }}</div>
                  <div class="budget-progress">
                    <div 
                      class="budget-progress-bar" 
                      :style="{width: getBudgetPercentage(trip.diningBudget, trip.totalBudget) + '%'}"
                    ></div>
                  </div>
                </div>
                <div class="budget-item">
                  <div class="budget-label">交通</div>
                  <div class="budget-value">¥{{ trip.transportationBudget.toLocaleString() }}</div>
                  <div class="budget-progress">
                    <div 
                      class="budget-progress-bar" 
                      :style="{width: getBudgetPercentage(trip.transportationBudget, trip.totalBudget) + '%'}"
                    ></div>
                  </div>
                </div>
                <div class="budget-item">
                  <div class="budget-label">门票</div>
                  <div class="budget-value">¥{{ trip.attractionsBudget.toLocaleString() }}</div>
                  <div class="budget-progress">
                    <div 
                      class="budget-progress-bar" 
                      :style="{width: getBudgetPercentage(trip.attractionsBudget, trip.totalBudget) + '%'}"
                    ></div>
                  </div>
                </div>
                <div class="budget-item">
                  <div class="budget-label">购物</div>
                  <div class="budget-value">¥{{ trip.shoppingBudget.toLocaleString() }}</div>
                  <div class="budget-progress">
                    <div 
                      class="budget-progress-bar" 
                      :style="{width: getBudgetPercentage(trip.shoppingBudget, trip.totalBudget) + '%'}"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 时间信息 -->
            <div class="trip-time">
              <el-icon :size="14"><Clock /></el-icon>
              <span>创建时间: {{ formatDate(trip.createdAt) }}</span>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="trip-actions">
            <el-button 
              type="primary" 
              size="small" 
              icon="View"
              @click.stop="showTripDetail(trip.id)"
              class="view-btn"
            >查看详情</el-button>
            <el-button 
              type="danger" 
              size="small" 
              icon="Delete"
              @click.stop="deleteTrip(trip.id)"
              class="delete-btn"
            >删除</el-button>
          </div>
        </div>
      </div>

      <!-- 分页控件 -->
      <div v-if="total > 0" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 旅行计划详情弹窗 -->
    <el-dialog
      v-model="showDetailDialog"
      title="旅行计划详情"
      width="80%"
      :before-close="handleCloseDetail"
    >
      <div v-if="detailLoading" class="dialog-loading">
        <el-loading v-loading="detailLoading" type="spinner" color="#1890ff" />
      </div>
      <div v-else-if="currentTripSchedule.length === 0" class="dialog-empty">
        <el-empty description="暂无行程安排" />
      </div>
      <div v-else class="trip-schedule">
        <!-- 行程概览卡片 -->
        <div class="trip-overview-card">
          <div class="overview-header">
            <h3>行程概览</h3>
            <div class="overview-stats">
              <div class="stat-item">
                <div class="stat-value">{{ currentTripSchedule.length }}</div>
                <div class="stat-label">行程项目</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ getDaysList().length }}</div>
                <div class="stat-label">总天数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">¥{{ calculateTotalCost().toLocaleString() }}</div>
                <div class="stat-label">总花费</div>
              </div>
            </div>
          </div>
          
          <!-- 行程类型分布 -->
          <div class="trip-type-distribution">
            <h4>行程类型分布</h4>
            <div class="type-stats">
              <div v-for="typeData in getTypeDistribution()" :key="typeData.type" class="type-stat-item">
                <div class="type-info">
                  <span class="type-name">{{ typeData.name }}</span>
                  <span class="type-count">({{ typeData.count }})</span>
                </div>
                <div class="type-progress">
                  <div 
                    class="type-progress-bar" 
                    :class="getTypeClass(typeData.type)"
                    :style="{width: typeData.percentage + '%'}"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 每日行程详情 -->
        <div class="daily-schedules">
          <h3 class="section-title">详细行程安排</h3>
          <div v-for="day in getDaysList()" :key="day" class="schedule-day">
            <div class="day-header">
              <div class="day-number">第 {{ day }} 天</div>
              <div class="day-summary">
                <span>{{ getDayScheduleCount(day) }} 个行程</span>
                <span class="day-cost">¥{{ getDayTotalCost(day).toLocaleString() }}</span>
              </div>
            </div>
            
            <div class="day-schedules">
              <div 
                v-for="schedule in getSchedulesByDay(day)" 
                :key="schedule.id" 
                class="schedule-item"
                :class="getTypeClass(schedule.type)"
              >
                <div class="schedule-timeline-marker"></div>
                
                <div class="schedule-content-wrapper">
                  <div class="schedule-header">
                    <div class="schedule-time">{{ formatTime(schedule.startTime) }} - {{ formatTime(schedule.endTime) }}</div>
                    <div class="schedule-type-badge" :class="getTypeClass(schedule.type)">
                      {{ getScheduleTypeName(schedule.type) }}
                    </div>
                  </div>
                  
                  <div class="schedule-body">
                    <!-- 地点 -->
                    <div v-if="schedule.location" class="schedule-location">
                      <el-icon><Location /></el-icon>
                      {{ schedule.location }}
                    </div>
                    
                    <!-- 描述 -->
                    <div v-if="schedule.description" class="schedule-description">
                      {{ schedule.description }}
                    </div>
                    
                    <!-- 费用 -->
                    <div v-if="schedule.cost" class="schedule-cost">
                      <el-icon><Wallet /></el-icon>
                      ¥{{ schedule.cost.toLocaleString() }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Calendar, User, Wallet, Delete, Location } from '@element-plus/icons-vue';
import { request } from '../../util/request';
import { useRouter } from 'vue-router';

// 路由
const router = useRouter();

// 分页相关数据
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);

// 旅行计划列表
const tripsList = ref<any[]>([]);

// 详情弹窗相关数据
const showDetailDialog = ref(false);
const currentTripId = ref<number | null>(null);
const currentTripSchedule = ref<any[]>([]);
const detailLoading = ref(false);

// 获取旅行计划列表
const fetchTripsList = async () => {
  loading.value = true;
  try {
    const response = await request({
      method: 'get',
      url: '/travel-plans/page',
      params: {
        page: currentPage.value,
        size: pageSize.value
      }
    });
    
    tripsList.value = response.data.list || [];
    total.value = response.data.total || 0;
  } catch (error) {
    ElMessage.error('获取旅行计划失败');
    console.error('获取旅行计划失败:', error);
  } finally {
    loading.value = false;
  }
};

// 分页大小改变
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchTripsList();
};

// 页码改变
const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  fetchTripsList();
};

// 显示旅行计划详情
const showTripDetail = async (tripId: number) => {
  currentTripId.value = tripId;
  detailLoading.value = true;
  
  try {
    const response = await request({
      method: 'get',
      url: `/travel-plans/${tripId}/schedules`
    });
    currentTripSchedule.value = response.data || [];
    showDetailDialog.value = true;
  } catch (error) {
    ElMessage.error('获取行程详情失败');
    console.error('获取行程详情失败:', error);
  } finally {
    detailLoading.value = false;
  }
};

// 关闭详情弹窗
const handleCloseDetail = () => {
  showDetailDialog.value = false;
  currentTripId.value = null;
  currentTripSchedule.value = [];
};

// 删除旅行计划
const deleteTrip = (tripId: number) => {
  ElMessageBox.confirm('确定要删除这个旅行计划吗？此操作不可恢复。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request({
        method: 'delete',
        url: `/travel-plans/${tripId}`
      });
      ElMessage.success('删除成功');
      // 重新获取列表
      fetchTripsList();
    } catch (error) {
      ElMessage.error('删除失败');
      console.error('删除旅行计划失败:', error);
    }
  }).catch(() => {
    // 用户取消删除
  });
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 格式化时间
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取行程类型名称
const getScheduleTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'ACCOMMODATION': '住宿',
    'DINING': '餐饮',
    'TRANSPORTATION': '交通',
    'TICKET': '门票',
    'SHOPPING': '购物'
  };
  return typeMap[type] || type;
};

// 获取行程状态类名
const getTripStatusClass = (trip: any) => {
  // 这里可以根据实际业务逻辑判断行程状态
  // 简单示例：根据创建时间判断
  const createdDate = new Date(trip.createdAt);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 3) return 'status-new';
  if (daysDiff < 14) return 'status-active';
  return 'status-archived';
};

// 获取行程状态文本
const getTripStatusText = (trip: any) => {
  const createdDate = new Date(trip.createdAt);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 3) return '新建行程';
  if (daysDiff < 14) return '活跃行程';
  return '已归档';
};

// 计算预算占比
const getBudgetPercentage = (amount: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((amount / total) * 100);
};

// 获取天数列表（用于详情展示）
const getDaysList = () => {
  const days = new Set<number>();
  currentTripSchedule.value.forEach(schedule => {
    if (schedule.day) {
      days.add(schedule.day);
    }
  });
  return Array.from(days).sort((a, b) => a - b);
};

// 根据天数获取行程
const getSchedulesByDay = (day: number) => {
  return currentTripSchedule.value
    .filter(schedule => schedule.day === day)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
};

// 获取行程类型的样式类名
const getTypeClass = (type: string) => {
  const typeMap: Record<string, string> = {
    'ACCOMMODATION': 'type-accommodation',
    'DINING': 'type-dining',
    'TRANSPORTATION': 'type-transportation',
    'TICKET': 'type-ticket',
    'SHOPPING': 'type-shopping'
  };
  return typeMap[type] || 'type-other';
};

// 计算总花费
const calculateTotalCost = () => {
  return currentTripSchedule.value.reduce((total, schedule) => {
    return total + (schedule.cost || 0);
  }, 0);
};

// 获取类型分布数据
const getTypeDistribution = () => {
  const typeCount: Record<string, number> = {};
  currentTripSchedule.value.forEach(schedule => {
    if (schedule.type) {
      typeCount[schedule.type] = (typeCount[schedule.type] || 0) + 1;
    }
  });
  
  const total = currentTripSchedule.value.length;
  return Object.entries(typeCount).map(([type, count]) => ({
    type,
    name: getScheduleTypeName(type),
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  })).sort((a, b) => b.count - a.count);
};

// 获取某一天的行程数量
const getDayScheduleCount = (day: number) => {
  return currentTripSchedule.value.filter(schedule => schedule.day === day).length;
};

// 获取某一天的总花费
const getDayTotalCost = (day: number) => {
  return currentTripSchedule.value
    .filter(schedule => schedule.day === day)
    .reduce((total, schedule) => total + (schedule.cost || 0), 0);
};

// 页面挂载时获取数据
onMounted(() => {
  fetchTripsList();
});
</script>

<style scoped>
/* 全局样式变量 */
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;
  --border-radius: 12px;
  --shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.12);
  --transition-all: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.trips-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-top: 80px; /* 增加顶部内边距，避免被导航栏遮挡 */
  padding-bottom: 60px;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
  color: white;
  animation: fadeInUp 0.6s ease-out;
}

.page-header h1 {
  font-size: 36px;
  margin-bottom: 12px;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  font-size: 18px;
  opacity: 0.9;
  font-weight: 400;
}

.trips-container {
  background: #ffffff;
  border-radius: var(--border-radius);
  padding: 30px;
  box-shadow: var(--shadow-light);
  animation: fadeIn 0.8s ease-out;
}

.loading-container,
.empty-state {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.empty-state button {
  margin-top: 24px;
  animation: bounceIn 0.5s ease-out;
}

.trips-list {
  display: grid;
  gap: 24px;
}

/* 行程卡片样式优化 */
.trip-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: #ffffff;
  border-radius: var(--border-radius);
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: var(--transition-all);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-light);
}

.trip-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), #667eea);
  transform: scaleX(0);
  transition: var(--transition-all);
  transform-origin: left;
}

.trip-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-4px);
}

.trip-card:hover::before {
  transform: scaleX(1);
}

/* 行程卡片头部 */
.trip-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.trip-status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-new {
  background: #e6f7ff;
  color: #1890ff;
}

.status-active {
  background: #f6ffed;
  color: #52c41a;
}

.status-archived {
  background: #f5f5f5;
  color: #8c8c8c;
}

.trip-title {
  font-size: 22px;
  color: #303133;
  font-weight: 600;
  margin: 0;
}

/* 行程基本信息 */
.trip-info {
  margin-bottom: 20px;
}

.trip-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.meta-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: var(--transition-all);
}

.meta-item:hover {
  background: #f0f2f5;
  transform: translateY(-2px);
}

.meta-item.primary .el-icon {
  color: var(--primary-color);
}

.meta-item.highlight {
  background: linear-gradient(135deg, #fff7e6 0%, #fff1d6 100%);
  border: 1px solid #ffd591;
}

.meta-item.highlight .el-icon {
  color: var(--warning-color);
}

.meta-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 12px;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.meta-item.highlight .meta-value {
  color: var(--warning-color);
}

/* 预算分布卡片 */
.trip-budgets-card {
  background: #fafafa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
}

.budgets-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.trip-budgets {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.budget-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.budget-label {
  font-size: 14px;
  color: #606266;
  display: flex;
  justify-content: space-between;
}

.budget-value {
  font-weight: 500;
  color: #303133;
}

.budget-progress {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.budget-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), #667eea);
  border-radius: 3px;
  transition: width 0.6s ease;
}

/* 时间信息 */
.trip-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
}

/* 操作按钮 */
.trip-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  align-self: flex-end;
}

.trip-actions .el-button {
  transition: var(--transition-all);
  font-weight: 500;
  padding: 6px 16px;
}

.view-btn {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.view-btn:hover {
  background: #66b1ff;
  border-color: #66b1ff;
  transform: translateY(-2px);
}

.delete-btn {
  background: #ffffff;
  border-color: #f56c6c;
  color: #f56c6c;
}

.delete-btn:hover {
  background: #f56c6c;
  color: #ffffff;
  transform: translateY(-2px);
}

/* 分页控件 */
.pagination {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

/* 详情弹窗样式 */
:deep(.el-dialog__header) {
  background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%);
  padding: 24px;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  color: white;
}

:deep(.el-dialog__title) {
  color: white;
  font-size: 20px;
  font-weight: 600;
}

:deep(.el-dialog__headerbtn .el-icon) {
  color: white;
  font-size: 20px;
  transition: var(--transition-all);
}

:deep(.el-dialog__headerbtn:hover .el-icon) {
  transform: rotate(90deg);
  color: rgba(255, 255, 255, 0.8);
}

.dialog-loading,
.dialog-empty {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trip-schedule {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

/* 行程概览卡片 */
.trip-overview-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: var(--shadow-light);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.overview-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  min-width: 300px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 行程类型分布 */
.trip-type-distribution h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.type-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.type-stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.type-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.type-name {
  font-weight: 500;
  color: #606266;
}

.type-count {
  color: #909399;
  font-size: 12px;
}

.type-progress {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.type-progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

/* 每日行程标题 */
.daily-schedules .section-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #ebeef5;
}

/* 每日行程样式 */
.schedule-day {
  margin-bottom: 40px;
  position: relative;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.day-number {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.day-summary {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #606266;
}

.day-cost {
  font-weight: 600;
  color: var(--warning-color);
}

/* 时间线样式 */
.day-schedules {
  position: relative;
  padding-left: 32px;
}

.day-schedules::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ebeef5;
}

/* 行程项样式 */
.schedule-item {
  position: relative;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: var(--shadow-light);
  transition: var(--transition-all);
  border-left: 4px solid var(--primary-color);
}

.schedule-item:hover {
  box-shadow: var(--shadow-hover);
  transform: translateX(4px);
}

/* 时间线标记 */
.schedule-timeline-marker {
  position: absolute;
  left: -40px;
  top: 24px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 3px solid var(--primary-color);
  z-index: 1;
  transition: transform 0.3s ease;
}

.schedule-item:hover .schedule-timeline-marker {
  transform: scale(1.2);
}

/* 行程内容包装 */
.schedule-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 行程头部 */
.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.schedule-time {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 行程类型徽章 */
.schedule-type-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 行程类型样式 */
.type-accommodation {
  border-left-color: #67c23a !important;
}

.type-accommodation .schedule-timeline-marker {
  border-color: #67c23a;
}

.type-accommodation .schedule-type-badge {
  background: #f0f9eb;
  color: #67c23a;
}

.type-accommodation .type-progress-bar {
  background: #67c23a;
}

.type-dining {
  border-left-color: #e6a23c !important;
}

.type-dining .schedule-timeline-marker {
  border-color: #e6a23c;
}

.type-dining .schedule-type-badge {
  background: #fdf6ec;
  color: #e6a23c;
}

.type-dining .type-progress-bar {
  background: #e6a23c;
}

.type-transportation {
  border-left-color: #409eff !important;
}

.type-transportation .schedule-timeline-marker {
  border-color: #409eff;
}

.type-transportation .schedule-type-badge {
  background: #ecf5ff;
  color: #409eff;
}

.type-transportation .type-progress-bar {
  background: #409eff;
}

.type-ticket {
  border-left-color: #909399 !important;
}

.type-ticket .schedule-timeline-marker {
  border-color: #909399;
}

.type-ticket .schedule-type-badge {
  background: #f4f4f5;
  color: #909399;
}

.type-ticket .type-progress-bar {
  background: #909399;
}

.type-shopping {
  border-left-color: #f56c6c !important;
}

.type-shopping .schedule-timeline-marker {
  border-color: #f56c6c;
}

.type-shopping .schedule-type-badge {
  background: #fef0f0;
  color: #f56c6c;
}

.type-shopping .type-progress-bar {
  background: #f56c6c;
}

/* 行程内容 */
.schedule-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid #f0f2f5;
}

.schedule-location {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.schedule-location .el-icon {
  color: var(--primary-color);
  font-size: 16px;
}

.schedule-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.7;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border-left: 3px solid #e0e0e0;
}

.schedule-cost {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--warning-color);
  padding: 8px 12px;
  background: #fff7e6;
  border-radius: 6px;
  align-self: flex-start;
}

.schedule-cost .el-icon {
  color: var(--warning-color);
  font-size: 16px;
}

/* 自定义滚动条 */
.trip-schedule::-webkit-scrollbar {
  width: 8px;
}

.trip-schedule::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.trip-schedule::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.trip-schedule::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trips-page {
    padding: 16px;
    padding-top: 90px;
  }
  
  .page-header h1 {
    font-size: 28px;
  }
  
  .page-subtitle {
    font-size: 16px;
  }
  
  .trips-container {
    padding: 20px;
  }
  
  .trip-meta {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .overview-stats {
    grid-template-columns: 1fr;
    min-width: auto;
  }
  
  .day-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .schedule-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 5% !important;
  }
  
  :deep(.el-dialog__header) {
    padding: 20px;
  }
  
  .day-schedules {
    padding-left: 24px;
  }
  
  .schedule-timeline-marker {
    left: -32px;
  }
}

@media (max-width: 480px) {
  .trip-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .trip-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .trip-actions .el-button {
    flex: 1;
    margin: 0 4px;
  }
  
  .overview-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .day-summary {
    flex-direction: column;
    gap: 8px;
  }
}
</style>