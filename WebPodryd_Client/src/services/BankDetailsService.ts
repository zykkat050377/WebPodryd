//src/services/BankDetailsService.ts

import { mainApi } from './axiosConfig';
import { BankDetails } from '../types/contract';

export const BankDetailsService = {
  async getByContractorId(contractorId: string): Promise<BankDetails> {
    const response = await api.get(`/api/BankDetails/contractor/${contractorId}`);
    return response.data;
  },

  async saveBankDetails(contractorId: string, bankDetails: Omit<BankDetails, 'id' | 'contractorId' | 'createdAt' | 'updatedAt'>): Promise<BankDetails> {
    const response = await api.post(`/api/BankDetails`, {
      contractorId,
      ...bankDetails
    });
    return response.data;
  },

  async deleteBankDetails(id: string): Promise<void> {
    await api.delete(`/api/BankDetails/${id}`);
  }
};
