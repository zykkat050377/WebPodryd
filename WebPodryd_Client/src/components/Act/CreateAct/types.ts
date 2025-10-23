// src/components/Act/CreateAct/types.ts
import { ActData, ActWorkService, ContractForAct } from '../../../../types/contract';

export interface ActFormProps {
  selectedContract: ContractForAct;
  actData: ActData;
  onWorkServiceChange: (index: number, field: string, value: any) => void;
  onAddWorkService: () => void;
  onRemoveWorkService: (index: number) => void;
  selectedStructuralUnit: string;
  numberToWordsWithCents: (num: number) => string;
}

export interface ContractForActWithTemplate extends ContractForAct {
  templateName?: string;
}

// Обновляем тип ActWorkService чтобы добавить флаг isFromContract
declare module '../../../../types/contract' {
  interface ActWorkService {
    isFromContract?: boolean;
  }
}