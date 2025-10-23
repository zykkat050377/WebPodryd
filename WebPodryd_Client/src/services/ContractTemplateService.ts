// src/services/ContractTemplateService.ts
import { mainApi } from './axiosConfig';

export interface ContractTemplate {
  id: number;
  name: string;
  type: 'operation' | 'norm-hour' | 'cost';
  workServices: string[];
  operationsPer8Hours: number;
  createdAt: string;
  updatedAt: string;
}

interface GetTemplatesParams {
  type?: string;
  search?: string;
}

class ContractTemplateService {
  async getContractTemplates(params?: GetTemplatesParams): Promise<ContractTemplate[]> {
    try {
      const response = await mainApi.get('/api/contracttemplate', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching contract templates:', error);
      // Если API недоступен, возвращаем пустой массив
      return [];
    }
  }

  async createContractTemplate(data: any): Promise<ContractTemplate> {
    try {
      const response = await mainApi.post('/api/contracttemplate', data);
      return response.data;
    } catch (error) {
      console.error('Error creating contract template:', error);
      throw error;
    }
  }

  async updateContractTemplate(id: number, data: any): Promise<void> {
    try {
      await mainApi.put(`/api/contracttemplate/${id}`, data);
    } catch (error) {
      console.error('Error updating contract template:', error);
      throw error;
    }
  }

  async deleteContractTemplate(id: number): Promise<void> {
    try {
      await mainApi.delete(`/api/contracttemplate/${id}`);
    } catch (error) {
      console.error('Error deleting contract template:', error);
      throw error;
    }
  }

  async getContractTemplateTypes(): Promise<any[]> {
    try {
      const response = await mainApi.get('/api/contracttemplate/types');
      return response.data;
    } catch (error) {
      console.error('Error fetching template types:', error);
      return [
        { value: 'operation', label: 'За операцию' },
        { value: 'norm-hour', label: 'Нормо-часа' },
        { value: 'cost', label: 'Стоимость' }
      ];
    }
  }

  async getWorkServicesByType(type: string): Promise<string[]> {
    try {
      const response = await mainApi.get(`/api/contracttemplate/${type}/services`);
      return response.data;
    } catch (error) {
      console.error('Error fetching work services:', error);
      return [];
    }
  }
}

// Экспортируем экземпляр класса
const contractTemplateService = new ContractTemplateService();
export default contractTemplateService;