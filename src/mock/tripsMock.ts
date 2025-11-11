// 旅行计划模拟数据
import { TravelPlan, TravelSchedule } from '../types/trip';

// 生成模拟旅行计划数据
export const generateMockTravelPlans = (): TravelPlan[] => {
  const plans: TravelPlan[] = [];
  
  // 生成10条模拟数据
  for (let i = 1; i <= 10; i++) {
    const totalBudget = Math.floor(Math.random() * 20000) + 5000; // 5000-25000之间的随机预算
    const totalDays = Math.floor(Math.random() * 7) + 3; // 3-10天的行程
    
    plans.push({
      id: i,
      userId: 1, // 假设当前用户ID为1
      totalDays,
      totalBudget,
      totalPeople: Math.floor(Math.random() * 4) + 1, // 1-5人
      accommodationBudget: totalBudget * 0.3, // 住宿占30%
      diningBudget: totalBudget * 0.2, // 餐饮占20%
      transportationBudget: totalBudget * 0.25, // 交通占25%
      attractionsBudget: totalBudget * 0.15, // 景点门票占15%
      shoppingBudget: totalBudget * 0.1, // 购物占10%
      createdAt: new Date(Date.now() - i * 86400000 * Math.random() * 30).toISOString(), // 随机创建时间
      updatedAt: new Date(Date.now() - i * 86400000 * Math.random() * 10).toISOString()
    });
  }
  
  return plans;
};

// 生成模拟行程安排数据
export const generateMockSchedules = (travelPlanId: number, totalDays: number): TravelSchedule[] => {
  const schedules: TravelSchedule[] = [];
  const scheduleTypes = ['ACCOMMODATION', 'DINING', 'TRANSPORTATION', 'TICKET', 'SHOPPING'];
  const locations = ['酒店大堂', '市中心餐厅', '火车站', '故宫博物院', '王府井步行街', '颐和园', '三里屯', '南锣鼓巷'];
  const descriptions = [
    '在此享用美味的早餐',
    '参观历史文化景点',
    '前往下一个目的地',
    '入住酒店休息',
    '购物体验当地特色商品',
    '品尝当地美食'
  ];
  
  let id = 1;
  
  for (let day = 1; day <= totalDays; day++) {
    // 每天生成5-8个行程
    const scheduleCount = Math.floor(Math.random() * 4) + 5;
    
    for (let i = 0; i < scheduleCount; i++) {
      const startHour = 8 + i * 2; // 从早上8点开始，每2小时一个行程
      const duration = Math.floor(Math.random() * 3) + 1; // 1-3小时
      const endHour = startHour + duration;
      
      const type = scheduleTypes[Math.floor(Math.random() * scheduleTypes.length)];
      
      schedules.push({
        id: id++,
        travelPlanId,
        type,
        day,
        startTime: new Date(`2024-01-${day.toString().padStart(2, '0')}T${startHour.toString().padStart(2, '0')}:00:00`).toISOString(),
        endTime: new Date(`2024-01-${day.toString().padStart(2, '0')}T${endHour.toString().padStart(2, '0')}:00:00`).toISOString(),
        cost: Math.floor(Math.random() * 500) + 50, // 50-550元之间的费用
        location: locations[Math.floor(Math.random() * locations.length)],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }
  
  return schedules;
};

// 获取分页的模拟数据
export const getMockTravelPlansPage = (page: number, size: number) => {
  const allPlans = generateMockTravelPlans();
  const start = (page - 1) * size;
  const end = start + size;
  const pagedPlans = allPlans.slice(start, end);
  
  return {
    list: pagedPlans,
    total: allPlans.length,
    page,
    size,
    pages: Math.ceil(allPlans.length / size)
  };
};

// 获取模拟的行程安排数据
export const getMockSchedulesByPlanId = (travelPlanId: number) => {
  // 为每个旅行计划生成对应的行程安排
  const totalDays = Math.floor(Math.random() * 7) + 3; // 3-10天
  return generateMockSchedules(travelPlanId, totalDays);
};