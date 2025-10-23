// src/components/Contract/ContractGeneralData/ContractGeneralData.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Autocomplete,
  CircularProgress,
  Alert
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useStructuralUnits } from '../../../context/StructuralUnitsContext';
import { useAuth } from '../../../context/AuthContext';
import { systemApi } from '../../../services/axiosConfig';
import { useContractTypes } from '../../../hooks/useContractTypes';
import {
  SigningEmployee,
  ContractTemplateItem,
  ActTemplateItem
} from '../../../../types/contract';

// Импортируем новые компоненты
import OperationPaymentForm from './OperationPaymentForm';
import NormHourPaymentForm from './NormHourPaymentForm';
import CostPaymentForm from './CostPaymentForm';
import { numberToWordsWithCents } from './utils';

interface ContractGeneralDataProps {
  onBack: () => void;
  expanded: boolean;
  onToggle: () => void;
}

const ContractGeneralData: React.FC<ContractGeneralDataProps> = ({
  onBack,
  expanded,
  onToggle
}) => {
  const { structuralUnits, selectedUnit } = useStructuralUnits();
  const { user } = useAuth();
  const { contractTypes, loading: typesLoading, error: typesError } = useContractTypes();
  const [selectedStructuralUnit, setSelectedStructuralUnit] = useState<string>('');
  const [selectedContractTypeId, setSelectedContractTypeId] = useState<string>(''); // Исправлено на string
  const [selectedContractName, setSelectedContractName] = useState<ContractTemplateItem | null>(null);
  const [contractTemplates, setContractTemplates] = useState<ContractTemplateItem[]>([]);
  const [actTemplates, setActTemplates] = useState<ActTemplateItem[]>([]);
  const [contractNumber, setContractNumber] = useState<string>('');
  const [signingEmployees, setSigningEmployees] = useState<SigningEmployee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<SigningEmployee | null>(null);

  // Состояния для работ/услуг по типам
  const [selectedWorkServicesNormHour, setSelectedWorkServicesNormHour] = useState<string[]>([]);
  const [selectedWorkServicesOperation, setSelectedWorkServicesOperation] = useState<string[]>([]);
  const [selectedWorkServicesCost, setSelectedWorkServicesCost] = useState<string[]>([]);

  const [customerData, setCustomerData] = useState({
    position: '',
    fullName: '',
    warrantNumber: '',
    warrantDate: '',
    warrantCode: ''
  });

  // Моковые данные для договоров
  const mockContractTemplates: ContractTemplateItem[] = [
    {
      id: 1,
      name: 'ДП-выкладчик',
      contractTypeId: 1,
      workServices: [
        'Выкладка товара по планограмме',
        'Мерчандайзинг продукции',
        'Расстановка ценников',
        'Контроль сроков годности',
        'Поддержание чистоты на полках'
      ],
      operationsPer8Hours: 120,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'ДП-комплектовщик',
      contractTypeId: 1,
      workServices: [
        'Комплектация заказов по накладным',
        'Упаковка товара',
        'Проверка качества продукции',
        'Маркировка готовых заказов',
        'Погрузка товара в транспорт'
      ],
      operationsPer8Hours: 80,
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16'
    },
    {
      id: 3,
      name: 'ДП-контролер-кассир',
      contractTypeId: 2,
      workServices: [
        'Контроль кассовых операций',
        'Проверка чеков и документов',
        'Инвентаризация товаров',
        'Обучение новых кассиров',
        'Составление отчетности по кассам'
      ],
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17'
    },
    {
      id: 4,
      name: 'ДП-уборщик',
      contractTypeId: 3,
      workServices: [
        'Ежедневная уборка помещений',
        'Санобработка поверхностей',
        'Вынос мусора и утилизация',
        'Мытье окон и витрин',
        'Уход за прилегающей территорией'
      ],
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18'
    }
  ];

  // Моковые данные для актов
  const mockActTemplates: ActTemplateItem[] = [
    {
      id: 1,
      contractTypeId: 1,
      workServices: ['Выкладка товара по планограмме'],
      operationCost: 4.50,
      paymentFields: [],
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20'
    },
    {
      id: 2,
      contractTypeId: 1,
      workServices: ['Мерчандайзинг продукции'],
      operationCost: 5.20,
      paymentFields: [],
      createdAt: '2024-01-21',
      updatedAt: '2024-01-21'
    },
    {
      id: 3,
      contractTypeId: 2,
      workServices: ['Контроль кассовых операций'],
      operationCost: 15.50,
      paymentFields: [],
      createdAt: '2024-01-22',
      updatedAt: '2024-01-22'
    },
    {
      id: 4,
      contractTypeId: 2,
      workServices: ['Проверка чеков и документов'],
      operationCost: 12.75,
      paymentFields: [],
      createdAt: '2024-01-23',
      updatedAt: '2024-01-23'
    },
    {
      id: 5,
      contractTypeId: 2,
      workServices: ['Инвентаризация товаров'],
      operationCost: 18.25,
      paymentFields: [],
      createdAt: '2024-01-24',
      updatedAt: '2024-01-24'
    },
    {
      id: 6,
      contractTypeId: 3,
      workServices: ['Ежедневная уборка помещений'],
      operationCost: 1800.00,
      paymentFields: [],
      createdAt: '2024-01-25',
      updatedAt: '2024-01-25'
    },
    {
      id: 7,
      contractTypeId: 3,
      workServices: ['Санобработка поверхностей'],
      operationCost: 1200.00,
      paymentFields: [],
      createdAt: '2024-01-26',
      updatedAt: '2024-01-26'
    }
  ];

  // Получение кода типа договора по ID
  const getContractTypeCode = (contractTypeId: number): string => {
    const type = contractTypes.find(t => t.id === parseInt(contractTypeId.toString()));
    return type?.code || '';
  };

  // Функция для получения доступных работ/услуг для нормо-часа
  const getAvailableWorkServicesForNormHour = (): string[] => {
    if (!selectedStructuralUnit || !selectedContractName) {
      return [];
    }
    const availableServices = actTemplates
      .filter(template => getContractTypeCode(template.contractTypeId) === 'norm-hour')
      .flatMap(template => template.workServices);
    return [...new Set(availableServices)];
  };

  // Функция для получения доступных работ/услуг для операции
  const getAvailableWorkServicesForOperation = (): string[] => {
    if (!selectedStructuralUnit || !selectedContractName) {
      return [];
    }
    const availableServices = actTemplates
      .filter(template => getContractTypeCode(template.contractTypeId) === 'operation')
      .flatMap(template => template.workServices);
    return [...new Set(availableServices)];
  };

  // Функция для получения доступных работ/услуг для стоимости
  const getAvailableWorkServicesForCost = (): string[] => {
    if (!selectedStructuralUnit || !selectedContractName) {
      return [];
    }
    const availableServices = actTemplates
      .filter(template => getContractTypeCode(template.contractTypeId) === 'cost')
      .flatMap(template => template.workServices);
    return [...new Set(availableServices)];
  };

  // Функция для получения стоимости нормо-часа для конкретной работы/услуги
  const getHourCostForWorkService = (workService: string): number => {
    const actTemplate = actTemplates.find(template =>
      getContractTypeCode(template.contractTypeId) === 'norm-hour' &&
      template.workServices.includes(workService)
    );
    return actTemplate?.operationCost || 0;
  };

  // Функция для получения стоимости операции для конкретной работы/услуги
  const getOperationCostForWorkService = (workService: string): number => {
    const actTemplate = actTemplates.find(template =>
      getContractTypeCode(template.contractTypeId) === 'operation' &&
      template.workServices.includes(workService)
    );
    return actTemplate?.operationCost || 0;
  };

  // Функция для получения стоимости для типа cost
  const getCostForWorkService = (workService: string): number => {
    const actTemplate = actTemplates.find(template =>
      getContractTypeCode(template.contractTypeId) === 'cost' &&
      template.workServices.includes(workService)
    );
    return actTemplate?.operationCost || 0;
  };

  // Получаем код выбранной структурной единицы
  const getSelectedUnitCode = (): string => {
    let unitCode = '';

    if (selectedUnit) {
      unitCode = selectedUnit.code?.toString() ||
                 selectedUnit.id?.toString() ||
                 '';
    }

    if (!unitCode && selectedStructuralUnit) {
      const unit = structuralUnits.find(unit =>
        unit.id === selectedStructuralUnit ||
        unit.id?.toString() === selectedStructuralUnit
      );

      if (unit) {
        unitCode = unit.code?.toString() ||
                   unit.id?.toString() ||
                   '';
      }
    }

    return unitCode;
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  // Функция для получения сотрудников с правом заключения ДП
  const fetchSigningEmployees = async (): Promise<void> => {
    try {
      const response = await systemApi.get('/api/SigningEmployee');

      if (response.headers['content-type']?.includes('application/json')) {
        setSigningEmployees(response.data);
      } else {
        console.error('Сервер вернул не-JSON ответ');
        setSigningEmployees([]);
      }
    } catch (error: any) {
      console.error('Ошибка при загрузке сотрудников:', error);
      setSigningEmployees([]);
    }
  };

  // Функция для получения шаблонов договоров
  const fetchContractTemplates = async (): Promise<void> => {
    try {
      setContractTemplates(mockContractTemplates);
    } catch (error: any) {
      console.error('Ошибка при загрузке шаблонов договоров:', error);
      setContractTemplates(mockContractTemplates);
    }
  };

  // Функция для получения шаблонов актов
  const fetchActTemplates = async (): Promise<void> => {
    try {
      setActTemplates(mockActTemplates);
    } catch (error: any) {
      console.error('Ошибка при загрузке шаблонов актов:', error);
      setActTemplates(mockActTemplates);
    }
  };

  // Функция для получения следующего порядкового номера из API
  const getNextContractSequence = async (unitCode: string): Promise<number> => {
    try {
      return 1;
    } catch (error) {
      console.error('Ошибка при получении следующего номера договора:', error);
      return 1;
    }
  };

  const generateContractNumber = async (): Promise<string> => {
    const unitCode = getSelectedUnitCode();

    if (!unitCode) return '';

    const nextSequence = await getNextContractSequence(unitCode);
    const sequenceStr = nextSequence.toString().padStart(2, '0');
    const currentYear = new Date().getFullYear().toString().slice(-2);

    return `${sequenceStr}/${currentYear}/${unitCode}`;
  };

  // Обработчик выбора сотрудника
  const handleEmployeeSelect = (employee: SigningEmployee | null) => {
    setSelectedEmployee(employee);

    if (employee) {
      setCustomerData({
        position: employee.position,
        fullName: `${employee.lastName} ${employee.firstName} ${employee.middleName || ''}`.trim(),
        warrantNumber: employee.warrantNumber,
        warrantDate: employee.startDate ? new Date(employee.startDate).toISOString().split('T')[0] : '',
        warrantCode: ''
      });
    } else {
      setCustomerData({
        position: '',
        fullName: '',
        warrantNumber: '',
        warrantDate: '',
        warrantCode: ''
      });
    }
  };

  // Обработчик выбора названия договора
  const handleContractNameSelect = (contract: ContractTemplateItem | null) => {
    setSelectedContractName(contract);

    if (contract) {
      const contractTypeCode = getContractTypeCode(contract.contractTypeId);

      if (contractTypeCode === 'norm-hour') {
        // Для нормо-часа автоматически выбираем первую работу/услугу как обязательную
        const firstWorkService = contract.workServices[0];
        if (firstWorkService) {
          setSelectedWorkServicesNormHour([firstWorkService]);
        }
      } else if (contractTypeCode === 'operation') {
        // Для операции автоматически выбираем первую работу/услугу как обязательную
        const firstWorkService = contract.workServices[0];
        if (firstWorkService) {
          setSelectedWorkServicesOperation([firstWorkService]);
        }
      } else if (contractTypeCode === 'cost') {
        // Для стоимости автоматически выбираем первую работу/услугу как обязательную
        const firstWorkService = contract.workServices[0];
        if (firstWorkService) {
          setSelectedWorkServicesCost([firstWorkService]);
        }
      }
    } else {
      setSelectedWorkServicesNormHour([]);
      setSelectedWorkServicesOperation([]);
      setSelectedWorkServicesCost([]);
    }
  };

  // Получение отфильтрованных шаблонов договоров по выбранному типу
  const getFilteredContractTemplates = (): ContractTemplateItem[] => {
    const contractTypeId = parseInt(selectedContractTypeId);
    return contractTemplates.filter(template => template.contractTypeId === contractTypeId);
  };

  // Обработчики для нормо-часа
  const handleWorkServiceSelectNormHour = (index: number, newValue: string | null) => {
    if (!newValue) return;

    const newSelectedServices = [...selectedWorkServicesNormHour];

    if (index < newSelectedServices.length) {
      newSelectedServices[index] = newValue;
    } else {
      newSelectedServices.push(newValue);
    }

    setSelectedWorkServicesNormHour(newSelectedServices);
  };

  const addWorkServiceForNormHour = () => {
    if (selectedWorkServicesNormHour.length >= 5) {
      alert('Максимальное количество работ/услуг - 5');
      return;
    }
    const newSelectedServices = [...selectedWorkServicesNormHour, ''];
    setSelectedWorkServicesNormHour(newSelectedServices);
  };

  const removeWorkServiceForNormHour = (index: number) => {
    if (index === 0) {
      alert('Первая работа/услуга обязательна и не может быть удалена');
      return;
    }
    if (selectedWorkServicesNormHour.length > 1) {
      const newSelectedServices = selectedWorkServicesNormHour.filter((_, i) => i !== index);
      setSelectedWorkServicesNormHour(newSelectedServices);
    }
  };

  // Обработчики для операции
  const handleWorkServiceSelectOperation = (index: number, newValue: string | null) => {
    if (!newValue) return;

    const newSelectedServices = [...selectedWorkServicesOperation];

    if (index < newSelectedServices.length) {
      newSelectedServices[index] = newValue;
    } else {
      newSelectedServices.push(newValue);
    }

    setSelectedWorkServicesOperation(newSelectedServices);
  };

  const addWorkServiceForOperation = () => {
    if (selectedWorkServicesOperation.length >= 5) {
      alert('Максимальное количество работ/услуг - 5');
      return;
    }
    const newSelectedServices = [...selectedWorkServicesOperation, ''];
    setSelectedWorkServicesOperation(newSelectedServices);
  };

  const removeWorkServiceForOperation = (index: number) => {
    if (index === 0) {
      alert('Первая работа/услуга обязательна и не может быть удалена');
      return;
    }
    if (selectedWorkServicesOperation.length > 1) {
      const newSelectedServices = selectedWorkServicesOperation.filter((_, i) => i !== index);
      setSelectedWorkServicesOperation(newSelectedServices);
    }
  };

  // Обработчики для стоимости
  const handleWorkServiceSelectCost = (index: number, newValue: string | null) => {
    if (!newValue) return;

    const newSelectedServices = [...selectedWorkServicesCost];

    if (index < newSelectedServices.length) {
      newSelectedServices[index] = newValue;
    } else {
      newSelectedServices.push(newValue);
    }

    setSelectedWorkServicesCost(newSelectedServices);
  };

  const addWorkServiceForCost = () => {
    if (selectedWorkServicesCost.length >= 5) {
      alert('Максимальное количество работ/услуг - 5');
      return;
    }
    const newSelectedServices = [...selectedWorkServicesCost, ''];
    setSelectedWorkServicesCost(newSelectedServices);
  };

  const removeWorkServiceForCost = (index: number) => {
    if (index === 0) {
      alert('Первая работа/услуга обязательна и не может быть удалена');
      return;
    }
    if (selectedWorkServicesCost.length > 1) {
      const newSelectedServices = selectedWorkServicesCost.filter((_, i) => i !== index);
      setSelectedWorkServicesCost(newSelectedServices);
    }
  };

  // Получение доступных опций для выпадающего списка с учетом уже выбранных
  const getAvailableOptionsForWorkService = (currentIndex: number, contractTypeId: number): string[] => {
    const contractTypeCode = getContractTypeCode(contractTypeId);
    const availableServices = contractTypeCode === 'norm-hour'
      ? getAvailableWorkServicesForNormHour()
      : contractTypeCode === 'operation'
      ? getAvailableWorkServicesForOperation()
      : getAvailableWorkServicesForCost();

    const selectedServices = contractTypeCode === 'norm-hour'
      ? selectedWorkServicesNormHour
      : contractTypeCode === 'operation'
      ? selectedWorkServicesOperation
      : selectedWorkServicesCost;

    // Исключаем уже выбранные услуги, кроме текущей
    return availableServices.filter(service =>
      !selectedServices.some((selectedService, index) =>
        index !== currentIndex && selectedService === service
      )
    );
  };

  // Функции renderOption
  const renderEmployeeOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    employee: SigningEmployee
  ) => (
    <li {...props} key={employee.id}>
      <Box>
        <Typography variant="body1">
          {employee.lastName} {employee.firstName} {employee.middleName || ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {employee.position}
        </Typography>
      </Box>
    </li>
  );

  const renderContractNameOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    contract: ContractTemplateItem
  ) => (
    <li {...props} key={contract.id}>
      <Box>
        <Typography variant="body1">
          {contract.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {contract.workServices.slice(0, 2).join(', ')}
          {contract.workServices.length > 2 && '...'}
        </Typography>
      </Box>
    </li>
  );

  // Рендер формы оплаты в зависимости от типа
  const renderPaymentForm = () => {
    if (!selectedContractTypeId) return null;

    const contractTypeId = parseInt(selectedContractTypeId);
    const contractTypeCode = getContractTypeCode(contractTypeId);
    const commonProps = {
      selectedStructuralUnit,
      selectedContractName,
      actTemplates,
      getAvailableOptions: (index: number) => getAvailableOptionsForWorkService(index, contractTypeId),
      getCostForWorkService: contractTypeCode === 'norm-hour'
        ? getHourCostForWorkService
        : contractTypeCode === 'operation'
        ? getOperationCostForWorkService
        : getCostForWorkService,
      userRole: user?.role
    };

    switch (contractTypeCode) {
      case 'operation':
        return (
          <OperationPaymentForm
            {...commonProps}
            selectedWorkServices={selectedWorkServicesOperation}
            onWorkServiceChange={handleWorkServiceSelectOperation}
            onAddWorkService={addWorkServiceForOperation}
            onRemoveWorkService={removeWorkServiceForOperation}
            templateType="operation"
          />
        );

      case 'norm-hour':
        return (
          <NormHourPaymentForm
            {...commonProps}
            selectedWorkServices={selectedWorkServicesNormHour}
            onWorkServiceChange={handleWorkServiceSelectNormHour}
            onAddWorkService={addWorkServiceForNormHour}
            onRemoveWorkService={removeWorkServiceForNormHour}
            templateType="norm-hour"
          />
        );

      case 'cost':
        return (
          <CostPaymentForm
            {...commonProps}
            selectedWorkServices={selectedWorkServicesCost}
            onWorkServiceChange={handleWorkServiceSelectCost}
            onAddWorkService={addWorkServiceForCost}
            onRemoveWorkService={removeWorkServiceForCost}
            templateType="cost"
          />
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    const updateContractNumber = async () => {
      if (selectedStructuralUnit) {
        const newContractNumber = await generateContractNumber();
        setContractNumber(newContractNumber);
      } else {
        setContractNumber('');
      }
    };

    updateContractNumber();
  }, [selectedStructuralUnit, selectedUnit]);

  // Загружаем сотрудников и шаблоны договоров при монтировании компонента
  useEffect(() => {
    fetchSigningEmployees();
    fetchContractTemplates();
    fetchActTemplates();
  }, []);

  // Сбрасываем выбранное название договора при изменении типа
  useEffect(() => {
    setSelectedContractName(null);
    setSelectedWorkServicesNormHour([]);
    setSelectedWorkServicesOperation([]);
    setSelectedWorkServicesCost([]);
  }, [selectedContractTypeId]);

  // Автоматически выбираем структурную единицу из контекста при монтировании
  useEffect(() => {
    if (selectedUnit && !selectedStructuralUnit) {
      setSelectedStructuralUnit(selectedUnit.id?.toString() || '');
    }
  }, [selectedUnit]);

  const handleStructuralUnitChange = (event: any) => {
    const unitId = event.target.value;
    setSelectedStructuralUnit(unitId);
  };

  // Исправленный обработчик для типа договора
  const handleContractTypeChange = (event: any) => {
    const contractTypeId = event.target.value;
    setSelectedContractTypeId(contractTypeId);
  };

  const handleCustomerDataChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const isFormDisabled = !selectedStructuralUnit;
  const filteredContractTemplates = getFilteredContractTemplates();

  if (typesLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Общие данные по договору:</Typography>
          <IconButton disabled>
            <ExpandMore />
          </IconButton>
        </Box>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography>Загрузка типов договоров...</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ cursor: 'pointer' }} onClick={onToggle}>
        <Typography variant="h6">Общие данные по договору:</Typography>
        <IconButton>{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
      </Box>

      <Collapse in={expanded}>
        {/* Выбор структурной единицы */}
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Выбрать структурную единицу</InputLabel>
          <Select
            value={selectedStructuralUnit}
            onChange={handleStructuralUnitChange}
            label="Выбрать структурную единицу *"
          >
            {structuralUnits.map((unit) => (
              <MenuItem key={unit.id} value={unit.id?.toString() || ''}>
                {unit.name} {unit.code ? `(${unit.code})` : `(ID: ${unit.id})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Основные данные договора */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="№ Договора"
              fullWidth
              margin="normal"
              value={contractNumber}
              InputProps={{ readOnly: true }}
              disabled={isFormDisabled}
              helperText={`Формат: порядковый номер/год/(код СЕ: ${getSelectedUnitCode()})`}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Дата начала договора"
              fullWidth
              margin="normal"
              type="date"
              InputLabelProps={{ shrink: true }}
              defaultValue={getCurrentDate()}
              disabled={isFormDisabled}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Дата окончания договора"
              fullWidth
              margin="normal"
              type="date"
              InputLabelProps={{ shrink: true }}
              disabled={isFormDisabled}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            <strong>Заказчик:</strong>
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={signingEmployees}
                getOptionLabel={(employee) =>
                  `${employee.lastName} ${employee.firstName} ${employee.middleName || ''}`.trim()
                }
                value={selectedEmployee}
                onChange={(event, newValue) => handleEmployeeSelect(newValue)}
                disabled={!selectedStructuralUnit}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="ФИО"
                    margin="normal"
                    fullWidth
                    disabled={!selectedStructuralUnit}
                    placeholder={selectedStructuralUnit ? "Выберите сотрудника" : "Сначала выберите структурную единицу"}
                  />
                )}
                renderOption={renderEmployeeOption}
                noOptionsText={selectedStructuralUnit ? "Нет доступных сотрудников" : "Сначала выберите структурную единицу"}
                key={selectedStructuralUnit}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Должность"
                fullWidth
                margin="normal"
                value={customerData.position}
                onChange={handleCustomerDataChange('position')}
                disabled={isFormDisabled}
                placeholder={selectedStructuralUnit ? "" : "Сначала выберите структурную единицу"}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Основание:
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="№ доверенности"
                    fullWidth
                    margin="normal"
                    value={customerData.warrantNumber}
                    onChange={handleCustomerDataChange('warrantNumber')}
                    disabled={isFormDisabled}
                    placeholder={selectedStructuralUnit ? "" : "Сначала выберите СЕ"}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="от"
                    fullWidth
                    margin="normal"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={customerData.warrantDate}
                    onChange={handleCustomerDataChange('warrantDate')}
                    disabled={isFormDisabled}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="ЦФО"
                    fullWidth
                    margin="normal"
                    value={customerData.warrantCode}
                    onChange={handleCustomerDataChange('warrantCode')}
                    disabled={isFormDisabled}
                    placeholder={selectedStructuralUnit ? "" : "Сначала выберите СЕ"}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Выбор шаблона договора и названия договора */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth margin="normal" error={!!typesError}>
              <InputLabel id="contract-type-label">Тип договора</InputLabel>
              <Select
                labelId="contract-type-label"
                value={selectedContractTypeId}
                onChange={handleContractTypeChange}
                label="Тип договора"
                disabled={isFormDisabled || typesLoading}
              >
                <MenuItem value="">
                  <em>Не выбрано</em>
                </MenuItem>
                {contractTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
              {typesError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {typesError}
                </Alert>
              )}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              options={filteredContractTemplates}
              getOptionLabel={(contract) => contract.name}
              value={selectedContractName}
              onChange={(event, newValue) => handleContractNameSelect(newValue)}
              disabled={!selectedStructuralUnit || !selectedContractTypeId}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Название договора"
                  margin="normal"
                  fullWidth
                  disabled={!selectedStructuralUnit || !selectedContractTypeId}
                  placeholder={
                    !selectedStructuralUnit
                      ? "Сначала выберите структурную единицу"
                      : !selectedContractTypeId
                      ? "Сначала выберите тип договора"
                      : "Выберите название договора"
                  }
                />
              )}
              renderOption={renderContractNameOption}
              noOptionsText={
                !selectedStructuralUnit
                  ? "Сначала выберите структурную единицу"
                  : !selectedContractTypeId
                  ? "Сначала выберите тип договора"
                  : `Нет доступных договоров для выбранного типа`
              }
              key={selectedContractTypeId}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Форма оплаты в зависимости от выбранного шаблона */}
        {renderPaymentForm()}

        {/* Кнопки управления */}
        <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={onBack}
            sx={{
              px: 4,
              py: 1.5,
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              }
            }}
          >
            &lt;&lt;&lt; Вернуться в начало
          </Button>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ContractGeneralData;