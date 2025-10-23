// src/components/Settings/ActSettings.tsx
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Button, Grid, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TablePagination, Tooltip, Alert, Tabs, Tab, Chip,
  FormControl, InputLabel, Select, MenuItem, Autocomplete
} from '@mui/material';
import { Add, Edit, Delete, Search, Close, AttachMoney, Warning, Error as ErrorIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStructuralUnits } from '../../context/StructuralUnitsContext';
import { ActTemplate, WorkService, TabPanelProps, ContractType } from '../../../types/contract';
import { useContractTypes } from '../../hooks/useContractTypes';

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
  const [activeTab, setActiveTab] = useState(0);
  const [contractTemplates, setContractTemplates] = useState<any[]>([]);
  const [actTemplates, setActTemplates] = useState<ActTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedActTemplate, setSelectedActTemplate] = useState<ActTemplate | null>(null);

  const [newActTemplate, setNewActTemplate] = useState({
    name: '',
    contractTypeId: 0,
    workServices: [] as WorkService[],
    structuralUnit: ''
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filter, setFilter] = useState({
    search: '',
    structuralUnit: ''
  });

  // Моковые данные для договоров
  const mockContractTemplates = [
    {
      id: 1,
      name: 'ДП-выкладчик',
      contractTypeId: 1,
      workServices: ['Выкладка товара по планограмме', 'Мерчандайзинг продукции', 'Расстановка ценников'],
      operationsPer8Hours: 120,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'ДП-комплектовщик',
      contractTypeId: 1,
      workServices: ['Комплектация заказов по накладным', 'Упаковка товара', 'Проверка качества продукции'],
      operationsPer8Hours: 80,
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16'
    },
    {
      id: 3,
      name: 'ДП-контролер-кассир',
      contractTypeId: 2,
      workServices: ['Контроль кассовых операций', 'Проверка чеков и документов', 'Инвентаризация товаров'],
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17'
    },
    {
      id: 4,
      name: 'ДП-уборщик',
      contractTypeId: 3,
      workServices: ['Ежедневная уборка помещений', 'Санобработка поверхностей', 'Вынос мусора и утилизация'],
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18'
    }
  ];

  // Моковые данные для актов с услугами без стоимости
  const mockActTemplates: ActTemplate[] = [
    {
      id: 1,
      name: 'ДП-выкладчик',
      contractTypeId: 1,
      workServices: [
        { name: 'Выкладка товара по планограмме', cost: 0.20 },
        { name: 'Мерчандайзинг продукции', cost: 0.40 },
        { name: 'Расстановка ценников', cost: 0.25 },
        { name: 'Контроль сроков годности', cost: 0.00 }
      ],
      structuralUnit: 'ОМА офис (11117)',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20'
    },
    {
      id: 2,
      name: 'ДП-комплектовщик',
      contractTypeId: 1,
      workServices: [
        { name: 'Комплектация заказов по накладным', cost: 0.35 },
        { name: 'Упаковка товара', cost: 0.00 }
      ],
      structuralUnit: 'Минск Ванеева (11118)',
      createdAt: '2024-01-21',
      updatedAt: '2024-01-21'
    },
    {
      id: 3,
      name: 'ДП-контролер-кассир',
      contractTypeId: 2,
      workServices: [
        { name: 'Контроль кассовых операций', cost: 10.00 },
        { name: 'Проверка чеков и документов', cost: 12.00 },
        { name: 'Обучение новых сотрудников', cost: 0.00 }
      ],
      structuralUnit: 'ОМА офис (11117)',
      createdAt: '2024-01-22',
      updatedAt: '2024-01-22'
    },
    {
      id: 4,
      name: 'ДП-уборщик',
      contractTypeId: 2,
      workServices: [
        { name: 'Инвентаризация товаров', cost: 15.00 }
      ],
      structuralUnit: 'Минск Ванеева (11118)',
      createdAt: '2024-01-23',
      updatedAt: '2024-01-23'
    },
    {
      id: 5,
      name: 'ДП-уборщик',
      contractTypeId: 3,
      workServices: [
        { name: 'Ежедневная уборка помещений', cost: 800.00 },
        { name: 'Санобработка поверхностей', cost: 600.00 },
        { name: 'Вынос мусора и утилизация', cost: 0.00 }
      ],
      structuralUnit: 'ОМА офис (11117)',
      createdAt: '2024-01-24',
      updatedAt: '2024-01-24'
    }
  ];

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

  // Получение работ/услуг для выбранного типа договора
  const getWorkServicesForType = (contractTypeId: number): string[] => {
    const services = new Set<string>();
    contractTemplates
      .filter(contract => contract.contractTypeId === contractTypeId)
      .forEach(contract => {
        contract.workServices.forEach(service => services.add(service));
      });
    return Array.from(services);
  };

  // Получение доступных названий договоров для автодополнения
  const getAvailableContractNames = (): string[] => {
    const names = new Set<string>();
    contractTemplates.forEach(template => {
      names.add(template.name);
    });
    return Array.from(names);
  };

  // Функция для преобразования данных актов в табличный формат
  const getTableData = () => {
    if (templateTypes.length === 0) return actTemplates;

    const currentType = templateTypes[activeTab];
    if (!currentType) return actTemplates;

    let filtered = actTemplates.filter(template => template.contractTypeId === currentType.value);

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.workServices.some(service => service.name.toLowerCase().includes(searchLower))
      );
    }

    // Фильтр по структурной единице
    if (filter.structuralUnit) {
      filtered = filtered.filter(template => template.structuralUnit === filter.structuralUnit);
    }

    // Для типов "operation" и "norm-hour" разбиваем на отдельные строки
    if (currentType.code === 'operation' || currentType.code === 'norm-hour') {
      const expandedData: ActTemplate[] = [];
      filtered.forEach(template => {
        template.workServices.forEach(service => {
          expandedData.push({
            ...template,
            id: template.id * 1000 + template.workServices.indexOf(service),
            workServices: [service]
          });
        });
      });
      return expandedData;
    }

    return filtered;
  };

  // Функция для проверки наличия услуг без стоимости
  const hasServicesWithoutCost = (template: ActTemplate): boolean => {
    return template.workServices.some(service => service.cost === 0);
  };

  // Функция для подсчета количества услуг без стоимости
  const countServicesWithoutCost = (template: ActTemplate): number => {
    return template.workServices.filter(service => service.cost === 0).length;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setContractTemplates(mockContractTemplates);
      setActTemplates(mockActTemplates);
    } catch (err: any) {
      console.error('Ошибка загрузки данных:', err);
      setError('Не удалось загрузить данные');
      setContractTemplates(mockContractTemplates);
      setActTemplates(mockActTemplates);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractTypes.length > 0) {
      fetchData();
    }
  }, [contractTypes]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenAddModal = () => {
    const currentType = templateTypes[activeTab];

    setNewActTemplate({
      name: '',
      contractTypeId: currentType?.value || 0,
      workServices: [],
      structuralUnit: ''
    });
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setNewActTemplate({
      name: '',
      contractTypeId: 0,
      workServices: [],
      structuralUnit: ''
    });
  };

  const handleOpenEditModal = (actTemplate: ActTemplate) => {
    setSelectedActTemplate(JSON.parse(JSON.stringify(actTemplate)));
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedActTemplate(null);
  };

  const handleAddActTemplate = async () => {
    try {
      setError(null);

      const actTemplateData = {
        name: newActTemplate.name,
        contractTypeId: newActTemplate.contractTypeId,
        workServices: newActTemplate.workServices,
        structuralUnit: newActTemplate.structuralUnit
      };

      // TODO: Заменить на реальный API вызов
      console.log('Adding act template:', actTemplateData);

      const newActTemplateData: ActTemplate = {
        id: Date.now(),
        ...actTemplateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setActTemplates(prev => [...prev, newActTemplateData]);
      setSuccess('Шаблон акта успешно добавлен');
      handleCloseAddModal();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Ошибка добавления:', err);
      setError(err.response?.data?.message || 'Ошибка при добавлении шаблона акта');
    }
  };

  const handleEditActTemplate = async () => {
    if (!selectedActTemplate) return;

    try {
      setError(null);

      // TODO: Заменить на реальный API вызов
      console.log('Updating act template:', selectedActTemplate);

      setActTemplates(prev =>
        prev.map(template =>
          template.id === selectedActTemplate.id
            ? { ...selectedActTemplate, updatedAt: new Date().toISOString() }
            : template
        )
      );

      setSuccess('Шаблон акта успешно обновлен');
      handleCloseEditModal();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Ошибка обновления:', err);
      setError(err.response?.data?.message || 'Ошибка при обновлении шаблона акта');
    }
  };

  const handleDeleteActTemplate = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот шаблон акта?')) {
      return;
    }

    try {
      setError(null);

      // TODO: Заменить на реальный API вызов
      console.log('Deleting act template:', id);

      setActTemplates(prev => prev.filter(template => template.id !== id));
      setSuccess('Шаблон акта успешно удален');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Ошибка удаления:', err);
      setError(err.response?.data?.message || 'Ошибка при удалении шаблона акта');
    }
  };

  const handleWorkServiceChange = (index: number, field: 'name' | 'cost', value: string | number, isNew: boolean = false) => {
    if (isNew) {
      const newWorkServices = [...newActTemplate.workServices];
      newWorkServices[index] = { ...newWorkServices[index], [field]: value };
      setNewActTemplate(prev => ({ ...prev, workServices: newWorkServices }));
    } else if (selectedActTemplate) {
      const newWorkServices = [...selectedActTemplate.workServices];
      newWorkServices[index] = { ...newWorkServices[index], [field]: value };
      setSelectedActTemplate(prev => prev ? { ...prev, workServices: newWorkServices } : null);
    }
  };

  const handleAddWorkService = (isNew: boolean = false) => {
    const newWorkService: WorkService = {
      name: '',
      cost: 0
    };

    if (isNew) {
      setNewActTemplate(prev => ({
        ...prev,
        workServices: [...prev.workServices, newWorkService]
      }));
    } else if (selectedActTemplate) {
      setSelectedActTemplate(prev => prev ? {
        ...prev,
        workServices: [...prev.workServices, newWorkService]
      } : null);
    }
  };

  const handleRemoveWorkService = (index: number, isNew: boolean = false) => {
    if (isNew) {
      const newWorkServices = newActTemplate.workServices.filter((_, i) => i !== index);
      setNewActTemplate(prev => ({ ...prev, workServices: newWorkServices }));
    } else if (selectedActTemplate) {
      const newWorkServices = selectedActTemplate.workServices.filter((_, i) => i !== index);
      setSelectedActTemplate(prev => prev ? { ...prev, workServices: newWorkServices } : null);
    }
  };

  // Для типа "cost" - общая стоимость всех работ
  const getTotalCost = (workServices: WorkService[]): number => {
    return workServices.reduce((total, service) => total + service.cost, 0);
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

  const tableData = getTableData();
  const templatesToShow = tableData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const filteredTemplates = tableData;

  // Получение списка структурных единиц с кодами
  const structuralUnitOptions = structuralUnits.map(unit =>
    `${unit.name}${unit.code ? ` (${unit.code})` : ''}`
  );

  // Получение типа по ID для определения типа стоимости
  const getContractTypeCode = (contractTypeId: number): string => {
    const type = contractTypes.find(t => t.id === contractTypeId);
    return type?.code || '';
  };

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
        <Typography variant="h4">Настроить акт</Typography>

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

      <TabPanel value={activeTab} index={activeTab}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Шаблоны актов: {templateTypes[activeTab]?.label || 'Загрузка...'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenAddModal}
              disabled={templateTypes.length === 0}
            >
              Добавить шаблон акта
            </Button>
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
                  value={filter.structuralUnit}
                  onChange={(e) => handleFilterChange('structuralUnit', e.target.value)}
                >
                  <MenuItem value="">Все СЕ</MenuItem>
                  {structuralUnitOptions.map((unit, index) => (
                    <MenuItem key={index} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Тип</TableCell>
                <TableCell>Название договора</TableCell>
                <TableCell>Работы/услуги</TableCell>
                <TableCell>Стоимость</TableCell>
                <TableCell>Структурная единица</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templatesToShow.length > 0 ? (
                templatesToShow.map((template) => {
                  const contractTypeCode = getContractTypeCode(template.contractTypeId);
                  return (
                    <TableRow key={template.id} hover>
                      <TableCell>
                        <Chip
                          label={getTypeLabel(template.contractTypeId)}
                          color={getTypeColor(template.contractTypeId) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {template.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ maxWidth: 200 }}>
                          {template.workServices.map((service, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="body2">
                                {service.name}
                              </Typography>
                              {service.cost === 0 && (
                                <Tooltip title="Не установлена стоимость">
                                  <Warning color="warning" sx={{ fontSize: 16, ml: 0.5 }} />
                                </Tooltip>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {contractTypeCode === 'cost' ? (
                          // Для типа "cost" показываем общую стоимость
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color={getTotalCost(template.workServices) === 0 ? 'error' : 'inherit'}
                            >
                              {getTotalCost(template.workServices).toFixed(2)} Br
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              общая стоимость
                            </Typography>
                            {getTotalCost(template.workServices) === 0 && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <ErrorIcon color="error" sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="caption" color="error">
                                  Стоимость не установлена
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        ) : (
                          // Для типов "operation" и "norm-hour" показываем стоимость для каждой услуги
                          <Box sx={{ maxWidth: 150 }}>
                            {template.workServices.map((service, index) => (
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
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {template.structuralUnit}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Редактировать">
                          <IconButton onClick={() => handleOpenEditModal(template)}>
                            <Edit color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton onClick={() => handleDeleteActTemplate(template.id)}>
                            <Delete color="error" />
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
          Добавление шаблона акта
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
              <FormControl fullWidth>
                <InputLabel>Тип акта</InputLabel>
                <Select
                  label="Тип акта"
                  value={newActTemplate.contractTypeId}
                  onChange={(e) => {
                    const contractTypeId = parseInt(e.target.value as string);
                    setNewActTemplate(prev => ({
                      ...prev,
                      contractTypeId,
                      workServices: []
                    }));
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Структурная единица</InputLabel>
                <Select
                  label="Структурная единица"
                  value={newActTemplate.structuralUnit}
                  onChange={(e) => setNewActTemplate(prev => ({
                    ...prev,
                    structuralUnit: e.target.value
                  }))}
                >
                  {structuralUnitOptions.map((unit, index) => (
                    <MenuItem key={index} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Autocomplete
                freeSolo
                options={getAvailableContractNames()}
                value={newActTemplate.name}
                onChange={(event, newValue) => {
                  setNewActTemplate(prev => ({
                    ...prev,
                    name: newValue || ''
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Название договора"
                    required
                    placeholder="Например: ДП-выкладчик"
                    helperText="Выберите или введите название договора"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom>
                Работы / услуги:
              </Typography>

              {getContractTypeCode(newActTemplate.contractTypeId) === 'cost' ? (
                // Для типа "cost" - одна общая стоимость
                <Box>
                  {newActTemplate.workServices.map((workService, index) => (
                    <Grid container spacing={1} key={index} alignItems="center" sx={{ mb: 1 }}>
                      <Grid size={{ xs: 11 }}>
                        <Autocomplete
                          freeSolo
                          options={getWorkServicesForType(newActTemplate.contractTypeId)}
                          value={workService.name}
                          onChange={(event, newValue) => {
                            if (newValue) {
                              handleWorkServiceChange(index, 'name', newValue, true);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={`Наименование работы/услуги ${index + 1}`}
                              size="small"
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 1 }}>
                        <IconButton
                          onClick={() => handleRemoveWorkService(index, true)}
                          color="error"
                          disabled={newActTemplate.workServices.length <= 1}
                        >
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}

                  {/* Кнопка добавления работ/услуг ПЕРЕД полем стоимости */}
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => handleAddWorkService(true)}
                    sx={{ mt: 1, mb: 2 }}
                  >
                    ДОБАВИТЬ РАБОТЫ/УСЛУГИ
                  </Button>

                  {/* Общая стоимость для типа "cost" - ПОСЛЕ кнопки */}
                  {newActTemplate.workServices.length > 0 && (
                    <Grid container spacing={1} alignItems="center" sx={{ mt: 2, mb: 2 }}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Общая стоимость"
                          type="number"
                          value={getTotalCost(newActTemplate.workServices)}
                          onChange={(e) => {
                            const totalCost = parseFloat(e.target.value) || 0;
                            // Распределяем общую стоимость равномерно по всем работам
                            const costPerService = totalCost / newActTemplate.workServices.length;
                            const updatedWorkServices = newActTemplate.workServices.map(service => ({
                              ...service,
                              cost: costPerService
                            }));
                            setNewActTemplate(prev => ({
                              ...prev,
                              workServices: updatedWorkServices
                            }));
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
                newActTemplate.workServices.map((workService, index) => (
                  <Grid container spacing={1} key={index} alignItems="center" sx={{ mb: 1 }}>
                    <Grid size={{ xs: 7 }}>
                      <Autocomplete
                        freeSolo
                        options={getWorkServicesForType(newActTemplate.contractTypeId)}
                        value={workService.name}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            handleWorkServiceChange(index, 'name', newValue, true);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={`Наименование работы/услуги ${index + 1}`}
                            size="small"
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        label={`Стоимость ${getContractTypeCode(newActTemplate.contractTypeId) === 'operation' ? 'за операцию' : 'за час'}`}
                        type="number"
                        value={workService.cost}
                        onChange={(e) => handleWorkServiceChange(index, 'cost', parseFloat(e.target.value) || 0, true)}
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
                        onClick={() => handleRemoveWorkService(index, true)}
                        color="error"
                        disabled={newActTemplate.workServices.length <= 1}
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))
              )}

              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => handleAddWorkService(true)}
                sx={{ mt: 1 }}
              >
                ДОБАВИТЬ РАБОТЫ/УСЛУГИ
              </Button>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {getContractTypeCode(newActTemplate.contractTypeId) === 'cost'
                  ? 'Для типа "Стоимость" можно выбрать несколько работ/услуг с общей стоимостью'
                  : 'Для типов "За операцию" и "Нормо-часа" рекомендуется выбирать по одной работе/услуге'
                }
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleAddActTemplate}
            disabled={!newActTemplate.name || newActTemplate.workServices.length === 0 || !newActTemplate.structuralUnit || newActTemplate.contractTypeId === 0}
          >
            Добавить шаблон
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
          Редактирование шаблона акта
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
              <Grid size={{ xs: 12, sm: 6 }}>
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
                        workServices: []
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Структурная единица</InputLabel>
                  <Select
                    label="Структурная единица"
                    value={selectedActTemplate.structuralUnit}
                    onChange={(e) => setSelectedActTemplate(prev => prev ? {
                      ...prev,
                      structuralUnit: e.target.value
                    } : null)}
                  >
                    {structuralUnitOptions.map((unit, index) => (
                      <MenuItem key={index} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  freeSolo
                  options={getAvailableContractNames()}
                  value={selectedActTemplate.name}
                  onChange={(event, newValue) => {
                    setSelectedActTemplate(prev => prev ? {
                      ...prev,
                      name: newValue || ''
                    } : null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Название договора"
                      required
                      placeholder="Например: ДП-выкладчик"
                      helperText="Выберите или введите название договора"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Работы / услуги:
                </Typography>

                {getContractTypeCode(selectedActTemplate.contractTypeId) === 'cost' ? (
                  // Для типа "cost" - одна общая стоимость
                  <Box>
                    {selectedActTemplate.workServices.map((workService, index) => (
                      <Grid container spacing={1} key={index} alignItems="center" sx={{ mb: 1 }}>
                        <Grid size={{ xs: 11 }}>
                          <Autocomplete
                            freeSolo
                            options={getWorkServicesForType(selectedActTemplate.contractTypeId)}
                            value={workService.name}
                            onChange={(event, newValue) => {
                              if (newValue) {
                                handleWorkServiceChange(index, 'name', newValue, false);
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={`Наименование работы/услуги ${index + 1}`}
                                size="small"
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 1 }}>
                          <IconButton
                            onClick={() => handleRemoveWorkService(index, false)}
                            color="error"
                            disabled={selectedActTemplate.workServices.length <= 1}
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}

                    {/* Кнопка добавления работ/услуг ПЕРЕД полем стоимости */}
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => handleAddWorkService(false)}
                      sx={{ mt: 1, mb: 2 }}
                    >
                      ДОБАВИТЬ РАБОТЫ/УСЛУГИ
                    </Button>

                    {/* Общая стоимость для типа "cost" - ПОСЛЕ кнопки */}
                    {selectedActTemplate.workServices.length > 0 && (
                      <Grid container spacing={1} alignItems="center" sx={{ mt: 2, mb: 2 }}>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            label="Общая стоимость"
                            type="number"
                            value={getTotalCost(selectedActTemplate.workServices)}
                            onChange={(e) => {
                              const totalCost = parseFloat(e.target.value) || 0;
                              // Распределяем общую стоимость равномерно по всем работам
                              const costPerService = totalCost / selectedActTemplate.workServices.length;
                              const updatedWorkServices = selectedActTemplate.workServices.map(service => ({
                                ...service,
                                cost: costPerService
                              }));
                              setSelectedActTemplate(prev => prev ? {
                                ...prev,
                                workServices: updatedWorkServices
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
                        <Autocomplete
                          freeSolo
                          options={getWorkServicesForType(selectedActTemplate.contractTypeId)}
                          value={workService.name}
                          onChange={(event, newValue) => {
                            if (newValue) {
                              handleWorkServiceChange(index, 'name', newValue, false);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={`Наименование работы/услуги ${index + 1}`}
                              size="small"
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <TextField
                          fullWidth
                          label={`Стоимость ${getContractTypeCode(selectedActTemplate.contractTypeId) === 'operation' ? 'за операцию' : 'за час'}`}
                          type="number"
                          value={workService.cost}
                          onChange={(e) => handleWorkServiceChange(index, 'cost', parseFloat(e.target.value) || 0, false)}
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
                          onClick={() => handleRemoveWorkService(index, false)}
                          color="error"
                          disabled={selectedActTemplate.workServices.length <= 1}
                        >
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))
                )}

                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => handleAddWorkService(false)}
                  sx={{ mt: 1 }}
                >
                  ДОБАВИТЬ РАБОТЫ/УСЛУГИ
                </Button>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {getContractTypeCode(selectedActTemplate.contractTypeId) === 'cost'
                    ? 'Для типа "Стоимость" можно выбрать несколько работ/услуг с общей стоимостью'
                    : 'Для типов "За операцию" и "Нормо-часа" рекомендуется выбирать по одной работе/услуге'
                  }
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
            disabled={!selectedActTemplate?.name || selectedActTemplate?.workServices.length === 0 || !selectedActTemplate?.structuralUnit || selectedActTemplate?.contractTypeId === 0}
          >
            Сохранить изменения
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActSettings;