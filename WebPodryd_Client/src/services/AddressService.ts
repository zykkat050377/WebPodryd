//src/services/AddressService.ts

import { mainApi } from './axiosConfig';
import { Address } from '../types/contract';

export const AddressService = {
  async getByContractorId(contractorId: string): Promise<Address> {
    const response = await api.get(`/api/Address/contractor/${contractorId}`);
    return response.data;
  },

  async saveAddress(contractorId: string, address: Omit<Address, 'id' | 'contractorId' | 'createdAt' | 'updatedAt'>): Promise<Address> {
    const response = await api.post(`/api/Address`, {
      contractorId,
      ...address
    });
    return response.data;
  }
};
