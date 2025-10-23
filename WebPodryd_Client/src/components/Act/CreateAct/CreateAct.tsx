// src/components/Act/CreateAct/CreateAct.tsx
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
  Alert
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useStructuralUnits } from '../../../context/StructuralUnitsContext';
import { useAuth } from '../../../context/AuthContext';
import {
  ContractForAct,
  ActData,
  ActWorkService,
  ActSequence
} from '../../../../types/contract';

// Импортируем компоненты форм
import OperationActForm from './OperationActForm';
import NormHourActForm from './NormHourActForm';
import CostActForm from './CostActForm';
import { ContractForActWithTemplate } from './types';

// Импортируем утилиты
import {
  numberToWordsWithCents,
  getUnitByTemplateType,
  getDefaultPrice,
  getContractTypeName
} from './utils';

interface CreateActProps {
  onBack: () => void;
  expanded: boolean;
  onToggle: () => void;
}

// Тестовые данные договоров
const mockContracts: ContractForActWithTemplate[] = [
  {
    id: '1',
    contractNumber: '01/25/1',
    contractDate: '2025-01-15',
    contractor: {
      id: '1',
      lastName: 'Иванов',
      firstName: 'Петр',
      middleName: 'Сергеевич',
      documentType: 'паспорт',
      documentSeries: 'МР',
      documentNumber: '1234567',
      citizenship: 'Республика Беларусь',
      issueDate: '2020-05-15',
      issuedBy: 'УВД Московского р-на г. Минска',
      identificationNumber: '31234567890123',
      mobilePhone: '+375291234567',
      bankDetails: {
        id: '1',
        contractorId: '1',
        IBAN: 'BY86ALFA30123000000001234567',
        bankName: 'Альфа-Банк',
        BIC: 'ALFABY2X',
        createdAt: '2025-01-15',
        updatedAt: '2025-01-15'
      },
      address: {
        id: '1',
        contractorId: '1',
        country: 'Беларусь',
        region: 'Минская область',
        city: 'Минск',
        district: 'Московский',
        settlement: 'Минск',
        streetType: 'ул.',
        streetName: 'Якуба Коласа',
        house: '25',
        building: '1',
        apartment: '45',
        createdAt: '2025-01-15',
        updatedAt: '2025-01-15'
      },
      createdAt: '2025-01-15',
      updatedAt: '2025-01-15'
    },
    templateType: 'operation',
    templateName: 'ДП-выкладчик',
    workServices: ['Выкладка товара по планограмме', 'Мерчандайзинг продукции'],
    status: 'active',
    structuralUnit: 'ОМА офис (1)'
  },
  {
    id: '2',
    contractNumber: '02/25/11118',
    contractDate: '2025-01-20',
    contractor: {
      id: '2',
      lastName: 'Петрова',
      firstName: 'Мария',
      middleName: 'Ивановна',
      documentType: 'паспорт',
      documentSeries: 'МС',
      documentNumber: '7654321',
      citizenship: 'Республика Беларусь',
      issueDate: '2019-08-20',
      issuedBy: 'УВД Первомайского р-на г. Минска',
      identificationNumber: '39876543210987',
      mobilePhone: '+375297654321',
      bankDetails: {
        id: '2',
        contractorId: '2',
        IBAN: 'BY86MTBK30123000000007654321',
        bankName: 'МТБанк',
        BIC: 'MTBKBY22',
        createdAt: '2025-01-20',
        updatedAt: '2025-01-20'
      },
      address: {
        id: '2',
        contractorId: '2',
        country: 'Беларусь',
        region: 'Минская область',
        city: 'Минск',
        district: 'Первомайский',
        settlement: 'Минск',
        streetType: 'ул.',
        streetName: 'В. Хоружей',
        house: '18',
        building: '2',
        apartment: '12',
        createdAt: '2025-01-20',
        updatedAt: '2025-01-20'
      },
      createdAt: '2025-01-20',
      updatedAt: '2025-01-20'
    },
    templateType: 'norm-hour',
    templateName: 'ДП-контролер-кассир',
    workServices: ['Контроль кассовых операций', 'Проверка чеков и документов'],
    status: 'active',
    structuralUnit: 'Минск Ванеева (11118)'
  },
  {
    id: '3',
    contractNumber: '03/25/2',
    contractDate: '2025-02-01',
    contractor: {
      id: '3',
      lastName: 'Сидоров',
      firstName: 'Алексей',
      middleName: 'Владимирович',
      documentType: 'паспорт',
      documentSeries: 'КМ',
      documentNumber: '5554444',
      citizenship: 'Республика Беларусь',
      issueDate: '2021-03-10',
      issuedBy: 'УВД Фрунзенского р-на г. Минска',
      identificationNumber: '34567890123456',
      mobilePhone: '+375335556677',
      bankDetails: {
        id: '3',
        contractorId: '3',
        IBAN: 'BY86BELB30123000000005554444',
        bankName: 'Беларусбанк',
        BIC: 'BELBBY2X',
        createdAt: '2025-02-01',
        updatedAt: '2025-02-01'
      },
      address: {
        id: '3',
        contractorId: '3',
        country: 'Беларусь',
        region: 'Минская область',
        city: 'Минск',
        district: 'Фрунзенский',
        settlement: 'Минск',
        streetType: 'ул.',
        streetName: 'Притыцкого',
        house: '62',
        building: '1',
        apartment: '78',
        createdAt: '2025-02-01',
        updatedAt: '2025-02-01'
      },
      createdAt: '2025-02-01',
      updatedAt: '2025-02-01'
    },
    templateType: 'cost',
    templateName: 'ДП-уборщик',
    workServices: ['Ежедневная уборка помещений', 'Санобработка поверхностей'],
    status: 'active',
    structuralUnit: 'Домовой ТЛК (2)'
  }
];

// Моковые данные для последовательностей актов
const mockActSequences: ActSequence[] = [
  { contractNumber: '01/25/1', lastActNumber: 3, lastUpdated: '2025-03-15' },
  { contractNumber: '02/25/11118', lastActNumber: 1, lastUpdated: '2025-03-10' },
  { contractNumber: '03/25/2', lastActNumber: 0, lastUpdated: '2025-03-01' }
];

const CreateAct: React.FC<CreateActProps> = ({
  onBack,
  expanded,
  onToggle
}) => {
  const { structuralUnits, selectedUnit } = useStructuralUnits();
  const { user } = useAuth();
  const [selectedStructuralUnit, setSelectedStructuralUnit] = useState<string>('');
  const [selectedContract, setSelectedContract] = useState<ContractForActWithTemplate | null>(null);
  const [contracts, setContracts] = useState<ContractForActWithTemplate[]>([]);
  const [actSequences, setActSequences] = useState<ActSequence[]>([]);
  const [actNumber, setActNumber] = useState<string>('');
  const [actData, setActData] = useState<ActData>({
    contractId: '',
    actNumber: '',
    actDate: new Date().toISOString().split('T')[0],
    periodStart: '',
    periodEnd: '',
    cfo: '',
    totalAmount: 0,
    workServices: [],
    status: 'draft'
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Загрузка договоров
  const fetchContracts = async (): Promise<void> => {
    try {
      setContracts(mockContracts);
    } catch (error: any) {
      console.error('Ошибка при загрузке договоров:', error);
      setContracts(mockContracts);
    }
  };

  // Загрузка последовательностей актов
  const fetchActSequences = async (): Promise<void> => {
    try {
      setActSequences(mockActSequences);
    } catch (error: any) {
      console.error('Ошибка при загрузке последовательностей актов:', error);
      setActSequences(mockActSequences);
    }
  };

  // Получение следующего номера акта для выбранного договора
  const getNextActNumber = (contractNumber: string): number => {
    const sequence = actSequences.find(seq => seq.contractNumber === contractNumber);
    return sequence ? sequence.lastActNumber + 1 : 1;
  };

  // Обновление последовательности актов после создания
  const updateActSequence = async (contractNumber: string): Promise<void> => {
    try {
      const nextNumber = getNextActNumber(contractNumber);
      console.log(`Обновляем последовательность для договора ${contractNumber}: новый номер ${nextNumber}`);

      const updatedSequences = actSequences.map(seq =>
        seq.contractNumber === contractNumber
          ? { ...seq, lastActNumber: nextNumber, lastUpdated: new Date().toISOString() }
          : seq
      );

      if (!updatedSequences.find(seq => seq.contractNumber === contractNumber)) {
        updatedSequences.push({
          contractNumber,
          lastActNumber: nextNumber,
          lastUpdated: new Date().toISOString()
        });
      }
      setActSequences(updatedSequences);
    } catch (error) {
      console.error('Ошибка при обновлении последовательности актов:', error);
    }
  };

  // Генерация полного номера акта на основе договора
  const generateActNumber = (contractNumber: string): string => {
    const nextSequence = getNextActNumber(contractNumber);
    const sequenceStr = nextSequence.toString().padStart(3, '0');
    return sequenceStr; // Возвращаем только порядковый номер
  };

  // Обработчик выбора договора
  const handleContractSelect = (contract: ContractForActWithTemplate | null) => {
    setSelectedContract(contract);

    if (contract) {
      const newActNumber = generateActNumber(contract.contractNumber);

      // Создаем workServices с флагом isFromContract
      const workServices: ActWorkService[] = contract.workServices.map((service, index) => ({
        name: service,
        quantity: 0,
        price: getDefaultPrice(contract.templateType, service),
        amount: 0,
        unit: getUnitByTemplateType(contract.templateType),
        isFromContract: true // Флаг, что услуга из договора
      }));

      setActNumber(newActNumber);
      setActData(prev => ({
        ...prev,
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        actNumber: newActNumber,
        workServices,
        totalAmount: 0
      }));
    } else {
      setActNumber('');
      setActData(prev => ({
        ...prev,
        contractId: '',
        contractNumber: '',
        actNumber: '',
        workServices: [],
        totalAmount: 0
      }));
    }
  };

  // Обработчики для работы с данными акта
  const handleActDataChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setActData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleWorkServiceChange = (index: number, field: string, value: any) => {
    const newWorkServices = [...actData.workServices];

    // Обновляем значение поля
    newWorkServices[index] = {
      ...newWorkServices[index],
      [field]: value
    };

    // Если изменилось количество или цена - пересчитываем сумму для этой строки
    if (field === 'quantity' || field === 'price') {
      const quantity = field === 'quantity' ? value : newWorkServices[index].quantity;
      const price = field === 'price' ? value : newWorkServices[index].price;
      const amount = (quantity || 0) * (price || 0);

      newWorkServices[index] = {
        ...newWorkServices[index],
        amount: amount
      };
    }

    // Пересчитываем общую сумму
    const totalAmount = newWorkServices.reduce((sum, service) => sum + (service.amount || 0), 0);

    setActData(prev => ({
      ...prev,
      workServices: newWorkServices,
      totalAmount
    }));
  };

  const handleAddWorkService = () => {
    if (!selectedContract) return;

    const newWorkService: ActWorkService = {
      name: '',
      quantity: 0,
      price: getDefaultPrice(selectedContract.templateType, ''),
      amount: 0,
      unit: getUnitByTemplateType(selectedContract.templateType),
      isFromContract: false // Флаг, что услуга добавлена вручную
    };

    setActData(prev => ({
      ...prev,
      workServices: [...prev.workServices, newWorkService]
    }));
  };


  const handleRemoveWorkService = (index: number) => {
    if (actData.workServices.length <= 1) {
      setError('Должна быть хотя бы одна работа/услуга');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const newWorkServices = actData.workServices.filter((_, i) => i !== index);
    const totalAmount = newWorkServices.reduce((sum, service) => sum + (service.amount || 0), 0);

    setActData(prev => ({
      ...prev,
      workServices: newWorkServices,
      totalAmount
    }));
  };

  // Получение информации о последнем акте для выбранного договора
  const getLastActInfo = (): string => {
    if (!selectedContract) return '';

    const sequence = actSequences.find(seq => seq.contractNumber === selectedContract.contractNumber);
    if (!sequence || sequence.lastActNumber === 0) {
      return 'Это будет первый акт по данному договору';
    }

    const lastActNumber = sequence.lastActNumber.toString().padStart(3, '0');
    return `Последний созданный акт: №${lastActNumber}`;
  };

  // Получение отфильтрованных договоров по выбранной структурной единице
  const getFilteredContracts = (): ContractForActWithTemplate[] => {
    if (!selectedStructuralUnit) return [];

    const unit = structuralUnits.find(unit =>
      unit.id === selectedStructuralUnit ||
      unit.id?.toString() === selectedStructuralUnit
    );

    if (!unit) return [];

    const unitName = `${unit.name}${unit.code ? ` (${unit.code})` : ''}`;

    return contracts.filter(contract =>
      contract.structuralUnit === unitName
    );
  };

  // Функция для рендеринга опции договора
  const renderContractOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    contract: ContractForActWithTemplate
  ) => (
    <li {...props} key={contract.id}>
      <Box>
        <Typography variant="body1" fontWeight="bold">
          {contract.contractNumber} - {contract.contractor.lastName} {contract.contractor.firstName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {getContractTypeName(contract.templateType)} | {contract.structuralUnit}
        </Typography>
      </Box>
    </li>
  );

  // Функция для прокрутки страницы вверх
  const handleBackToStart = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Функция для рендеринга формы акта
  const renderActForm = () => {
    if (!selectedContract) return null;

    const commonProps = {
      selectedContract,
      actData,
      onWorkServiceChange: handleWorkServiceChange,
      onAddWorkService: handleAddWorkService,
      onRemoveWorkService: handleRemoveWorkService,
      selectedStructuralUnit,
      numberToWordsWithCents
    };

    switch (selectedContract.templateType) {
      case 'operation':
        return <OperationActForm {...commonProps} />;
      case 'norm-hour':
        return <NormHourActForm {...commonProps} />;
      case 'cost':
        return <CostActForm {...commonProps} />;
      default:
        return null;
    }
  };

  // Загружаем договоры и последовательности при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      await fetchContracts();
      await fetchActSequences();
    };
    fetchData();
  }, []);

  // Автоматически выбираем структурную единицу из контекста при монтировании
  useEffect(() => {
    if (selectedUnit && !selectedStructuralUnit) {
      setSelectedStructuralUnit(selectedUnit.id?.toString() || '');
    }
  }, [selectedUnit]);

  const handleStructuralUnitChange = (event: any) => {
    const unitId = event.target.value;
    setSelectedStructuralUnit(unitId);
    setSelectedContract(null);
  };

  const isFormDisabled = !selectedStructuralUnit;
  const filteredContracts = getFilteredContracts();

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ cursor: 'pointer' }} onClick={onToggle}>
        <Typography variant="h6">Создать акт:</Typography>
        <IconButton>{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
      </Box>

      <Collapse in={expanded}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Выбор структурной единицы */}
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Выбрать структурную единицу</InputLabel>
          <Select
            value={selectedStructuralUnit}
            onChange={handleStructuralUnitChange}
            label="Выбрать структурную единицу *"
          >
            {structuralUnits.map((unit) => (
              <MenuItem key={unit.id} value={unit.id}>
                {unit.name} {unit.code ? `(${unit.code})` : `(ID: ${unit.id})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Выбор договора */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            <strong>Выбор договора:</strong>
          </Typography>
          <Autocomplete
            options={filteredContracts}
            getOptionLabel={(contract) =>
              `${contract.contractNumber} - ${contract.contractor.lastName} ${contract.contractor.firstName}`
            }
            value={selectedContract}
            onChange={(event, newValue) => handleContractSelect(newValue)}
            disabled={!selectedStructuralUnit}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Выберите договор"
                margin="normal"
                fullWidth
                disabled={!selectedStructuralUnit}
                placeholder={selectedStructuralUnit ? "Выберите договор" : "Сначала выберите структурную единицу"}
                helperText="Номер акта будет сгенерирован автоматически на основе выбранного договора"
              />
            )}
            renderOption={renderContractOption}
            noOptionsText={
              selectedStructuralUnit
                ? "Нет доступных договоров для выбранной структурной единицы"
                : "Сначала выберите структурную единицу"
            }
          />
        </Box>

        {/* Основные данные акта */}
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="№ Акта"
                fullWidth
                margin="normal"
                value={actNumber}
                InputProps={{ readOnly: true }}
                disabled={isFormDisabled}
                helperText={selectedContract ? getLastActInfo() : "Выберите договор для генерации номера"}
              />
            </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Дата акта"
              fullWidth
              margin="normal"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={actData.actDate}
              onChange={handleActDataChange('actDate')}
              disabled={isFormDisabled}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="№ Договора"
              fullWidth
              margin="normal"
              value={selectedContract?.contractNumber || ''}
              InputProps={{ readOnly: true }}
              disabled={true}
            />
          </Grid>

          {/* Период и ЦФО */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Период с"
              fullWidth
              margin="normal"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={actData.periodStart}
              onChange={handleActDataChange('periodStart')}
              disabled={isFormDisabled}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Период по"
              fullWidth
              margin="normal"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={actData.periodEnd}
              onChange={handleActDataChange('periodEnd')}
              disabled={isFormDisabled}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="ЦФО"
              fullWidth
              margin="normal"
              value={actData.cfo}
              onChange={handleActDataChange('cfo')}
              disabled={isFormDisabled}
              placeholder="Введите код ЦФО"
              required
            />
          </Grid>
        </Grid>

        {/* Блок Подрядчик */}
        {selectedContract && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Подрядчик:</strong>
            </Typography>

            <Grid container spacing={2}>
              {/* Паспортные данные */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Паспортные данные:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="ФИО"
                        fullWidth
                        size="small"
                        margin="dense"
                        value={`${selectedContract.contractor.lastName} ${selectedContract.contractor.firstName} ${selectedContract.contractor.middleName || ''}`}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Документ"
                        fullWidth
                        size="small"
                        margin="dense"
                        value={`${selectedContract.contractor.documentType} ${selectedContract.contractor.documentSeries || ''} №${selectedContract.contractor.documentNumber}`}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Идентификационный номер"
                        fullWidth
                        size="small"
                        margin="dense"
                        value={selectedContract.contractor.identificationNumber}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Кем выдан"
                        fullWidth
                        size="small"
                        margin="dense"
                        value={selectedContract.contractor.issuedBy || ''}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Дата выдачи"
                        fullWidth
                        size="small"
                        margin="dense"
                        value={selectedContract.contractor.issueDate || ''}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Адрес регистрации */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Адрес регистрации:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Страна"
                        fullWidth
                        size="small"
                        margin="dense"
                        value={selectedContract.contractor.address?.country || ''}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Область/Регион"
                        fullWidth
                        size="small"
                        margin="dense"
                        value={selectedContract.contractor.address?.region || ''}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Город"
                        fullWidth
                        size="small"
                        margin="dense"
                        value={selectedContract.contractor.address?.city || ''}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Улица, дом, квартира"
                        fullWidth
                        size="small"
                        margin="dense"
                        value={`${selectedContract.contractor.address?.streetType || ''} ${selectedContract.contractor.address?.streetName || ''} ${selectedContract.contractor.address?.house || ''} ${selectedContract.contractor.address?.apartment ? `кв. ${selectedContract.contractor.address.apartment}` : ''}`}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            {/* Банковские реквизиты */}
            {selectedContract.contractor.bankDetails && (
              <Box sx={{ mt: 2 }}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Банковские реквизиты:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="IBAN"
                        fullWidth
                        size="small"
                        margin="dense"
                        value={selectedContract.contractor.bankDetails.IBAN}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Банк"
                        fullWidth
                        size="small"
                        margin="dense"
                        value={selectedContract.contractor.bankDetails.bankName}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="BIC"
                        fullWidth
                        size="small"
                        margin="dense"
                        value={selectedContract.contractor.bankDetails.BIC}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            )}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Работы/услуги */}
        {selectedContract && (
          <Box sx={{ mt: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" gutterBottom>
                <strong>Работы/услуги:</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                по договору "{getContractTypeName(selectedContract.templateType)}", шаблон "{selectedContract.templateName || 'Не указан'}"
              </Typography>
            </Box>

            {/* Рендерим соответствующую форму */}
            {renderActForm()}
          </Box>
        )}

        {/* Кнопки управления - стиль как в ContractGeneralData */}
        <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleBackToStart}
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

export default CreateAct;