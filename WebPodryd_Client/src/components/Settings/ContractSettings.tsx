// src/components/Settings/ContractSettings.tsx
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Button, Grid, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TablePagination, Tooltip, Alert, Tabs, Tab, Chip,
  FormControl, InputLabel, Select, MenuItem, Autocomplete
} from '@mui/material';
import { Add, Edit, Delete, Search, Close, Warning, CheckCircle } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStructuralUnits } from '../../context/StructuralUnitsContext';
import { ContractTemplate, TabPanelProps } from '../../../types/contract';
import ContractTemplateService from '../../services/ContractTemplateService';
import ActTemplateService, { CreateActTemplateData } from '../../services/ActTemplateService';
import { useContractTypes } from '../../hooks/useContractTypes';

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contract-settings-tabpanel-${index}`}
      aria-labelledby={`contract-settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ContractSettings = () => {
  const { user } = useAuth();
  const { structuralUnits } = useStructuralUnits();
  const { contractTypes, loading: typesLoading } = useContractTypes();
  const [activeTab, setActiveTab] = useState(0);
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([]);
  const [actTemplatesCount, setActTemplatesCount] = useState<{[key: number]: number}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    contractTypeId: 0,
    type: '' as 'operation' | 'norm-hour' | 'cost',
    workServices: [] as string[]
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filter, setFilter] = useState({
    search: ''
  });

  // Состояние для подсветки шаблона договора после возврата из ActSettings
  const [highlightedTemplateId, setHighlightedTemplateId] = useState<number | null>(null);

  // Получаем типы договоров для табов и выпадающих списков
  const templateTypes = contractTypes.map(type => ({
    value: type.id,
    label: type.name,
    code: type.code
  }));

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

  // Получение доступных работ/услуг для автодополнения
  const getAvailableWorkServices = (): string[] => {
    const services = new Set<string>();
    contractTemplates.forEach(template => {
      template.workServices.forEach(service => services.add(service));
    });
    return Array.from(services);
  };

  // Функция для автоматического создания шаблона акта
  const autoCreateActTemplate = async (contractTemplate: ContractTemplate) => {
    try {
      console.log('Автоматическое создание шаблона акта для шаблона договора:', contractTemplate);

      const actTemplateData: CreateActTemplateData = {
        name: `${contractTemplate.name} (авто)`,
        contractTypeId: contractTemplate.contractTypeId,
        contractTemplateId: contractTemplate.id,
        workServices: contractTemplate.workServices.map((service: string) => ({
          name: service,
          cost: 0
        })),
        departmentId: structuralUnits[0]?.id || 0,
        totalCost: 0
      };

      const createdActTemplate = await ActTemplateService.createActTemplate(actTemplateData);
      console.log('Автоматически создан шаблон акта:', createdActTemplate);

      return createdActTemplate;
    } catch (error: any) {
      console.error('Ошибка автоматического создания шаблона акта:', error);
      throw error;
    }
  };

  // Функция для получения количества зависимых шаблонов актов
  const fetchActTemplatesCount = async () => {
    try {
      const allActTemplates = await ActTemplateService.getActTemplates();
      const countMap: {[key: number]: number} = {};

      // Для каждого шаблона договора считаем количество связанных шаблонов актов
      contractTemplates.forEach(template => {
        const count = allActTemplates.filter(actTemplate =>
          actTemplate.contractTemplateId === template.id
        ).length;
        countMap[template.id] = count;
      });

      setActTemplatesCount(countMap);
      console.log('Обновлено количество зависимых шаблонов актов:', countMap);
    } catch (error) {
      console.error('Ошибка загрузки количества шаблонов актов:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      if (contractTypes.length === 0) {
        setContractTemplates([]);
        return;
      }

      // Реальный API вызов - получаем шаблоны по ID типа договора
      const currentType = templateTypes[activeTab];
      if (currentType) {
        const templates = await ContractTemplateService.getTemplatesByContractType(currentType.value);
        setContractTemplates(templates);

        // ЗАГРУЖАЕМ КОЛИЧЕСТВО ЗАВИСИМЫХ ШАБЛОНОВ АКТОВ СРАЗУ ПОСЛЕ ЗАГРУЗКИ ШАБЛОНОВ
        await fetchActTemplatesCount();
      } else {
        setContractTemplates([]);
      }

    } catch (err: any) {
      console.error('Ошибка загрузки шаблонов:', err);
      setError('Не удалось загрузить список шаблонов договоров');
      setContractTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  // Функция для принудительного обновления данных (без сообщения)
  const refreshData = async () => {
    try {
      setLoading(true);
      await fetchTemplates(); // Эта функция теперь автоматически загружает и количество зависимых шаблонов
    } catch (err: any) {
      console.error('Ошибка обновления данных:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractTypes.length > 0) {
      fetchTemplates();
    }
  }, [activeTab, contractTypes]);

  // Эффект для обработки возврата из ActSettings
  useEffect(() => {
    const returnedFromActSettings = sessionStorage.getItem('returnedFromActSettings');
    const templateToHighlight = sessionStorage.getItem('templateToHighlight');

    if (returnedFromActSettings && templateToHighlight) {
      setHighlightedTemplateId(parseInt(templateToHighlight));
      sessionStorage.removeItem('returnedFromActSettings');
      sessionStorage.removeItem('templateToHighlight');

      // Автоматически обновляем данные
      refreshData();
    }
  }, []);

  // Эффект для обновления количества зависимых шаблонов при изменении списка шаблонов договоров
  useEffect(() => {
    if (contractTemplates.length > 0) {
      fetchActTemplatesCount();
    }
  }, [contractTemplates]);

  // Эффект для периодического обновления данных (каждые 3 часа)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        refreshData();
      }
    }, 10800000);

    return () => clearInterval(interval);
  }, [loading]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
    setHighlightedTemplateId(null);
  };

  const handleOpenAddModal = () => {
    const currentType = templateTypes[activeTab];
    const selectedContractType = contractTypes.find(ct => ct.id === currentType?.value);

    setNewTemplate({
      name: '',
      contractTypeId: currentType?.value || contractTypes[0]?.id || 0,
      type: (selectedContractType?.code as 'operation' | 'norm-hour' | 'cost') || 'operation',
      workServices: ['']
    });
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setNewTemplate({
      name: '',
      contractTypeId: contractTypes[0]?.id || 0,
      type: 'operation',
      workServices: []
    });
  };

  const handleOpenEditModal = (template: ContractTemplate) => {
    setSelectedTemplate({
      ...template,
      contractTypeId: template.contractTypeId || contractTypes[0]?.id || 1
    });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedTemplate(null);
  };

  const handleAddTemplate = async () => {
    try {
      setError(null);
      setCreatingTemplate(true);

      // Валидация
      if (!newTemplate.name.trim()) {
        setError('Введите название шаблона');
        setCreatingTemplate(false);
        return;
      }

      const validWorkServices = newTemplate.workServices.filter(service => service.trim() !== '');
      if (validWorkServices.length === 0) {
        setError('Добавьте хотя бы одну работу/услугу');
        setCreatingTemplate(false);
        return;
      }

      if (!newTemplate.contractTypeId || newTemplate.contractTypeId === 0) {
        setError('Выберите тип договора');
        setCreatingTemplate(false);
        return;
      }

      const templateData = {
        name: newTemplate.name.trim(),
        type: newTemplate.type,
        contractTypeId: newTemplate.contractTypeId,
        workServices: validWorkServices
      };

      // Реальный API вызов - создаем шаблон договора
      const newTemplateData = await ContractTemplateService.createContractTemplate(templateData);

      // Автоматически создаем шаблон акта
      try {
        await autoCreateActTemplate(newTemplateData);
        console.log('Шаблон акта автоматически создан');

        setSuccess('Шаблон договора и шаблон акта успешно созданы');
      } catch (actError: any) {
        console.error('Ошибка создания шаблона акта, но шаблон договора создан:', actError);
        setSuccess('Шаблон договора создан, но произошла ошибка при создании шаблона акта');
      }

      setContractTemplates(prev => [...prev, newTemplateData]);
      handleCloseAddModal();

      // ОБНОВЛЯЕМ ДАННЫЕ СРАЗУ ПОСЛЕ СОЗДАНИЯ
      await refreshData();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error('Ошибка добавления:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка при добавлении шаблона договора');
    } finally {
      setCreatingTemplate(false);
    }
  };

  const handleEditTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setError(null);

      // Валидация
      if (!selectedTemplate.name.trim()) {
        setError('Введите название шаблона');
        return;
      }

      const validWorkServices = selectedTemplate.workServices.filter(service => service.trim() !== '');
      if (validWorkServices.length === 0) {
        setError('Добавьте хотя бы одну работу/услугу');
        return;
      }

      if (!selectedTemplate.contractTypeId || selectedTemplate.contractTypeId === 0) {
        setError('Выберите тип договора');
        return;
      }

      const updateData = {
        name: selectedTemplate.name.trim(),
        type: selectedTemplate.type,
        contractTypeId: selectedTemplate.contractTypeId,
        workServices: validWorkServices
      };

      // Реальный API вызов
      await ContractTemplateService.updateContractTemplate(selectedTemplate.id, updateData);

      setSuccess('Шаблон договора успешно обновлен');
      handleCloseEditModal();

      // ОБНОВЛЯЕМ ДАННЫЕ СРАЗУ ПОСЛЕ РЕДАКТИРОВАНИЯ
      await refreshData();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Ошибка обновления:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка при обновлении шаблона договора');
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот шаблон договора?')) {
      return;
    }

    try {
      setError(null);
      await ContractTemplateService.deleteContractTemplate(id);

      setSuccess('Шаблон договора успешно удален');

      // ОБНОВЛЯЕМ ДАННЫЕ СРАЗУ ПОСЛЕ УДАЛЕНИЯ
      await refreshData();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Ошибка удаления:', err);

      // Детальная обработка ошибок с кнопкой перехода
      if (err.response?.data?.details) {
        const errorMessage = `${err.response.data.message}: ${err.response.data.details}`;

        // Проверяем, содержит ли ошибка информацию о зависимых шаблонах актов
        if (err.response.data.message?.includes('зависимых шаблонов актов') ||
            err.response.data.details?.includes('зависимых шаблонов актов') ||
            err.response.data.message?.includes('dependent act templates')) {

          // Создаем кнопку для перехода к удалению зависимых шаблонов
          setError(
            <Box>
              <Typography variant="body1" gutterBottom>
                {errorMessage}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => navigateToActTemplates(id)}
                sx={{ mt: 1 }}
                startIcon={<Delete />}
              >
                Перейти к удалению зависимых шаблонов актов
              </Button>
            </Box>
          );
        } else {
          setError(errorMessage);
        }
      } else if (err.response?.data?.message) {
        const errorMessage = err.response.data.message;

        // Проверяем стандартное сообщение об ошибке
        if (errorMessage.includes('зависимых шаблонов актов') ||
            errorMessage.includes('dependent act templates')) {

          setError(
            <Box>
              <Typography variant="body1" gutterBottom>
                {errorMessage}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => navigateToActTemplates(id)}
                sx={{ mt: 1 }}
                startIcon={<Delete />}
              >
                Перейти к удалению зависимых шаблонов актов
              </Button>
            </Box>
          );
        } else {
          setError(errorMessage);
        }
      } else {
        setError(err.message || 'Ошибка при удалении шаблона договора');
      }
    }
  };

  // Функция для перехода к настройкам актов с фильтрацией по шаблону договора
  const navigateToActTemplates = (contractTemplateId: number) => {
    // Сохраняем ID шаблона договора в sessionStorage для использования в ActSettings
    sessionStorage.setItem('selectedContractTemplateId', contractTemplateId.toString());
    sessionStorage.setItem('redirectFromContractSettings', 'true');

    // Переход к настройкам актов
    window.location.href = '/act-settings';

    console.log('Переход к настройкам актов для шаблона договора ID:', contractTemplateId);
  };

  // Функция для сброса подсветки
  const handleClearHighlight = () => {
    setHighlightedTemplateId(null);
  };

  const handleWorkServiceChange = (index: number, value: string, isNew: boolean = false) => {
    if (isNew) {
      const newWorkServices = [...newTemplate.workServices];
      newWorkServices[index] = value;
      setNewTemplate(prev => ({ ...prev, workServices: newWorkServices }));
    } else if (selectedTemplate) {
      const newWorkServices = [...selectedTemplate.workServices];
      newWorkServices[index] = value;
      setSelectedTemplate(prev => prev ? { ...prev, workServices: newWorkServices } : null);
    }
  };

  const handleAddWorkService = (isNew: boolean = false) => {
    if (isNew) {
      setNewTemplate(prev => ({
        ...prev,
        workServices: [...prev.workServices, '']
      }));
    } else if (selectedTemplate) {
      setSelectedTemplate(prev => prev ? {
        ...prev,
        workServices: [...prev.workServices, '']
      } : null);
    }
  };

  const handleRemoveWorkService = (index: number, isNew: boolean = false) => {
    if (isNew) {
      const newWorkServices = newTemplate.workServices.filter((_, i) => i !== index);
      setNewTemplate(prev => ({ ...prev, workServices: newWorkServices }));
    } else if (selectedTemplate) {
      const newWorkServices = selectedTemplate.workServices.filter((_, i) => i !== index);
      setSelectedTemplate(prev => prev ? { ...prev, workServices: newWorkServices } : null);
    }
  };

  const handleContractTypeChange = (contractTypeId: number, isNew: boolean = false) => {
    const contractType = contractTypes.find(ct => ct.id === contractTypeId);
    if (contractType) {
      if (isNew) {
        setNewTemplate(prev => ({
          ...prev,
          contractTypeId,
          type: contractType.code as 'operation' | 'norm-hour' | 'cost'
        }));
      } else if (selectedTemplate) {
        setSelectedTemplate(prev => prev ? {
          ...prev,
          contractTypeId,
          type: contractType.code as 'operation' | 'norm-hour' | 'cost'
        } : null);
      }
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (value: string) => {
    setFilter({ search: value });
    setPage(0);
  };

  const getFilteredTemplates = () => {
    if (templateTypes.length === 0) return contractTemplates;

    const currentType = templateTypes[activeTab];
    if (!currentType) return contractTemplates;

    let filtered = contractTemplates.filter(template => template.contractTypeId === currentType.value);

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.workServices.some(service => service.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  };

  const templatesToShow = getFilteredTemplates().slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const filteredTemplates = getFilteredTemplates();

  if (user?.role !== 'manager' && user?.role !== 'admin') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Доступ запрещен</Typography>
        <Typography>У вас нет прав для просмотра этой страницы</Typography>
      </Box>
    );
  }

  if (typesLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Загрузка типов договоров...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="h4">Настроить договор</Typography>

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

      {/* Баннер подсветки после возврата из ActSettings */}
      {highlightedTemplateId && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleClearHighlight}>
              Сбросить
            </Button>
          }
        >
          <Typography variant="body1">
            Все зависимые шаблоны актов удалены. Теперь можно удалить шаблон договора.
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Подсвеченный шаблон готов к удалению.
          </Typography>
        </Alert>
      )}

      <TabPanel value={activeTab} index={activeTab}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Шаблоны договоров: {templateTypes[activeTab]?.label || 'Загрузка...'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenAddModal}
              disabled={templateTypes.length === 0}
            >
              Добавить шаблон
            </Button>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 8, md: 4 }}>
              <TextField
                fullWidth
                label="Поиск по названию или работам/услугам"
                value={filter.search}
                onChange={(e) => handleFilterChange(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: <Search color="action" />
                  }
                }}
              />
            </Grid>
          </Grid>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Тип договора</TableCell>
                <TableCell>Название договора</TableCell>
                <TableCell>Работы/услуги</TableCell>
                <TableCell align="center">Зависимые шаблоны актов</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : templatesToShow.length > 0 ? (
                templatesToShow.map((template) => {
                  const dependentCount = actTemplatesCount[template.id] || 0;
                  const isHighlighted = highlightedTemplateId === template.id;
                  const hasNoActTemplates = dependentCount === 0;

                  return (
                    <TableRow
                      key={template.id}
                      hover
                      sx={{
                        backgroundColor: isHighlighted
                          ? 'rgba(25, 118, 210, 0.08)'
                          : hasNoActTemplates
                            ? 'rgba(255, 109, 102, 0.1)'
                            : 'inherit',
                        border: isHighlighted ? '2px solid #1976d2' : '1px solid rgba(224, 224, 224, 1)',
                        '&:hover': {
                          backgroundColor: isHighlighted
                            ? 'rgba(25, 118, 210, 0.12)'
                            : hasNoActTemplates
                              ? 'rgba(255, 109, 102, 0.15)'
                              : 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={getTypeLabel(template.contractTypeId)}
                          color={getTypeColor(template.contractTypeId) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {template.name}
                          </Typography>
                          {isHighlighted && (
                            <Tooltip title="Готов к удалению">
                              <CheckCircle color="success" fontSize="small" />
                            </Tooltip>
                          )}
                          {hasNoActTemplates && !isHighlighted && (
                            <Tooltip title="Нет созданных шаблонов актов">
                              <Warning color="warning" fontSize="small" />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ maxWidth: 400 }}>
                          {template.workServices.slice(0, 3).map((service, index) => (
                            <Typography key={index} variant="body2">
                              • {service}
                            </Typography>
                          ))}
                          {template.workServices.length > 3 && (
                            <Typography variant="body2" color="text.secondary">
                              • и еще {template.workServices.length - 3}...
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Chip
                            label={dependentCount}
                            color={
                              dependentCount === 0
                                ? 'default'
                                : dependentCount > 0
                                  ? 'primary'
                                  : 'default'
                            }
                            variant={dependentCount === 0 ? "outlined" : "filled"}
                            size="small"
                          />
                          {dependentCount === 0 && (
                            <Tooltip title="Нет созданных шаблонов актов">
                              <Warning color="warning" fontSize="small" />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Редактировать">
                          <IconButton onClick={() => handleOpenEditModal(template)}>
                            <Edit color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton
                            onClick={() => handleDeleteTemplate(template.id)}
                            sx={{
                              color: isHighlighted ? '#1976d2' : 'error.main',
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {contractTemplates.length === 0 ? 'Нет данных о шаблонах' : 'Ничего не найдено'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTemplates.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Строк на странице:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          />
        </Paper>
      </TabPanel>

      {/* Модальное окно добавления */}
      <Dialog
        open={openAddModal}
        onClose={handleCloseAddModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Добавление шаблона договора
          <IconButton
            aria-label="close"
            onClick={handleCloseAddModal}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Тип договора</InputLabel>
                <Select
                  label="Тип договора"
                  value={newTemplate.contractTypeId || contractTypes[0]?.id || ''}
                  onChange={(e) => {
                    const contractTypeId = parseInt(e.target.value as string);
                    handleContractTypeChange(contractTypeId, true);
                  }}
                  disabled={creatingTemplate}
                >
                  {contractTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name} ({type.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Название договора"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Например: ДП-выкладчик"
                helperText="Можно создавать несколько шаблонов с одинаковыми названиями для одного типа договора"
                disabled={creatingTemplate}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom>
                Работы / услуги:
              </Typography>

              {newTemplate.workServices.map((service, index) => (
                <Grid container spacing={1} key={index} alignItems="center" sx={{ mb: 1 }}>
                  <Grid size={{ xs: 11 }}>
                    <Autocomplete
                      freeSolo
                      options={getAvailableWorkServices()}
                      value={service}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          handleWorkServiceChange(index, newValue, true);
                        }
                      }}
                      onInputChange={(event, newValue) => {
                        handleWorkServiceChange(index, newValue, true);
                      }}
                      disabled={creatingTemplate}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={`Наименование работы/услуги ${index + 1}`}
                          size="small"
                          value={service}
                          onChange={(e) => handleWorkServiceChange(index, e.target.value, true)}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 1 }}>
                    <IconButton
                      onClick={() => handleRemoveWorkService(index, true)}
                      color="error"
                      disabled={newTemplate.workServices.length <= 1 || creatingTemplate}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}

              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => handleAddWorkService(true)}
                sx={{ mt: 1 }}
                disabled={creatingTemplate}
              >
                ДОБАВИТЬ РАБОТЫ/УСЛУГИ
              </Button>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                При создании шаблона договора автоматически будет создан соответствующий шаблон акта с нулевой стоимостью.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal} disabled={creatingTemplate}>
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleAddTemplate}
            disabled={creatingTemplate || !newTemplate.name.trim() ||
                     newTemplate.workServices.filter(service => service.trim() !== '').length === 0 ||
                     !newTemplate.contractTypeId || newTemplate.contractTypeId === 0}
          >
            {creatingTemplate ? 'Создание...' : 'Добавить шаблон'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно редактирования */}
      <Dialog
        open={openEditModal}
        onClose={handleCloseEditModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Редактирование шаблона договора
          <IconButton
            aria-label="close"
            onClick={handleCloseEditModal}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTemplate && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Тип договора</InputLabel>
                  <Select
                    label="Тип договора"
                    value={selectedTemplate.contractTypeId || contractTypes[0]?.id || ''}
                    onChange={(e) => {
                      const contractTypeId = parseInt(e.target.value as string);
                      handleContractTypeChange(contractTypeId, false);
                    }}
                  >
                    {contractTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name} ({type.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Название договора"
                  value={selectedTemplate.name}
                  onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                  required
                  helperText="Можно создавать несколько шаблонов с одинаковыми названиями для одного типа договора"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Работы / услуги:
                </Typography>

                {selectedTemplate.workServices.map((service, index) => (
                  <Grid container spacing={1} key={index} alignItems="center" sx={{ mb: 1 }}>
                    <Grid size={{ xs: 11 }}>
                      <Autocomplete
                        freeSolo
                        options={getAvailableWorkServices()}
                        value={service}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            handleWorkServiceChange(index, newValue);
                          }
                        }}
                        onInputChange={(event, newValue) => {
                          handleWorkServiceChange(index, newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={`Наименование работы/услуги ${index + 1}`}
                            size="small"
                            value={service}
                            onChange={(e) => handleWorkServiceChange(index, e.target.value)}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 1 }}>
                      <IconButton
                        onClick={() => handleRemoveWorkService(index)}
                        color="error"
                        disabled={selectedTemplate.workServices.length <= 1}
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}

                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => handleAddWorkService()}
                  sx={{ mt: 1 }}
                >
                  ДОБАВИТЬ РАБОТЫ/УСЛУГИ
                </Button>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleEditTemplate}
            disabled={!selectedTemplate?.name.trim() ||
                     selectedTemplate.workServices.filter(service => service.trim() !== '').length === 0 ||
                     !selectedTemplate.contractTypeId || selectedTemplate.contractTypeId === 0}
          >
            Сохранить изменения
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractSettings;