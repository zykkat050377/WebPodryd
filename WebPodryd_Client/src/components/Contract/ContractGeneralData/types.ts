// src/components/Contract/ContractGeneralData/types.ts
import { ContractTemplateItem, ActTemplateItem } from '../../../../types/contract';

export interface WorkServiceBlockProps {
  workService: string;
  index: number;
  cost: number;
  costLabel: string;
  costInWords: string;
  isMainService: boolean;
  canEdit: boolean;
  availableOptions: string[];
  onWorkServiceChange: (index: number, newValue: string | null) => void;
  onRemove: (index: number) => void;
  selectedStructuralUnit: string;
}

export interface PaymentFormProps {
  selectedStructuralUnit: string;
  selectedContractName: ContractTemplateItem | null;
  actTemplates: ActTemplateItem[];
  selectedWorkServices: string[];
  onWorkServiceChange: (index: number, newValue: string | null) => void;
  onAddWorkService: () => void;
  onRemoveWorkService: (index: number) => void;
  getAvailableOptions: (currentIndex: number) => string[];
  getCostForWorkService: (workService: string) => number;
  templateType: 'operation' | 'norm-hour' | 'cost';
  userRole?: string;
}
