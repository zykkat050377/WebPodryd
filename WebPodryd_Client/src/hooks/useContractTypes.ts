// src/hooks/useContractTypes.ts
import { useState, useEffect } from 'react';
import { ContractTypeService, ContractType } from '../services/ContractTypeService';

export const useContractTypes = () => {
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContractTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const types = await ContractTypeService.getAllContractTypes();
      setContractTypes(types);
    } catch (err: any) {
      console.error('Ошибка загрузки типов договоров:', err);
      setError(err.message || 'Не удалось загрузить типы договоров');
      // Устанавливаем пустой массив при ошибке
      setContractTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractTypes();
  }, []);

  return {
    contractTypes,
    loading,
    error,
    refetch: fetchContractTypes
  };
};