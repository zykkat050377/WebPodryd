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

export interface CreateContractTypeRequest {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateContractTypeRequest {
  name?: string;
  code?: string;
  description?: string;
}

// Временные данные для разработки
const mockContractTypes: ContractType[] = [
  {
    id: 1,
    name: 'Договор подряда (операция)',
    code: 'operation',
    description: 'Оплата за выполнение операций',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    name: 'Договор подряда (нормо-час)',
    code: 'norm-hour',
    description: 'Оплата по нормо-часам',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 3,
    name: 'Договор подряда (стоимость)',
    code: 'cost',
    description: 'Оплата по фиксированной стоимости',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

export const ContractTypeService = {
  async getAllContractTypes(): Promise<ContractType[]> {
    try {
      // Пробуем получить данные с API
      const response = await systemApi.get('/api/ContractType');
      return response.data;
    } catch (error) {
      console.warn('API недоступно, используем временные данные типов договоров');
      // Возвращаем временные данные для разработки
      return mockContractTypes;
    }
  },

  async getContractTypeById(id: number): Promise<ContractType> {
    try {
      const response = await systemApi.get(`/api/ContractTypes/${id}`);
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
  },

  async createContractType(contractTypeData: CreateContractTypeRequest): Promise<ContractType> {
    const response = await systemApi.post('/api/ContractType', contractTypeData);
    return response.data;
  },

  async updateContractType(id: number, contractTypeData: UpdateContractTypeRequest): Promise<void> {
    await systemApi.put(`/api/ContractType/${id}`, contractTypeData);
  },

  async deleteContractType(id: number): Promise<void> {
    await systemApi.delete(`/api/ContractType/${id}`);
  }
};