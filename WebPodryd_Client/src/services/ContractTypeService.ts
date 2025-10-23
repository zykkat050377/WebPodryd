// src/services/ContractTypeService.ts
import { systemApi } from './axiosConfig';

export interface ContractType {
  id: number;
  name: string;
  code: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Временные данные для разработки
const mockContractTypes: ContractType[] = [
  {
    id: 1,
    name: 'За операцию',
    code: 'operation',
    description: 'Оплата за каждую выполненную операцию',
    createdAt: '2025-10-23T06:53:29.8763055',
    updatedAt: '2025-10-23T06:53:29.8763171'
  },
  {
    id: 2,
    name: 'Нормочаса',
    code: 'norm-hour',
    description: 'Оплата по нормочасам работы',
    createdAt: '2025-10-23T06:53:29.8763265',
    updatedAt: '2025-10-23T06:53:29.8763266'
  },
  {
    id: 3,
    name: 'Стоимость',
    code: 'cost',
    description: 'Фиксированная стоимость работ/услуг',
    createdAt: '2025-10-23T06:53:29.8763269',
    updatedAt: '2025-10-23T06:53:29.8763270'
  }
];

export const ContractTypeService = {
  async getAllContractTypes(): Promise<ContractType[]> {
    try {
      const response = await systemApi.get('/api/ContractType');
      return response.data;
    } catch (error) {
      console.warn('API недоступно, используем временные данные типов договоров');
      return mockContractTypes;
    }
  },

  async getContractTypeById(id: number): Promise<ContractType> {
    try {
      const response = await systemApi.get(`/api/ContractType/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API недоступно, используем временные данные');
      const type = mockContractTypes.find(t => t.id === id);
      if (!type) throw new Error('Тип договора не найден');
      return type;
    }
  },

  async getContractTypeByCode(code: string): Promise<ContractType> {
    try {
      const response = await systemApi.get(`/api/ContractType/code/${code}`);
      return response.data;
    } catch (error) {
      console.warn('API недоступно, используем временные данные');
      const type = mockContractTypes.find(t => t.code === code);
      if (!type) throw new Error('Тип договора не найден');
      return type;
    }
  }
};