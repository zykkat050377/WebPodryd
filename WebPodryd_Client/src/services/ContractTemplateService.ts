// src/services/ContractTemplateService.ts
import { mainApi } from './axiosConfig';

export interface ContractTemplate {
  id: number;
  name: string;
  type: 'operation' | 'norm-hour' | 'cost';
  contractTypeId: number;
  contractType?: {
    id: number;
    name: string;
    code: string;
    description: string;
  };
  workServices: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractTemplateRequest {
  name: string;
  type: 'operation' | 'norm-hour' | 'cost';
  contractTypeId: number;
  workServices: string[];
}

export interface UpdateContractTemplateRequest {
  name?: string;
  type?: 'operation' | 'norm-hour' | 'cost';
  contractTypeId?: number;
  workServices?: string[];
}

interface GetTemplatesParams {
  type?: string;
  contractTypeId?: number;
  search?: string;
}

class ContractTemplateService {
  async getContractTemplates(params?: GetTemplatesParams): Promise<ContractTemplate[]> {
    try {
      console.log('Fetching contract templates with params:', params);
      const response = await mainApi.get('/api/contracttemplate', { params });
      console.log('Contract templates fetched successfully:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('Error fetching contract templates:', error);
      return [];
    }
  }

  async createContractTemplate(data: CreateContractTemplateRequest): Promise<ContractTemplate> {
    try {
      console.log('Sending template data:', data);

      // Валидация перед отправкой
      if (!data.type) {
        throw new Error('Type is required');
      }

      if (!data.contractTypeId) {
        throw new Error('ContractTypeId is required');
      }

      // Убедимся, что workServices всегда массив
      const requestData = {
        name: data.name,
        type: data.type,
        contractTypeId: data.contractTypeId,
        workServices: Array.isArray(data.workServices) ? data.workServices : []
      };

      console.log('Final request data:', requestData);

      const response = await mainApi.post('/api/contracttemplate', requestData);
      console.log('Template created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating contract template:', error);
      if (error.response?.data) {
        console.error('Server response:', error.response.data);
        console.error('Server status:', error.response.status);
        console.error('Server headers:', error.response.headers);
      }
      throw error;
    }
  }

  async updateContractTemplate(id: number, data: UpdateContractTemplateRequest): Promise<void> {
    try {
      console.log('Updating template', id, 'with data:', data);
      await mainApi.put(`/api/contracttemplate/${id}`, data);
      console.log('Template updated successfully');
    } catch (error: any) {
      console.error('Error updating contract template:', error);
      if (error.response?.data) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
  }

  async deleteContractTemplate(id: number): Promise<void> {
    try {
      console.log('Deleting template:', id);
      await mainApi.delete(`/api/contracttemplate/${id}`);
      console.log('Template deleted successfully');
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
        { value: 'operation', label: 'За операцию', id: 1 },
        { value: 'norm-hour', label: 'Нормо-часа', id: 2 },
        { value: 'cost', label: 'Стоимость', id: 3 }
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

  async getTemplatesByContractType(contractTypeId: number): Promise<ContractTemplate[]> {
    try {
      console.log('Fetching templates for contract type:', contractTypeId);
      const response = await mainApi.get(`/api/contracttemplate/by-contract-type/${contractTypeId}`);
      console.log('Templates fetched successfully:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('Error fetching templates by contract type:', error);
      return [];
    }
  }
}

// Экспортируем экземпляр класса
const contractTemplateService = new ContractTemplateService();
export default contractTemplateService;