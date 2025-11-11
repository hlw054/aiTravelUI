// 旅行计划相关类型定义

export interface TravelPlan {
  id: number;
  userId: number;
  totalDays: number;
  totalBudget: number;
  totalPeople: number;
  accommodationBudget: number;
  diningBudget: number;
  transportationBudget: number;
  attractionsBudget: number;
  shoppingBudget: number;
  createdAt: string;
  updatedAt: string;
}

export enum ScheduleType {
  ACCOMMODATION = 'ACCOMMODATION',
  DINING = 'DINING',
  TRANSPORTATION = 'TRANSPORTATION',
  TICKET = 'TICKET',
  SHOPPING = 'SHOPPING'
}

export interface TravelSchedule {
  id: number;
  travelPlanId: number;
  type: ScheduleType | string;
  day: number;
  startTime: string;
  endTime: string;
  cost?: number;
  location?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}