// src/components/Settings/ContractSettings.tsx
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Button, Grid, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TablePagination, Tooltip, Alert, Tabs, Tab, Chip,
  FormControl, InputLabel, Select, MenuItem, Autocomplete
} from '@mui/material';
import { Add, Edit, Delete, Search, Close } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ContractTemplate, TabPanelProps, ContractType } from '../../../types/contract';
import ContractTemplateService from '../../services/ContractTemplateService';
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
  const { contractTypes, loading: typesLoading } = useContractTypes();
  const [activeTab, setActiveTab] = useState(0);
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    contractTypeId: 0,
    workServices: [] as string[]
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filter, setFilter] = useState({
    search: ''
  });

  // Моковые данные для fallback
  const mockTemplates: ContractTemplate[] = [
    {
      id: 1,
      name: 'ДП-выкладчик',
      contractTypeId: 1,
      workServices: ['Выкладка товара по планограмме', 'Мерчандайзинг продукции', 'Расстановка ценников', 'Контроль сроков годности', 'Поддержание чистоты на полках'],
      operationsPer8Hours: 0,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'ДП-комплектовщик',
      contractTypeId: 1,
      workServices: ['Комплектация заказов по накладным', 'Упаковка товара', 'Проверка качества продукции', 'Маркировка готовых заказов', 'Погрузка товара в транспорт'],
      operationsPer8Hours: 0,
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16'
    },
    {
      id: 3,
      name: 'ДП-контролер-кассир',
      contractTypeId: 2,
      workServices: ['Контроль кассовых операций', 'Проверка чеков и документов', 'Инвентаризация товаров', 'Обучение новых кассиров', 'Составление отчетности по кассам'],
      operationsPer8Hours: 8,
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17'
    },
    {
      id: 4,
      name: 'ДП-уборщик',
      contractTypeId: 3,
      workServices: ['Ежедневная уборка помещений', 'Санобработка поверхностей', 'Вынос мусора и утилизация', 'Мытье окон и витрин', 'Уход за прилегающей территорией'],
      operationsPer8Hours: 0,
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18'
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

  // Получение доступных работ/услуг для автодополнения
  const getAvailableWorkServices = (): string[] => {
    const services = new Set<string>();
    contractTemplates.forEach(template => {
      template.workServices.forEach(service => services.add(service));
    });
    return Array.from(services);
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      if (contractTypes.length === 0) {
        // Если типы еще не загружены, используем моковые данные
        const currentTypeCode = ['operation', 'norm-hour', 'cost'][activeTab];
        const currentType = contractTypes.find(t => t.code === currentTypeCode);
        if (currentType) {
          setContractTemplates(mockTemplates.filter(t => t.contractTypeId === currentType.id));
        } else {
          setContractTemplates(mockTemplates);
        }
        return;
      }

      // Реальный API вызов
      const currentType = templateTypes[activeTab];
      if (currentType) {
        const templates = await ContractTemplateService.getContractTemplates({
          contractTypeId: currentType.value
        });
        setContractTemplates(templates);
      }

    } catch (err: any) {
      console.error('Ошибка загрузки шаблонов:', err);
      setError('Не удалось загрузить список шаблонов договоров');
      // Fallback на моковые данные
      const currentType = templateTypes[activeTab];
      if (currentType) {
        setContractTemplates(mockTemplates.filter(t => t.contractTypeId === currentType.value));
      } else {
        setContractTemplates(mockTemplates);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractTypes.length > 0) {
      fetchTemplates();
    }
  }, [activeTab, contractTypes]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleOpenAddModal = () => {
    const currentType = templateTypes[activeTab];
    setNewTemplate({
      name: '',
      contractTypeId: currentType?.value || 0,
      workServices: ['']
    });
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setNewTemplate({
      name: '',
      contractTypeId: 0,
      workServices: []
    });
  };

  const handleOpenEditModal = (template: ContractTemplate) => {
    setSelectedTemplate({ ...template });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedTemplate(null);
  };

  const handleAddTemplate = async () => {
    try {
      setError(null);

      const templateData = {
        name: newTemplate.name,
        contractTypeId: newTemplate.contractTypeId,
        workServices: newTemplate.workServices.filter(service => service.trim() !== ''),
        operationsPer8Hours: 0
      };

      // Реальный API вызов
      const newTemplateData = await ContractTemplateService.createContractTemplate(templateData);

      setContractTemplates(prev => [...prev, newTemplateData]);
      setSuccess('Шаблон договора успешно добавлен');
      handleCloseAddModal();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Ошибка добавления:', err);
      setError(err.response?.data?.message || 'Ошибка при добавлении шаблона договора');
    }
  };

  const handleEditTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setError(null);

      // Реальный API вызов
      await ContractTemplateService.updateContractTemplate(selectedTemplate.id, {
        name: selectedTemplate.name,
        contractTypeId: selectedTemplate.contractTypeId,
        workServices: selectedTemplate.workServices.filter(service => service.trim() !== ''),
        operationsPer8Hours: selectedTemplate.operationsPer8Hours
      });

      setContractTemplates(prev =>
        prev.map(template =>
          template.id === selectedTemplate.id
            ? { ...selectedTemplate, updatedAt: new Date().toISOString() }
            : template
        )
      );

      setSuccess('Шаблон договора успешно обновлен');
      handleCloseEditModal();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Ошибка обновления:', err);
      setError(err.response?.data?.message || 'Ошибка при обновлении шаблона договора');
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот шаблон договора?')) {
      return;
    }

    try {
      setError(null);

      // Реальный API вызов
      await ContractTemplateService.deleteContractTemplate(id);

      setContractTemplates(prev => prev.filter(template => template.id !== id));
      setSuccess('Шаблон договора успешно удален');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Ошибка удаления:', err);
      setError(err.response?.data?.message || 'Ошибка при удалении шаблона договора');
    }
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
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : templatesToShow.length > 0 ? (
                templatesToShow.map((template) => (
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
                      <Box sx={{ maxWidth: 300 }}>
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
                    <TableCell align="right">
                      <Tooltip title="Редактировать">
                        <IconButton onClick={() => handleOpenEditModal(template)}>
                          <Edit color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton onClick={() => handleDeleteTemplate(template.id)}>
                          <Delete color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
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
              <FormControl fullWidth>
                <InputLabel>Тип договора</InputLabel>
                <Select
                  label="Тип договора"
                  value={newTemplate.contractTypeId}
                  onChange={(e) => {
                    const contractTypeId = parseInt(e.target.value as string);
                    setNewTemplate(prev => ({
                      ...prev,
                      contractTypeId,
                      workServices: ['']
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
              <TextField
                fullWidth
                label="Название договора"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Например: ДП-выкладчик"
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
                      disabled={newTemplate.workServices.length <= 1}
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
              >
                ДОБАВИТЬ РАБОТЫ/УСЛУГИ
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleAddTemplate}
            disabled={!newTemplate.name || newTemplate.workServices.filter(service => service.trim() !== '').length === 0 || newTemplate.contractTypeId === 0}
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
                <FormControl fullWidth>
                  <InputLabel>Тип договора</InputLabel>
                  <Select
                    label="Тип договора"
                    value={selectedTemplate.contractTypeId}
                    onChange={(e) => {
                      const contractTypeId = parseInt(e.target.value as string);
                      setSelectedTemplate(prev => prev ? {
                        ...prev,
                        contractTypeId
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
                <TextField
                  fullWidth
                  label="Название договора"
                  value={selectedTemplate.name}
                  onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                  required
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
            disabled={!selectedTemplate?.name || selectedTemplate.workServices.filter(service => service.trim() !== '').length === 0}
          >
            Сохранить изменения
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractSettings;