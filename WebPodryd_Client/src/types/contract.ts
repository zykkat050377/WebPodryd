// src/types/contract.ts
export interface Contractor {
  id: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  documentType: string;
  documentSeries?: string;
  documentNumber: string;
  citizenship?: string;
  issueDate?: string;
  issuedBy?: string;
  identificationNumber: string;
  mobilePhone: string;
  bankDetails?: BankDetails;
  address?: Address;
  createdAt: string;
  updatedAt: string;
}

export interface BankDetails {
  id: string;
  contractorId: string;
  IBAN: string;
  bankName: string;
  BIC: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  contractorId: string;
  country: string;
  region?: string;
  city?: string;
  district?: string;
  settlement?: string;
  streetType?: string;
  streetName?: string;
  house?: string;
  building?: string;
  apartment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractorRequest {
  lastName: string;
  firstName: string;
  middleName?: string;
  documentType: string;
  documentSeries?: string;
  documentNumber: string;
  citizenship?: string;
  issueDate?: string;
  issuedBy?: string;
  identificationNumber: string;
  mobilePhone: string;
  bankDetails?: Omit<BankDetails, 'id' | 'contractorId' | 'createdAt' | 'updatedAt'>;
  address?: Omit<Address, 'id' | 'contractorId' | 'createdAt' | 'updatedAt'>;
}

// Интерфейсы для ContractSettings
export interface ContractTemplate {
  id: number;
  name: string;
  type: 'operation' | 'norm-hour' | 'cost';
  contractTypeId: number;
  contractType: ContractType;
  workServices: string[];
  operationsPer8Hours?: number;
  createdAt: string;
  updatedAt: string;
}

// Интерфейсы для ActSettings
export interface WorkService {
  name: string;
  cost: number;
}

export interface ActTemplate {
  id: number;
  name: string;
  contractTypeId: number;
  contractType: ContractType;
  contractTemplateId: number;
  contractTemplate: ContractTemplate;
  workServices: WorkService[];
  departmentId: number;
  department: Department;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

// Интерфейсы для ContractGeneralData
export interface PaymentData {
  operation?: {
    items: Array<{
      name: string;
      cost: number;
      unit: string;
    }>;
  };
  normHour?: {
    hourCost: number;
    totalCost: number;
  };
  cost?: {
    totalCost: number;
  };
}

export interface SigningEmployee {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string;
  position: string;
  warrantNumber: string;
  startDate: string;
  endDate: string;
}

export interface ContractTemplateItem {
  id: number;
  name: string;
  type: 'operation' | 'norm-hour' | 'cost';
  workServices: string[];
  operationsPer8Hours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActTemplateItem {
  id: number;
  type: 'operation' | 'norm-hour' | 'cost';
  workServices: string[];
  operationCost: number;
  paymentFields: any[];
  createdAt: string;
  updatedAt: string;
}

// Общие интерфейсы для компонентов
export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Добавляем новые интерфейсы для актов
export interface ActData {
  id?: string;
  contractId: string;
  actNumber: string;
  actDate: string;
  periodStart: string;
  periodEnd: string;
  cfo: string; // Добавлено поле ЦФО
  totalAmount: number;
  workServices: ActWorkService[];
  status: 'draft' | 'signed' | 'paid';
  createdAt?: string;
  updatedAt?: string;
}

export interface ActWorkService {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  amount: number;
  unit: string;
}

export interface ContractForAct {
  id: string;
  contractNumber: string;
  contractDate: string;
  contractor: Contractor;
  templateType: 'operation' | 'norm-hour' | 'cost';
  templateName?: string;
  workServices: string[];
  status: 'active' | 'completed' | 'terminated';
  structuralUnit: string;
}

export interface ActSequence {
  contractNumber: string;
  lastActNumber: number;
  lastUpdated: string;
}

// НОВЫЕ ИНТЕРФЕЙСЫ ДЛЯ ДОГОВОРОВ
export interface Contract {
  id: string;
  contractNumber: string;
  contractDate: string;
  startDate: string;
  endDate: string;
  contractorId: string;
  contractor: Contractor;
  departmentId: number;
  department: Department;
  contractTypeId: number;
  contractType: ContractType;
  contractTypeCode: 'operation' | 'norm-hour' | 'cost';
  signingEmployeeId?: number;
  signingEmployee?: SigningEmployee;
  contractTemplateName: string;
  executorUserId: string;
  processed: boolean;
  transferDate?: string;
  galaxyEntryDate?: string;
  okEmployee?: string;
  workServices: ContractWorkService[];
  createdAt: string;
  updatedAt: string;
}

// Добавляем новые интерфейсы
export interface ContractType {
  id: number;
  name: string;
  code: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractWorkService {
  id: string;
  workServiceName: string;
  cost: number;
  operationCount?: number;
  hoursCount?: number;
  fixedCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractRequest {
  contractDate: string;
  startDate: string;
  endDate: string;
  contractorId: string;
  departmentId: number;
  contractTypeId: number;
  signingEmployeeId?: number;
  contractTemplateName: string;
  workServices: CreateContractWorkService[];
}

export interface CreateContractTemplateRequest {
  name: string;
  contractTypeId: number;
  workServices: string[];
  operationsPer8Hours?: number;
}

export interface CreateContractWorkService {
  workServiceName: string;
  cost: number;
  operationCount?: number;
  hoursCount?: number;
  fixedCost?: number;
}

export interface WorkService {
  name: string;
  cost: number;
}

export interface UpdateContractRequest {
  contractDate?: string;
  startDate?: string;
  endDate?: string;
  contractorId?: string;
  departmentId?: number;
  signingEmployeeId?: number;
  contractType?: 'operation' | 'norm-hour' | 'cost';
  contractTemplateName?: string;
  processed?: boolean;
  transferDate?: string;
  galaxyEntryDate?: string;
  okEmployee?: string;
  workServices?: CreateContractWorkService[];
}

export interface ContractFilters {
  department?: string;
  contractType?: string;
  search?: string;
  unprocessedOnly?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface ContractsResponse {
  contracts: Contract[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Department {
  id: number;
  name: string;
  code?: string;
}

export interface ContractStats {
  totalContracts: number;
  processedContracts: number;
  unprocessedContracts: number;
  byType: Array<{ type: string; count: number }>;
  byDepartment: Array<{ departmentId: number; departmentName: string; count: number }>;
}