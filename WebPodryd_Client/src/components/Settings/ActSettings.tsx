// src/components/Settings/ActSettings.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Button, Grid, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TablePagination, Tooltip, Alert, Tabs, Tab, Chip,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Checkbox,
  ListItemText
} from '@mui/material';
import { Add, Edit, Delete, Search, Close, AttachMoney, Warning, Error as ErrorIcon, ArrowBack, Refresh } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useStructuralUnits } from '../../context/StructuralUnitsContext';
import { ActTemplate, WorkService, TabPanelProps } from '../../../types/contract';
import { useContractTypes } from '../../hooks/useContractTypes';
import ContractTemplateService from '../../services/ContractTemplateService';
import ActTemplateService, { CreateActTemplateRequest, UpdateActTemplateRequest } from '../../services/ActTemplateService';

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`act-settings-tabpanel-${index}`}
      aria-labelledby={`act-settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ActSettings = () => {
  const { user } = useAuth();
  const { structuralUnits } = useStructuralUnits();
  const { contractTypes, loading: typesLoading } = useContractTypes();

  const [contractTemplates, setContractTemplates] = useState<any[]>([]);
  const [actTemplates, setActTemplates] = useState<ActTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingRedirect, setProcessingRedirect] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedActTemplate, setSelectedActTemplate] = useState<ActTemplate | null>(null);
  const [viewActTemplate, setViewActTemplate] = useState<ActTemplate | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [filterContractTemplateId, setFilterContractTemplateId] = useState<number | null>(null);
  const [highlightedTemplates, setHighlightedTemplates] = useState<number[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [templatesCache, setTemplatesCache] = useState<{[key: number]: any}>({});
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [deletingTemplates, setDeletingTemplates] = useState<number[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filter, setFilter] = useState({
    search: '',
    departmentId: ''
  });

  // Получаем типы договоров для табов
  const templateTypes = contractTypes.map(type => ({
    value: type.id,
    label: type.name,
    code: type.code
  }));

  // Функция для кэширования шаблонов договоров
  const getCachedContractTemplate = async (id: number) => {
    if (templatesCache[id]) {
      return templatesCache[id];
    }

    try {
      const template = await ContractTemplateService.getContractTemplate(id);
      setTemplatesCache(prev => ({ ...prev, [id]: template }));
      return template;
    } catch (error) {
      console.error('Ошибка загрузки шаблона договора:', error);
      return null;
    }
  };

  const getTypeLabel = (contractTypeId: number) => {
    const type = contractTypes.find(t => t.id === contractTypeId);
    return type?.name || `Тип ${contractTypeId}`;
  };

  const getTypeColor = (contractTypeId: number) => {
    const type = contractTypes.find(t => t.id === contractTypeId);
    switch (type?.code) {
      case 'operation': return 'primary';
      case 'norm-hour': return 'secondary';
      case 'cost': return 'success';
      default: return 'default';
    }
  };

  // Функция для нормализации названия (удаление авто, копия и т.д.)
  const normalizeTemplateName = (name: string): string => {
    return name
      .replace(/\s*\([^)]*копия[^)]*\)/gi, '')
      .replace(/\s*\([^)]*авто[^)]*\)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Функция для сравнения массивов работ/услуг
  const areWorkServicesEqual = (services1: WorkService[], services2: WorkService[]): boolean => {
    if (services1.length !== services2.length) return false;

    return services1.every((service1, index) => {
      const service2 = services2[index];
      return (
        service1.name === service2.name &&
        service1.cost === service2.cost
      );
    });
  };

  // Функция для проверки существования дубликата шаблона
  const checkForDuplicateTemplate = (
    templateToCheck: ActTemplate,
    existingTemplates: ActTemplate[]
  ): ActTemplate | null => {
    const normalizedName = normalizeTemplateName(templateToCheck.name);

    return existingTemplates.find(existingTemplate => {
      // Пропускаем проверку самого себя при редактировании
      if (templateToCheck.id !== 0 && existingTemplate.id === templateToCheck.id) {
        return false;
      }

      const existingNormalizedName = normalizeTemplateName(existingTemplate.name);

      // Проверяем все ключевые параметры
      return (
        existingTemplate.contractTypeId === templateToCheck.contractTypeId &&
        existingTemplate.contractTemplateId === templateToCheck.contractTemplateId &&
        existingTemplate.departmentId === templateToCheck.departmentId &&
        areWorkServicesEqual(existingTemplate.workServices, templateToCheck.workServices) &&
        existingNormalizedName === normalizedName
      );
    }) || null;
  };

  // Получение доступных структурных единиц для выбора (исключая те, где уже есть дубликаты)
  const getAvailableStructuralUnits = (currentTemplate: ActTemplate) => {
    if (!currentTemplate) return structuralUnits;

    return structuralUnits.map(unit => {
      const templateWithUnit = {
        ...currentTemplate,
        departmentId: unit.id
      };

      const duplicate = checkForDuplicateTemplate(templateWithUnit, actTemplates);
      const hasExistingTemplate = !!duplicate;

      return {
        ...unit,
        disabled: hasExistingTemplate,
        duplicateTemplate: duplicate
      };
    });
  };

  // Получение доступных структурных единиц для множественного выбора при копировании
  const getAvailableStructuralUnitsForMultiple = (currentTemplate: ActTemplate) => {
    if (!currentTemplate) return structuralUnits;

    return structuralUnits.map(unit => {
      const templateWithUnit = {
        ...currentTemplate,
        departmentId: unit.id
      };

      const duplicate = checkForDuplicateTemplate(templateWithUnit, actTemplates);
      const hasExistingTemplate = !!duplicate;

      return {
        ...unit,
        disabled: hasExistingTemplate,
        duplicateTemplate: duplicate
      };
    });
  };

  // Валидация данных шаблона акта
  const validateActTemplate = (template: any): string | null => {
    if (!template.name || template.name.trim() === '') {
      return 'Введите название шаблона акта';
    }

    if (!template.contractTemplateId || template.contractTemplateId === 0) {
      return 'Выберите шаблон договора';
    }

    if (!template.workServices || template.workServices.length === 0) {
      return 'Добавьте хотя бы одну работу/услугу';
    }

    // Проверяем, что у всех услуг есть названия
    const hasEmptyNames = template.workServices.some((service: any) =>
      !service.name || service.name.trim() === ''
    );

    if (hasEmptyNames) {
      return 'У всех услуг должно быть указано название';
    }

    // Проверяем стоимость для ненулевых услуг
    const hasInvalidCost = template.workServices.some((service: any) =>
      service.cost < 0
    );

    if (hasInvalidCost) {
      return 'Стоимость не может быть отрицательной';
    }

    return null;
  };

  // Получение шаблонов договоров из API
  const fetchContractTemplates = async () => {
    try {
      const templates = await ContractTemplateService.getContractTemplates();
      setContractTemplates(templates);
      return templates;
    } catch (err: any) {
      console.error('Ошибка загрузки шаблонов договоров:', err);
      setError('Не удалось загрузить шаблоны договоров');
      return [];
    }
  };

  // Получение шаблонов актов из API
  const fetchActTemplates = async () => {
    try {
      const templates = await ActTemplateService.getActTemplates();
      setActTemplates(templates);
      return templates;
    } catch (err: any) {
      console.error('Ошибка загрузки шаблонов актов:', err);
      setError('Не удалось загрузить шаблоны актов');
      return [];
    }
  };

  // Функция для принудительного обновления данных
  const refreshData = async () => {
    try {
      setLoading(true);
      setTemplatesCache({});
      await Promise.all([
        fetchContractTemplates(),
        fetchActTemplates()
      ]);
      setLastUpdate(Date.now());
    } catch (err: any) {
      console.error('Ошибка обновления данных:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchContractTemplates(),
        fetchActTemplates()
      ]);
      setDataLoaded(true);
    } catch (err: any) {
      console.error('Ошибка загрузки данных:', err);
      setError('Не удалось загрузить данные');
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  // Эффект для загрузки данных при изменении contractTypes
  useEffect(() => {
    if (contractTypes.length > 0) {
      fetchData();
    }
  }, [contractTypes]);

  // Эффект для периодического обновления данных
  useEffect(() => {
    const interval = setInterval(() => {
      if (dataLoaded && !loading) {
        refreshData();
      }
    }, 10800000);
    return () => clearInterval(interval);
  }, [dataLoaded, loading]);

  // Эффект для обработки перехода из ContractSettings
  useEffect(() => {
    if (!dataLoaded) return;

    const selectedContractTemplateId = sessionStorage.getItem('selectedContractTemplateId');
    const redirectFromContractSettings = sessionStorage.getItem('redirectFromContractSettings');

    if (redirectFromContractSettings && selectedContractTemplateId) {
      handleRedirectFromContractSettings(parseInt(selectedContractTemplateId));
    }
  }, [dataLoaded, contractTemplates, templateTypes, actTemplates, lastUpdate]);

  // Функция для обработки перехода с индикатором загрузки
  const handleRedirectFromContractSettings = async (templateId: number) => {
    setProcessingRedirect(true);
    setError(null);

    try {
      setFilterContractTemplateId(templateId);
      const relatedTemplate = contractTemplates.find(t => t.id === templateId);

      if (relatedTemplate) {
        const tabIndex = templateTypes.findIndex(t => t.value === relatedTemplate.contractTypeId);
        if (tabIndex !== -1) {
          setActiveTab(tabIndex);
        }

        const dependentActTemplates = actTemplates.filter(
          actTemplate => actTemplate.contractTemplateId === templateId
        );

        const dependentIds = dependentActTemplates.map(t => t.id);
        setHighlightedTemplates(dependentIds);

        if (dependentActTemplates.length > 0) {
          setError(`Необходимо удалить шаблоны актов, связанные с шаблоном договора: "${relatedTemplate.name}"`);
        } else {
          setSuccess('Нет зависимых шаблонов актов. Теперь можно удалить шаблон договора.');
        }
      } else {
        setError(`Шаблон договора ID: ${templateId} не найден`);
      }
    } catch (err: any) {
      console.error('Ошибка при обработке перехода:', err);
      setError('Ошибка при обработке данных перехода');
    } finally {
      setProcessingRedirect(false);
      sessionStorage.removeItem('selectedContractTemplateId');
      sessionStorage.removeItem('redirectFromContractSettings');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setFilterContractTemplateId(null);
    setHighlightedTemplates([]);
    setError(null);
  };

  const handleOpenEditModal = async (actTemplate: ActTemplate) => {
    try {
      const fullTemplate = await ActTemplateService.getActTemplate(actTemplate.id);
      setSelectedActTemplate(fullTemplate);
      setSelectedDepartments([]); // Сбрасываем множественный выбор
      setOpenEditModal(true);
    } catch (error) {
      console.error('Error loading act template:', error);
      setSelectedActTemplate(actTemplate);
      setSelectedDepartments([]); // Сбрасываем множественный выбор
      setOpenEditModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedActTemplate(null);
    setSelectedDepartments([]);
  };

  // Функция для открытия модального окна создания копии шаблона акта
  const handleOpenCopyModal = async (actTemplate: ActTemplate) => {
  try {
    const fullTemplate = await ActTemplateService.getActTemplate(actTemplate.id);

    // Создаем копию шаблона с новым ID и очищенным названием
    const templateCopy = {
      ...fullTemplate,
      id: 0, // Новый ID для копии
      name: normalizeTemplateName(fullTemplate.name), // Очищаем название, НЕ ПОДСТАВЛЯЕМ название шаблона договора
      departmentId: 0 // Сбрасываем структурную единицу
    };

    setSelectedActTemplate(templateCopy);
    setSelectedDepartments([]); // Сбрасываем множественный выбор
    setOpenEditModal(true);
  } catch (error) {
    console.error('Error loading act template for copy:', error);
    const templateCopy = {
      ...actTemplate,
      id: 0,
      name: normalizeTemplateName(actTemplate.name), // Очищаем название, НЕ ПОДСТАВЛЯЕМ название шаблона договора
      departmentId: 0
    };
    setSelectedActTemplate(templateCopy);
    setSelectedDepartments([]); // Сбрасываем множественный выбор
    setOpenEditModal(true);
  }
};

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setViewActTemplate(null);
  };

  const handleEditActTemplate = async () => {
    if (!selectedActTemplate) return;

    try {
      setError(null);

      const validationError = validateActTemplate(selectedActTemplate);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Если это создание копии и выбраны несколько СЕ
      if (selectedActTemplate.id === 0 && selectedDepartments.length > 0) {
        // Создаем шаблоны для каждой выбранной СЕ
        const createdTemplates = [];

        for (const departmentId of selectedDepartments) {
          const templateForDepartment = {
            ...selectedActTemplate,
            departmentId: departmentId
          };

          // Проверяем на дубликат для каждой СЕ
          const duplicate = checkForDuplicateTemplate(templateForDepartment, actTemplates);
          if (duplicate) {
            setError(`Шаблон акта с такими же параметрами уже существует для структурной единицы: ${structuralUnits.find(u => u.id === departmentId)?.name}`);
            return;
          }

          const updateData: CreateActTemplateRequest = {
            name: templateForDepartment.name,
            contractTypeId: templateForDepartment.contractTypeId,
            contractTemplateId: templateForDepartment.contractTemplateId,
            workServices: templateForDepartment.workServices,
            departmentId: departmentId,
            totalCost: templateForDepartment.totalCost
          };

          const createdTemplate = await ActTemplateService.createActTemplate(updateData);
          createdTemplates.push(createdTemplate);
        }

        setSuccess(`Успешно создано ${createdTemplates.length} копий шаблона акта для выбранных структурных единиц`);
      } else {
        // Обычное редактирование или создание одной копии
        const duplicate = checkForDuplicateTemplate(selectedActTemplate, actTemplates);
        if (duplicate) {
          setError(`Шаблон акта с такими же параметрами уже существует для структурной единицы: ${structuralUnits.find(u => u.id === duplicate.departmentId)?.name}`);
          return;
        }

        const updateData: UpdateActTemplateRequest = {
          name: selectedActTemplate.name,
          contractTypeId: selectedActTemplate.contractTypeId,
          contractTemplateId: selectedActTemplate.contractTemplateId,
          workServices: selectedActTemplate.workServices,
          departmentId: selectedActTemplate.departmentId,
          totalCost: selectedActTemplate.totalCost
        };

        if (selectedActTemplate.id === 0) {
          await ActTemplateService.createActTemplate(updateData);
          setSuccess('Копия шаблона акта успешно создана');
        } else {
          await ActTemplateService.updateActTemplate(selectedActTemplate.id, updateData);
          setSuccess('Шаблон акта успешно обновлен');
        }
      }

      const updatedTemplates = await fetchActTemplates();
      setActTemplates(updatedTemplates);
      handleCloseEditModal();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Ошибка обновления:', err);
      setError(err.message || 'Ошибка при обновлении шаблона акта');
    }
  };

  // Основная функция удаления шаблона акта
  const handleDeleteActTemplate = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот шаблон акта?')) {
      return;
    }

    try {
      setError(null);
      setDeletingTemplates(prev => [...prev, id]);
      await ActTemplateService.deleteActTemplate(id);

      const updatedTemplates = await fetchActTemplates();
      setActTemplates(updatedTemplates);
      setHighlightedTemplates(prev => prev.filter(templateId => templateId !== id));

      if (filterContractTemplateId) {
        const remainingTemplates = actTemplates.filter(
          template => template.contractTemplateId === filterContractTemplateId && template.id !== id
        );

        if (remainingTemplates.length === 0) {
          setFilterContractTemplateId(null);
          setHighlightedTemplates([]);
          setSuccess('Все зависимые шаблоны актов удалены. Теперь можно удалить шаблон договора.');
          setTimeout(() => setSuccess(null), 7000);
        } else {
          setSuccess('Шаблон акта успешно удален');
          setTimeout(() => setSuccess(null), 3000);
        }
      } else {
        setSuccess('Шаблон акта успешно удален');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error('Ошибка удаления шаблона акта:', err);
      let errorMessage = 'Ошибка при удалении шаблона акта';

      if (err.response) {
        const serverError = err.response.data;
        if (serverError.message) {
          errorMessage = serverError.message;
        } else if (serverError.details) {
          errorMessage = `${serverError.message || 'Ошибка'}: ${serverError.details}`;
        }
      } else if (err.request) {
        errorMessage = 'Ошибка сети при удалении шаблона акта';
      } else {
        errorMessage = err.message || 'Неизвестная ошибка при удалении шаблона акта';
      }

      setError(errorMessage);
    } finally {
      setDeletingTemplates(prev => prev.filter(templateId => templateId !== id));
    }
  };

  // Обработчик изменения работ/услуг
  const handleWorkServiceChange = (index: number, field: 'name' | 'cost', value: string | number) => {
    if (selectedActTemplate) {
      const newWorkServices = [...selectedActTemplate.workServices];
      newWorkServices[index] = { ...newWorkServices[index], [field]: value };

      // Пересчитываем общую стоимость для типа "cost"
      let totalCost = selectedActTemplate.totalCost;
      if (getContractTypeCode(selectedActTemplate.contractTypeId) === 'cost') {
        totalCost = newWorkServices.reduce((sum, service) => sum + service.cost, 0);
      }

      setSelectedActTemplate(prev => prev ? {
        ...prev,
        workServices: newWorkServices,
        totalCost
      } : null);
    }
  };

  // Добавление новой работы/услуги
  const handleAddWorkService = () => {
    if (selectedActTemplate) {
      const newWorkServices = [
        ...selectedActTemplate.workServices,
        { name: '', cost: 0 }
      ];

      setSelectedActTemplate(prev => prev ? {
        ...prev,
        workServices: newWorkServices
      } : null);
    }
  };

  // Удаление работы/услуги
  const handleRemoveWorkService = (index: number) => {
    if (selectedActTemplate) {
      const newWorkServices = selectedActTemplate.workServices.filter((_, i) => i !== index);

      // Пересчитываем общую стоимость для типа "cost"
      let totalCost = selectedActTemplate.totalCost;
      if (getContractTypeCode(selectedActTemplate.contractTypeId) === 'cost') {
        totalCost = newWorkServices.reduce((sum, service) => sum + service.cost, 0);
      }

      setSelectedActTemplate(prev => prev ? {
        ...prev,
        workServices: newWorkServices,
        totalCost
      } : null);
    }
  };

  const handleContractTemplateChange = async (contractTemplateId: number) => {
    try {
      const selectedTemplate = contractTemplates.find(t => t.id === contractTemplateId);

      if (!selectedTemplate) {
        console.error('Шаблон договора не найден');
        return;
      }

      const fullContractTemplate = await getCachedContractTemplate(contractTemplateId);
      const services = fullContractTemplate?.workServices || selectedTemplate.workServices || [];

      const workServices = services.length > 0
        ? services.map((service: string) => ({
            name: service,
            cost: 0
          }))
        : [];

      const totalCost = workServices.reduce((sum, service) => sum + service.cost, 0);

      setSelectedActTemplate(prev => prev ? {
        ...prev,
        contractTemplateId,
        name: prev.name || '',
        workServices,
        totalCost
      } : null);
    } catch (error) {
      console.error('Ошибка загрузки шаблона договора:', error);
      setError('Не удалось загрузить данные шаблона договора');
    }
  };

  // Обработчик изменения множественного выбора СЕ
  const handleMultipleDepartmentChange = (event: any) => {
    const value = event.target.value;
    setSelectedDepartments(typeof value === 'string' ? value.split(',').map(Number) : value);
  };

  // Функция для отображения таблицы с данными из шаблонов актов
  const renderTemplatesTable = () => {
    const currentType = templateTypes[activeTab];
    if (!currentType) return null;

    // Фильтруем шаблоны актов
    const filteredActTemplates = actTemplates.filter(template => {
      const matchesType = template.contractTypeId === currentType.value;
      const matchesContractTemplate = filterContractTemplateId ?
        template.contractTemplateId === filterContractTemplateId : true;
      const matchesSearch = filter.search ?
        template.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        (template.workServices && template.workServices.some((service: any) =>
          service.name && service.name.toLowerCase().includes(filter.search.toLowerCase())
        )) : true;
      const matchesDepartment = filter.departmentId ?
        template.departmentId.toString() === filter.departmentId : true;

      return matchesType && matchesContractTemplate && matchesSearch && matchesDepartment;
    });

    const tableData = filteredActTemplates.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

    return (
      <>
        {/* Кнопка массового удаления подсвеченных шаблонов */}
        {highlightedTemplates.length > 0 && (
          <Box sx={{ mb: 2, p: 2, backgroundColor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="h6" color="warning.dark" gutterBottom>
              Зависимые шаблоны актов
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Обнаружено {highlightedTemplates.length} шаблонов актов, связанных с удаляемым шаблоном договора.
              Удалите их, чтобы продолжить удаление шаблона договора.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={handleDeleteAllHighlightedTemplates}
                disabled={loading}
              >
                Удалить все ({highlightedTemplates.length})
              </Button>
              <Button
                variant="outlined"
                onClick={handleCleanupAndReturn}
              >
                Вернуться к договорам
              </Button>
            </Box>
          </Box>
        )}

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Тип договора</TableCell>
              <TableCell>Название договора</TableCell>
              <TableCell>Работы/услуги</TableCell>
              <TableCell>Стоимость</TableCell>
              <TableCell>Структурная единица</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.length > 0 ? (
              tableData.map((template) => {
                const contractTypeCode = getContractTypeCode(template.contractTypeId);
                const workServices = template.workServices || [];
                const isHighlighted = highlightedTemplates.includes(template.id);
                const isDeleting = deletingTemplates.includes(template.id);

                const department = structuralUnits.find(unit => unit.id === template.departmentId);
                const contractTemplate = contractTemplates.find(ct => ct.id === template.contractTemplateId);

                const hasZeroCostWarning = contractTypeCode === 'cost'
                  ? template.totalCost === 0
                  : workServices.some(service => service.cost === 0);

                const clickableStyle = {
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                };

                return (
                  <TableRow
                    key={template.id}
                    hover
                    sx={{
                      backgroundColor: isHighlighted ? 'rgba(255, 0, 0, 0.1)' : 'inherit',
                      border: isHighlighted ? '2px solid #ff4444' : '1px solid rgba(224, 224, 224, 1)',
                      ...clickableStyle
                    }}
                    onClick={() => handleOpenCopyModal(template)}
                  >
                    <TableCell>
                      <Box sx={clickableStyle}>
                        <Chip
                          label={getTypeLabel(template.contractTypeId)}
                          color={getTypeColor(template.contractTypeId) as any}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={clickableStyle}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {template.name}
                        </Typography>
                        {contractTemplate && (
                          <Typography variant="caption" color="text.secondary">
                          </Typography>
                        )}
                        {isHighlighted && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Warning color="warning" sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="caption" color="warning.main">
                              Зависит от удаляемого шаблона договора
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption" color="primary">
                            Нажмите для создания копии
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ ...clickableStyle, maxWidth: 200 }}>
                        {workServices.slice(0, 3).map((service, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" title={service.name}>
                              {service.name || `Услуга ${index + 1}`}
                            </Typography>
                            {(!service.name || service.name.trim() === '') && (
                              <Tooltip title="Название услуги не указано">
                                <ErrorIcon color="error" sx={{ fontSize: 16, ml: 0.5 }} />
                              </Tooltip>
                            )}
                          </Box>
                        ))}
                        {workServices.length > 3 && (
                          <Typography variant="body2" color="text.secondary">
                            и еще {workServices.length - 3}...
                          </Typography>
                        )}
                        {workServices.length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            Нет услуг
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={clickableStyle}>
                        {contractTypeCode === 'cost' ? (
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color={hasZeroCostWarning ? 'error' : 'inherit'}
                            >
                              {template.totalCost.toFixed(2)} Br
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              общая стоимость
                            </Typography>
                            {hasZeroCostWarning && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <ErrorIcon color="error" sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="caption" color="error">
                                  Стоимость не установлена
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <Box sx={{ maxWidth: 150 }}>
                            {workServices.slice(0, 2).map((service, index) => (
                              <Box key={index} sx={{ mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color={service.cost === 0 ? 'error' : 'inherit'}
                                  >
                                    {service.cost.toFixed(2)} Br
                                  </Typography>
                                  {service.cost === 0 && (
                                    <Tooltip title="Стоимость не установлена">
                                      <ErrorIcon color="error" sx={{ fontSize: 16, ml: 0.5 }} />
                                    </Tooltip>
                                  )}
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {contractTypeCode === 'operation' ? 'за операцию' : 'за час'}
                                </Typography>
                              </Box>
                            ))}
                            {workServices.length > 2 && (
                              <Typography variant="caption" color="text.secondary">
                                и еще {workServices.length - 2}...
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={clickableStyle}>
                        <Typography variant="body2">
                          {department ? `${department.name}${department.code ? ` (${department.code})` : ''}` : 'Не назначена'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Редактировать">
                        <IconButton onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(template);
                        }}>
                          <Edit color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteActTemplate(template.id);
                          }}
                          disabled={isDeleting}
                          sx={{
                            color: isHighlighted ? '#ff4444' : 'error.main',
                          }}
                        >
                          {isDeleting ? <CircularProgress size={24} /> : <Delete />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {actTemplates.length === 0 ? 'Нет данных о шаблонах актов' : 'Ничего не найдено'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </>
    );
  };

  // Добавляем недостающие функции
  const handleDeleteAllHighlightedTemplates = async () => {
    if (highlightedTemplates.length === 0) return;
    if (!confirm(`Вы уверены, что хотите удалить все ${highlightedTemplates.length} подсвеченных шаблонов актов?`)) {
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const deletedTemplates = [];
      const failedTemplates = [];

      for (const templateId of highlightedTemplates) {
        try {
          await ActTemplateService.deleteActTemplate(templateId);
          deletedTemplates.push(templateId);
        } catch (err) {
          console.error(`Ошибка удаления шаблона ${templateId}:`, err);
          failedTemplates.push(templateId);
        }
      }

      if (deletedTemplates.length > 0) {
        const updatedTemplates = await fetchActTemplates();
        setActTemplates(updatedTemplates);
      }

      setHighlightedTemplates(failedTemplates);

      if (failedTemplates.length === 0) {
        if (filterContractTemplateId) {
          sessionStorage.setItem('returnedFromActSettings', 'true');
          sessionStorage.setItem('templateToHighlight', filterContractTemplateId.toString());
        }
        setSuccess(
          <Box>
            <Typography variant="body1" gutterBottom>
              Все {highlightedTemplates.length} подсвеченных шаблонов актов успешно удалены.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleReturnToContractSettings}
              sx={{ mt: 1 }}
            >
              Вернуться к шаблонам договоров
            </Button>
          </Box>
        );
        setFilterContractTemplateId(null);
        setTimeout(() => setSuccess(null), 10000);
      } else if (deletedTemplates.length > 0) {
        setSuccess(`Удалено ${deletedTemplates.length} из ${highlightedTemplates.length} шаблонов. Не удалось удалить ${failedTemplates.length} шаблонов.`);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(`Не удалось удалить ни один шаблон акта. Проверьте консоль для деталей.`);
      }
    } catch (err: any) {
      console.error('Ошибка массового удаления:', err);
      setError('Ошибка при удалении подсвеченных шаблонов актов');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToContractSettings = () => {
    if (filterContractTemplateId) {
      sessionStorage.setItem('returnedFromActSettings', 'true');
      sessionStorage.setItem('templateToHighlight', filterContractTemplateId.toString());
    }
    window.location.href = '/contract-settings';
  };

  const handleCleanupAndReturn = () => {
    setFilterContractTemplateId(null);
    setHighlightedTemplates([]);
    setError(null);
    window.location.href = '/contract-settings';
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilter(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  // Получение типа по ID для определения типа стоимости
  const getContractTypeCode = (contractTypeId: number): string => {
    const type = contractTypes.find(t => t.id === contractTypeId);
    return type?.code || '';
  };

  // Получение шаблонов договоров для выбранного типа
  const getContractTemplatesForType = (contractTypeId: number) => {
    return contractTemplates.filter(t => t.contractTypeId === contractTypeId);
  };

  // Проверка, нужно ли показывать кнопку добавления услуги
  const shouldShowAddServiceButton = () => {
    if (!selectedActTemplate) return false;
    const contractTypeCode = getContractTypeCode(selectedActTemplate.contractTypeId);
    // Показываем кнопку только для типа "cost"
    return contractTypeCode === 'cost';
  };

  const filteredActTemplates = actTemplates.filter(template => {
    const currentType = templateTypes[activeTab];
    if (!currentType) return false;

    const matchesType = template.contractTypeId === currentType.value;
    const matchesContractTemplate = filterContractTemplateId ?
      template.contractTemplateId === filterContractTemplateId : true;
    const matchesSearch = filter.search ?
      template.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      (template.workServices && template.workServices.some((service: any) =>
        service.name && service.name.toLowerCase().includes(filter.search.toLowerCase())
      )) : true;
    const matchesDepartment = filter.departmentId ?
      template.departmentId.toString() === filter.departmentId : true;

    return matchesType && matchesContractTemplate && matchesSearch && matchesDepartment;
  });

  if (user?.role !== 'manager' && user?.role !== 'admin') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Доступ запрещен</Typography>
        <Typography>У вас нет прав для просмотра этой страницы</Typography>
      </Box>
    );
  }

  if (typesLoading || loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Загрузка данных...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Индикатор обработки перехода */}
      {processingRedirect && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          icon={<CircularProgress size={20} />}
        >
          Идет поиск зависимых шаблонов актов. Подождите пожалуйста...
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="h4">Настроить акт</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refreshData}
            disabled={loading}
          >
            Обновить
          </Button>

          <Paper
            elevation={2}
            sx={{
              display: 'flex',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                minHeight: 48,
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }}
            >
              {templateTypes.map((type, index) => (
                <Tab
                  key={type.value}
                  label={type.label}
                  sx={{
                    fontWeight: activeTab === index ? 600 : 500,
                    backgroundColor: activeTab === index ? 'primary.main' : 'background.paper',
                    color: activeTab === index ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: activeTab === index ? 'primary.dark' : 'action.hover',
                    },
                    borderRight: index < templateTypes.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    minWidth: 160,
                    '&.Mui-selected': {
                      color: 'white',
                    },
                  }}
                />
              ))}
            </Tabs>
          </Paper>
        </Box>
      </Box>

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

      <TabPanel value={activeTab} index={activeTab}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Шаблоны актов: {templateTypes[activeTab]?.label || 'Загрузка...'}
              {filterContractTemplateId && (
                <Chip
                  label={`Фильтр: Шаблон договора ID: ${filterContractTemplateId}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ ml: 2 }}
                  onDelete={() => {
                    setFilterContractTemplateId(null);
                    setHighlightedTemplates([]);
                    setError(null);
                  }}
                />
              )}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {filterContractTemplateId && (
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleCleanupAndReturn}
                >
                  Вернуться к договорам
                </Button>
              )}
              {/* УБИРАЕМ КНОПКУ "ДОБАВИТЬ ШАБЛОН АКТА" */}
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="Поиск по названию или работам/услугам"
                value={filter.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: <Search color="action" />
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Структурная единица</InputLabel>
                <Select
                  label="Структурная единица"
                  value={filter.departmentId}
                  onChange={(e) => handleFilterChange('departmentId', e.target.value)}
                >
                  <MenuItem value="">Все структурные единицы</MenuItem>
                  {structuralUnits.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id.toString()}>
                      {unit.name}{unit.code ? ` (${unit.code})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {renderTemplatesTable()}

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredActTemplates.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Строк на странице:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          />
        </Paper>
      </TabPanel>

      {/* Модальное окно редактирования/копирования */}
      <Dialog
        open={openEditModal}
        onClose={handleCloseEditModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedActTemplate?.id === 0 ? 'Создание копии шаблона акта' : 'Редактирование шаблона акта'}
          <IconButton
            aria-label="close"
            onClick={handleCloseEditModal}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedActTemplate && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Тип акта</InputLabel>
                  <Select
                    label="Тип акта"
                    value={selectedActTemplate.contractTypeId}
                    onChange={(e) => {
                      const contractTypeId = parseInt(e.target.value as string);
                      setSelectedActTemplate(prev => prev ? {
                        ...prev,
                        contractTypeId,
                        contractTemplateId: 0,
                        name: '',
                        workServices: [],
                        totalCost: 0
                      } : null);
                    }}
                  >
                    {contractTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Для создания копии - множественный выбор СЕ */}
              {selectedActTemplate.id === 0 ? (
                <Grid size={{xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Структурные единицы</InputLabel>
                    <Select
                      multiple
                      label="Структурные единицы"
                      value={selectedDepartments}
                      onChange={handleMultipleDepartmentChange}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const unit = structuralUnits.find(u => u.id === value);
                            return (
                              <Chip
                                key={value}
                                label={unit ? `${unit.name}${unit.code ? ` (${unit.code})` : ''}` : value}
                                size="small"
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {getAvailableStructuralUnitsForMultiple(selectedActTemplate).map((unit) => (
                        <MenuItem
                          key={unit.id}
                          value={unit.id}
                          disabled={unit.disabled}
                          sx={unit.disabled ? { color: 'text.disabled' } : {}}
                        >
                          <Checkbox checked={selectedDepartments.indexOf(unit.id) > -1} />
                          <ListItemText
                            primary={`${unit.name}${unit.code ? ` (${unit.code})` : ''}`}
                            secondary={unit.disabled ? "Уже используется" : undefined}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Выберите одну или несколько структурных единиц для создания копий
                  </Typography>
                </Grid>
              ) : (
                // Для редактирования - обычный выбор одной СЕ
                <Grid size={{xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Структурная единица</InputLabel>
                    <Select
                      label="Структурная единица"
                      value={selectedActTemplate.departmentId}
                      onChange={(e) => setSelectedActTemplate(prev => prev ? {
                        ...prev,
                        departmentId: parseInt(e.target.value as string)
                      } : null)}
                    >
                      {getAvailableStructuralUnits(selectedActTemplate).map((unit) => (
                        <MenuItem
                          key={unit.id}
                          value={unit.id}
                          disabled={unit.disabled}
                          sx={unit.disabled ? { color: 'text.disabled' } : {}}
                        >
                          {unit.name}{unit.code ? ` (${unit.code})` : ''}
                          {unit.disabled && ' - уже используется'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Шаблон договора</InputLabel>
                  <Select
                    label="Шаблон договора"
                    value={selectedActTemplate.contractTemplateId}
                    onChange={(e) => handleContractTemplateChange(parseInt(e.target.value as string))}
                  >
                    {getContractTemplatesForType(selectedActTemplate.contractTypeId).map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Работы / услуги:
                  </Typography>
                  {/* КНОПКА ДОБАВЛЕНИЯ УСЛУГИ ПОКАЗЫВАЕТСЯ ТОЛЬКО ДЛЯ ТИПА "cost" */}
                  {shouldShowAddServiceButton() && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={handleAddWorkService}
                    >
                      Добавить услугу
                    </Button>
                  )}
                </Box>

                {getContractTypeCode(selectedActTemplate.contractTypeId) === 'cost' ? (
                  // Для типа "cost" - одна общая стоимость
                  <Box>
                    {selectedActTemplate.workServices.map((workService, index) => (
                      <Grid container spacing={1} key={index} alignItems="center" sx={{ mb: 1 }}>
                        <Grid size={{ xs: 9 }}>
                          <TextField
                            fullWidth
                            label={`Наименование работы/услуги ${index + 1}`}
                            value={workService.name}
                            onChange={(e) => handleWorkServiceChange(index, 'name', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid size={{ xs: 2 }}>
                          <TextField
                            fullWidth
                            label="Стоимость"
                            type="number"
                            value={workService.cost}
                            onChange={(e) => handleWorkServiceChange(index, 'cost', parseFloat(e.target.value) || 0)}
                            size="small"
                            slotProps={{
                              input: {
                                startAdornment: <AttachMoney color="action" sx={{ mr: 1 }} />
                              }
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 1 }}>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveWorkService(index)}
                            disabled={selectedActTemplate.workServices.length === 1}
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}

                    {/* Общая стоимость для типа "cost" */}
                    {selectedActTemplate.workServices.length > 0 && (
                      <Grid container spacing={1} alignItems="center" sx={{ mt: 2, mb: 2 }}>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            label="Общая стоимость"
                            type="number"
                            value={selectedActTemplate.totalCost}
                            onChange={(e) => {
                              const totalCost = parseFloat(e.target.value) || 0;
                              const costPerService = totalCost / selectedActTemplate.workServices.length;
                              const updatedWorkServices = selectedActTemplate.workServices.map(service => ({
                                ...service,
                                cost: costPerService
                              }));
                              setSelectedActTemplate(prev => prev ? {
                                ...prev,
                                workServices: updatedWorkServices,
                                totalCost
                              } : null);
                            }}
                            size="small"
                            slotProps={{
                              input: {
                                startAdornment: <AttachMoney color="action" sx={{ mr: 1 }} />
                              }
                            }}
                            helperText="Общая стоимость за все работы/услуги"
                          />
                        </Grid>
                      </Grid>
                    )}
                  </Box>
                ) : (
                  // Для типов "operation" и "norm-hour" - индивидуальная стоимость для каждой услуги
                  selectedActTemplate.workServices.map((workService, index) => (
                    <Grid container spacing={1} key={index} alignItems="center" sx={{ mb: 1 }}>
                      <Grid size={{ xs: 7 }}>
                        <TextField
                          fullWidth
                          label={`Наименование работы/услуги ${index + 1}`}
                          value={workService.name}
                          onChange={(e) => handleWorkServiceChange(index, 'name', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 3 }}>
                        <TextField
                          fullWidth
                          label={`Стоимость ${getContractTypeCode(selectedActTemplate.contractTypeId) === 'operation' ? 'за операцию' : 'за час'}`}
                          type="number"
                          value={workService.cost}
                          onChange={(e) => handleWorkServiceChange(index, 'cost', parseFloat(e.target.value) || 0)}
                          size="small"
                          slotProps={{
                            input: {
                              startAdornment: <AttachMoney color="action" sx={{ mr: 1 }} />
                            }
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 2 }}>
                        {/* УБИРАЕМ КНОПКУ УДАЛЕНИЯ ДЛЯ ТИПОВ "operation" И "norm-hour" */}
                      </Grid>
                    </Grid>
                  ))
                )}

                {selectedActTemplate.workServices.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Нет работ/услуг. {shouldShowAddServiceButton() ? 'Нажмите "Добавить услугу" чтобы добавить.' : 'Работы/услуги автоматически подгружаются из шаблона договора.'}
                  </Typography>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Вы можете редактировать названия и стоимости работ/услуг
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleEditActTemplate}
            disabled={
              !selectedActTemplate?.contractTemplateId ||
              selectedActTemplate?.workServices.length === 0 ||
              selectedActTemplate?.contractTypeId === 0 ||
              (selectedActTemplate.id === 0 && selectedDepartments.length === 0) || // Для копии должна быть выбрана хотя бы одна СЕ
              (selectedActTemplate.id !== 0 && selectedActTemplate.departmentId === 0) // Для редактирования должна быть выбрана одна СЕ
            }
          >
            {selectedActTemplate?.id === 0 ?
              `Создать копии (${selectedDepartments.length})` :
              'Сохранить изменения'
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActSettings;