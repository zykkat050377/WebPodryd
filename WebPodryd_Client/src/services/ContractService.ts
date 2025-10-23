// src/services/ContractService.ts

import { systemApi } from './axiosConfig';
import { ContractTypeService } from './ContractTypeService';
import {
  Contractor,
  CreateContractorRequest,
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
  ContractFilters,
  ContractsResponse,
  ContractStats,
  ContractType
} from '../types/contract';

// Создаем псевдоним для api, если systemApi должен использоваться как api
const api = systemApi;

export const ContractService = {
  // Методы для подрядчиков
  async getAllContractors(): Promise<Contractor[]> {
    const response = await api.get('/api/Contractor');
    return response.data;
  },

  async getContractorById(id: string): Promise<Contractor> {
    const response = await api.get(`/api/Contractor/${id}`);
    return response.data;
  },

  async createContractor(contractorData: CreateContractorRequest): Promise<Contractor> {
    const response = await api.post('/api/Contractor', contractorData);
    return response.data;
  },

  async updateContractor(id: string, contractorData: Partial<CreateContractorRequest>): Promise<Contractor> {
    const response = await api.put(`/api/Contractor/${id}`, contractorData);
    return response.data;
  },

  async deleteContractor(id: string): Promise<void> {
    await api.delete(`/api/Contractor/${id}`);
  },

  // Новые методы для типов договоров
  async getContractTypes(): Promise<ContractType[]> {
    return await ContractTypeService.getAllContractTypes();
  },

  async getContractTypeByCode(code: string): Promise<ContractType> {
    return await ContractTypeService.getContractTypeByCode(code);
  },

  // Методы для договоров
  async getContracts(filters: ContractFilters = {}): Promise<ContractsResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/contract?${params}`);

    const totalCount = parseInt(response.headers['x-total-count'] || '0');
    const page = parseInt(response.headers['x-page'] || '1');
    const pageSize = parseInt(response.headers['x-page-size'] || '10');
    const totalPages = parseInt(response.headers['x-total-pages'] || '1');

    return {
      contracts: response.data,
      totalCount,
      page,
      pageSize,
      totalPages
    };
  },

  async getContractById(id: string): Promise<Contract> {
    const response = await api.get(`/api/contract/${id}`);
    return response.data;
  },

  async createContract(contractData: CreateContractRequest): Promise<Contract> {
    const response = await api.post('/api/contract', contractData);
    return response.data;
  },

  async updateContract(id: string, contractData: UpdateContractRequest): Promise<void> {
    await api.put(`/api/contract/${id}`, contractData);
  },

  async deleteContract(id: string): Promise<void> {
    await api.delete(`/api/contract/${id}`);
  },

  async getContractStats(): Promise<ContractStats> {
    const response = await api.get('/api/contract/stats');
    return response.data;
  },

  async markAsProcessed(id: string, okEmployee: string): Promise<void> {
    await api.put(`/api/contract/${id}`, {
      processed: true,
      transferDate: new Date().toISOString(),
      okEmployee
    });
  }
};