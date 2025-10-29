// src/services/ActTemplateService.tsx
import { mainApi } from './axiosConfig'; // Используем mainApi для ActTemplate
import { ActTemplate, WorkService } from '../types/contract';


const API_BASE_URL = '/api/acttemplate';

export interface CreateActTemplateData {
  name: string;
  contractTypeId: number;
  contractTemplateId: number;
  workServices: WorkService[];
  departmentId: number;
  totalCost: number;
}

export interface UpdateActTemplateData {
  name?: string;
  contractTypeId?: number;
  contractTemplateId?: number;
  workServices?: WorkService[];
  departmentId?: number;
  totalCost?: number;
}

class ActTemplateService {
  async getActTemplates(contractTypeId?: number, search?: string, departmentId?: number): Promise<ActTemplate[]> {
    try {
      const params: any = {};
      if (contractTypeId) params.contractTypeId = contractTypeId;
      if (search) params.search = search;
      if (departmentId) params.departmentId = departmentId;

      const response = await mainApi.get(API_BASE_URL, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching act templates:', error);
      return [];
    }
  }

  async getActTemplate(id: number): Promise<ActTemplate> {
    try {
      const response = await mainApi.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching act template ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Шаблон акта не найден');
    }
  }

  async createActTemplate(data: CreateActTemplateData): Promise<ActTemplate> {
    try {
      const response = await mainApi.post(API_BASE_URL, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating act template:', error);
      throw error;
    }
  }

  async updateActTemplate(id: number, data: UpdateActTemplateData): Promise<ActTemplate> {
    try {
      const response = await mainApi.put(`${API_BASE_URL}/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating act template ${id}:`, error);
      throw error;
    }
  }

  async deleteActTemplate(id: number): Promise<void> {
    try {
      await mainApi.delete(`${API_BASE_URL}/${id}`);
    } catch (error: any) {
      console.error(`Error deleting act template ${id}:`, error);
      const errorMessage = error.response?.data?.message || 'Ошибка удаления шаблона акта';
      throw new Error(errorMessage);
    }
  }

  async getActTemplatesByContractType(contractTypeId: number): Promise<ActTemplate[]> {
    try {
      const response = await mainApi.get(`${API_BASE_URL}/by-contract-type/${contractTypeId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching act templates by contract type:', error);
      return [];
    }
  }
}

export default new ActTemplateService();