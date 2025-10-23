// src/components/Dashboard/ContractList.tsx
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper,
         IconButton, CircularProgress, TextField, Button, Grid, FormControl,
         InputLabel, Select, MenuItem, Link, Checkbox, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FirstPage, LastPage, FilterList, Warning } from '@mui/icons-material';
import { useState, useEffect, useMemo } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ruLocale from 'date-fns/locale/ru';
import styles from './styles/ContractList.module.css';
import { useAuth } from '../../context/AuthContext';
import { ContractService } from '../../services/ContractService';
import { Contract, ContractFilters } from '../../types/contract';

const ContractList = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialUnit = queryParams.get('unit') || '';
  const navigate = useNavigate();

  // Проверка доступа к данным
  const hasAccess = useMemo(() => {
    return user?.departments && user.departments.length > 0;
  }, [user?.departments]);

  // Тестовые данные для fallback
  const testContracts: Contract[] = [
    {
      id: 'ДП-2023-001',
      contractNumber: '01/25/001',
      contractDate: '2025-01-15',
      startDate: '2025-01-20',
      endDate: '2025-12-20',
      contractorId: '1',
      contractor: {
        id: '1',
        lastName: 'Иванов',
        firstName: 'Иван',
        middleName: 'Иванович',
        documentType: 'Паспорт РБ',
        documentSeries: '4510',
        documentNumber: '123456',
        citizenship: 'Республика Беларусь',
        issueDate: '2010-01-01',
        issuedBy: 'ОВД Советского района г. Минска',
        identificationNumber: '1234567A001PB1',
        mobilePhone: '+375291234567',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      departmentId: 1,
      department: {
        id: 1,
        name: 'ОМА офис',
        code: '11117'
      },
      contractType: 'operation',
      contractTemplateName: 'ДП-выкладчик',
      executorUserId: 'user-1',
      processed: true,
      transferDate: '2025-01-18',
      galaxyEntryDate: '2025-01-19',
      okEmployee: 'Сидорова Г.М.',
      workServices: [
        {
          id: '1',
          workServiceName: 'Выкладка товара по планограмме',
          cost: 4.50,
          operationCount: 120,
          createdAt: '2025-01-15',
          updatedAt: '2025-01-15'
        }
      ],
      createdAt: '2025-01-15',
      updatedAt: '2025-01-15'
    },
    {
      id: 'ДП-2023-002',
      contractNumber: '02/25/11118',
      contractDate: '2025-02-25',
      startDate: '2025-03-01',
      endDate: '2025-11-30',
      contractorId: '2',
      contractor: {
        id: '2',
        lastName: 'Петров',
        firstName: 'Петр',
        middleName: 'Петрович',
        documentType: 'Паспорт РБ',
        documentSeries: '4511',
        documentNumber: '654321',
        citizenship: 'Республика Беларусь',
        issueDate: '2015-05-15',
        issuedBy: 'ОВД Московского района г. Минска',
        identificationNumber: '7654321B002PB1',
        mobilePhone: '+375296543210',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      departmentId: 2,
      department: {
        id: 2,
        name: 'Минск Ванеева',
        code: '11118'
      },
      contractType: 'norm-hour',
      contractTemplateName: 'ДП-комплектовщик',
      executorUserId: 'user-2',
      processed: false,
      workServices: [
        {
          id: '2',
          workServiceName: 'Комплектация заказов по накладным',
          cost: 15.75,
          hoursCount: 8,
          createdAt: '2025-02-25',
          updatedAt: '2025-02-25'
        }
      ],
      createdAt: '2025-02-25',
      updatedAt: '2025-02-25'
    }
  ];

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  // Состояния для фильтров
  const [contractNumberFilter, setContractNumberFilter] = useState('');
  const [contractorFilter, setContractorFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState(initialUnit || '');
  const [contractTypeFilter, setContractTypeFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(null);
  const [showUnprocessed, setShowUnprocessed] = useState(false);

  // Список структурных единиц на основе назначенных пользователю
  const departments = useMemo(() => {
    if (!hasAccess) {
      return ["Все СЕ"];
    }

    const userDepartments = user!.departments.map(dept => dept.name);
    return ["Все СЕ", ...userDepartments];
  }, [hasAccess, user]);

  // Типы договоров
  const contractTypes = useMemo(() => ['Все', 'operation', 'norm-hour', 'cost'], []);

  useEffect(() => {
    if (initialUnit) {
      setDepartmentFilter(initialUnit);
    }
  }, [initialUnit]);

  // Загрузка договоров из API
  const fetchContracts = async () => {
    if (!hasAccess) {
      setLoading(false);
      setContracts([]);
      return;
    }

    try {
      setLoading(true);

      const filters: ContractFilters = {
        department: departmentFilter === 'Все СЕ' ? undefined : departmentFilter,
        contractType: contractTypeFilter === 'Все' ? undefined : contractTypeFilter,
        search: contractorFilter || contractNumberFilter || undefined,
        unprocessedOnly: showUnprocessed || undefined,
        startDateFrom: startDateFilter?.toISOString(),
        startDateTo: endDateFilter?.toISOString(),
        page: page + 1,
        pageSize: rowsPerPage
      };

      const response = await ContractService.getContracts(filters);
      setContracts(response.contracts);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      // Fallback to test data if API fails
      const userDepartmentNames = user?.departments.map(dept => dept.name) || [];
      const filteredTestData = testContracts.filter(contract =>
        userDepartmentNames.includes(contract.department.name)
      );
      setContracts(filteredTestData);
      setTotalCount(filteredTestData.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [departmentFilter, contractTypeFilter, contractorFilter, contractNumberFilter,
      showUnprocessed, startDateFilter, endDateFilter, page, rowsPerPage, hasAccess]);

  const handleDepartmentChange = (value: string) => {
    setDepartmentFilter(value);
    const newUnit = value === 'Все СЕ' ? '' : value;
    navigate(`/contracts${newUnit ? `?unit=${encodeURIComponent(newUnit)}` : ''}`, {
        replace: true
    });
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePassportDataClick = () => {
    navigate('/passport-data');
  };

  const exportToExcel = async () => {
    try {
      const filters: ContractFilters = {
        department: departmentFilter === 'Все СЕ' ? undefined : departmentFilter,
        contractType: contractTypeFilter === 'Все' ? undefined : contractTypeFilter,
        search: contractorFilter || contractNumberFilter || undefined,
        unprocessedOnly: showUnprocessed || undefined,
        startDateFrom: startDateFilter?.toISOString(),
        startDateTo: endDateFilter?.toISOString()
      };

      const blob = await ContractService.exportToExcel(filters);

      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contracts_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Ошибка при экспорте в Excel');
    }
  };

  const handleMarkAsProcessed = async (contractId: string) => {
    try {
      const okEmployee = `${user?.lastName} ${user?.firstName} ${user?.middleName || ''}`.trim() || 'Неизвестный сотрудник';
      await ContractService.markAsProcessed(contractId, okEmployee);
      // Обновляем список договоров
      await fetchContracts();
    } catch (error) {
      console.error('Error marking contract as processed:', error);
      alert('Ошибка при обновлении статуса договора');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getContractorFullName = (contractor: any) => {
    return `${contractor.lastName} ${contractor.firstName} ${contractor.middleName || ''}`.trim();
  };

  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case 'operation': return 'За операцию';
      case 'norm-hour': return 'Нормо-часа';
      case 'cost': return 'Стоимость';
      default: return type;
    }
  };

  // Если нет доступа к данным
  if (!hasAccess) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Журнал договоров
        </Typography>
        <Alert
          severity="warning"
          sx={{ mt: 2 }}
          icon={<Warning />}
        >
          <Typography variant="h6" gutterBottom>
            Доступ к данным ограничен
          </Typography>
          <Typography variant="body2">
            Вам не назначены структурные единицы. Для получения доступа к журналу договоров
            обратитесь к администратору системы.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Журнал договоров
      </Typography>

      {/* Блок фильтров */}
      <Paper className={styles.container}>
        <Typography variant="h6" className={styles.filterHeader}>
          <FilterList sx={{ mr: 1 }} /> Фильтры
        </Typography>

        <Grid container spacing={2} className={styles.filterRow}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Тип договора</InputLabel>
              <Select
                value={contractTypeFilter}
                label="Тип договора"
                onChange={(e) => setContractTypeFilter(e.target.value as string)}
                className={styles.wideSelect}
              >
                {contractTypes.map((type, index) => (
                  <MenuItem key={index} value={type}>
                    {type === 'Все' ? 'Все типы' : getContractTypeLabel(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Структурная единица</InputLabel>
              <Select
                value={departmentFilter}
                label="Структурная единица"
                onChange={(e) => handleDepartmentChange(e.target.value as string)}
                className={styles.wideSelect}
              >
                {departments.map((dept, index) => (
                  <MenuItem key={index} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="ФИО подрядчика"
              value={contractorFilter}
              onChange={(e) => setContractorFilter(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="№ договора"
              value={contractNumberFilter}
              onChange={(e) => setContractNumberFilter(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
              <DatePicker
                label="Дата начала"
                value={startDateFilter}
                onChange={(newValue) => setStartDateFilter(newValue)}
                slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
              <DatePicker
                label="Дата окончания"
                value={endDateFilter}
                onChange={(newValue) => setEndDateFilter(newValue)}
                slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant={showUnprocessed ? "contained" : "outlined"}
              onClick={() => setShowUnprocessed(!showUnprocessed)}
              fullWidth
            >
              Необработанные ДП
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              onClick={exportToExcel}
              fullWidth
            >
              Выгрузить в Excel
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Таблица договоров */}
      <Paper className={styles.tableContainer} sx={{ width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table className={styles.table} stickyHeader>
              <TableHead>
                <TableRow className={styles.tableHeadRow}>
                  <TableCell className={styles.tableHeadCell}>№ДП</TableCell>
                  <TableCell className={styles.tableHeadCell}>Дата договора</TableCell>
                  <TableCell className={styles.tableHeadCell}>ФИО/Паспортные данные</TableCell>
                  <TableCell className={styles.tableHeadCell}>Подразделение/ЦФО</TableCell>
                  <TableCell className={styles.tableHeadCell}>Тип договора</TableCell>
                  <TableCell className={styles.tableHeadCell}>Дата начала работ/услуг</TableCell>
                  <TableCell className={styles.tableHeadCell}>Дата окончания работ/услуг</TableCell>
                  <TableCell className={styles.tableHeadCell}>Исполнитель</TableCell>
                  <TableCell className={styles.tableHeadCell}>Дата передачи оригинала ДП в ОК</TableCell>
                  <TableCell className={styles.tableHeadCell}>Дата внесения в Галактику</TableCell>
                  <TableCell className={styles.tableHeadCell}>Сотрудник ОК</TableCell>
                  <TableCell className={styles.tableHeadCell}>Данные обработки</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contracts.length > 0 ? (
                  contracts
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((contract, index) => (
                      <TableRow
                        key={contract.id}
                        hover
                        className={`${styles.tableRow} ${index % 2 === 0 ? styles.evenRow : ''}`}
                      >
                        <TableCell className={styles.tableCell}>
                          <Link
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              // TODO: Переход к редактированию договора
                              console.log('Edit contract:', contract.id);
                            }}
                          >
                            {contract.contractNumber}
                          </Link>
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {formatDate(contract.contractDate)}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          <Link href="#" onClick={(e) => e.preventDefault()}>
                            {getContractorFullName(contract.contractor)}
                          </Link>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {contract.contractor.documentSeries} {contract.contractor.documentNumber}
                          </Typography>
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {contract.department.name}
                          {contract.department.code && ` (${contract.department.code})`}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {getContractTypeLabel(contract.contractType)}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {formatDate(contract.startDate)}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {formatDate(contract.endDate)}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {contract.executorUserId}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {contract.transferDate ? formatDate(contract.transferDate) : '-'}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {contract.galaxyEntryDate ? formatDate(contract.galaxyEntryDate) : '-'}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {contract.okEmployee || '-'}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          <Checkbox
                            checked={contract.processed}
                            onChange={() => handleMarkAsProcessed(contract.id)}
                            color="primary"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      Нет данных о договорах
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Box className={styles.paginationContainer} sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/create-contract')}
                >
                  Создать договор
                </Button>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => setPage(0)} disabled={page === 0}>
                  <FirstPage />
                </IconButton>
                <IconButton onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}>
                  <ChevronLeft />
                </IconButton>
                <Typography variant="body2" sx={{ mx: 1 }}>
                  {page + 1} из {Math.ceil(totalCount / rowsPerPage)}
                </Typography>
                <IconButton
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1}
                >
                  <ChevronRight />
                </IconButton>
                <IconButton
                  onClick={() => setPage(Math.ceil(totalCount / rowsPerPage) - 1)}
                  disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1}
                >
                  <LastPage />
                </IconButton>
              </Box>

              <Button
                variant="contained"
                onClick={handlePassportDataClick}
              >
                Паспортные данные
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ContractList;