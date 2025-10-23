// src/components/Dashboard/ActsList.tsx
import {Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, CircularProgress,
  TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Link, Checkbox, Alert} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FirstPage, LastPage, FilterList, FileCopy, Warning } from '@mui/icons-material';
import { useState, useEffect, useMemo } from 'react';
import api from '../../services/axiosConfig';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ruLocale from 'date-fns/locale/ru';
import styles from './styles/ActsList.module.css';
import { useAuth } from '../../context/AuthContext';

const ActsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Проверка доступа к данным
  const hasAccess = useMemo(() => {
    return user?.departments && user.departments.length > 0;
  }, [user?.departments]);

  // Тестовые данные для актов
  const testActs = [
    {
      id: 'АВР-2023-001',
      contractNumber: 'ДП-2023-001',
      contractDate: '15.01.2023',
      actNumber: 'АВР-2023-001',
      actDate: '20.12.2023',
      contractor: 'Иванов Иван Иванович',
      department: 'ОМА офис',
      startDate: '20.01.2023',
      endDate: '20.12.2023',
      amount: 150000,
      executor: 'Петрова А.С.',
      transferDate: '21.12.2023',
      galaxyEntryDate: '22.12.2023',
      okEmployee: 'Сидорова Г.М.',
      processed: true
    },
    {
      id: 'АВР-2023-002',
      contractNumber: 'ДП-2023-002',
      contractDate: '25.02.2023',
      actNumber: 'АВР-2023-002',
      actDate: '30.11.2023',
      contractor: 'Петров Петр Петрович',
      department: 'Минск Ванеева(11118)',
      startDate: '01.03.2023',
      endDate: '30.11.2023',
      amount: 275000,
      executor: 'Смирнова В.К.',
      transferDate: '01.12.2023',
      galaxyEntryDate: '03.12.2023',
      okEmployee: 'Кузнецова Л.Н.',
      processed: false
    }
  ];

  const [acts, setActs] = useState<any[]>(testActs);
  const [filteredActs, setFilteredActs] = useState<any[]>(testActs);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Состояния для фильтров
  const [contractNumberFilter, setContractNumberFilter] = useState('');
  const [actNumberFilter, setActNumberFilter] = useState('');
  const [contractorFilter, setContractorFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
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

  const contractTypes = ['Все'];

  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      setFilteredActs([]);
      return;
    }

    const fetchActs = async () => {
      try {
        const response = await api.get('/acts');
        // Фильтруем акты только по доступным пользователю департаментам
        const userDepartmentNames = user!.departments.map(dept => dept.name);
        const filteredData = response.data.filter((act: any) =>
          userDepartmentNames.includes(act.department)
        );

        setActs(filteredData);
        setFilteredActs(filteredData);
      } catch (error) {
        console.error('Error fetching acts:', error);
        // Используем тестовые данные, отфильтрованные по доступным СЕ
        const userDepartmentNames = user!.departments.map(dept => dept.name);
        const filteredTestData = testActs.filter(act =>
          userDepartmentNames.includes(act.department)
        );
        setActs(filteredTestData);
        setFilteredActs(filteredTestData);
      } finally {
        setLoading(false);
      }
    };

    fetchActs();
  }, [hasAccess, user]);

  useEffect(() => {
    if (!hasAccess) {
      setFilteredActs([]);
      return;
    }

    let result = [...acts];

    if (contractNumberFilter) {
      result = result.filter(a =>
        a.contractNumber.toLowerCase().includes(contractNumberFilter.toLowerCase())
      );
    }

    if (actNumberFilter) {
      result = result.filter(a =>
        a.actNumber.toLowerCase().includes(actNumberFilter.toLowerCase())
      );
    }

    if (contractorFilter) {
      result = result.filter(a =>
        a.contractor.toLowerCase().includes(contractorFilter.toLowerCase())
      );
    }

    if (departmentFilter && departmentFilter !== 'Все СЕ') {
      result = result.filter(a => a.department === departmentFilter);
    }

    if (contractTypeFilter && contractTypeFilter !== 'Все') {
      result = result.filter(a => a.contractType === contractTypeFilter);
    }

    if (startDateFilter) {
      result = result.filter(a => new Date(a.actDate) >= startDateFilter);
    }

    if (endDateFilter) {
      result = result.filter(a => new Date(a.actDate) <= endDateFilter);
    }

    if (showUnprocessed) {
      result = result.filter(a => !a.processed);
    }

    setFilteredActs(result);
    setPage(0);
  }, [
    acts,
    contractNumberFilter,
    actNumberFilter,
    contractorFilter,
    departmentFilter,
    contractTypeFilter,
    startDateFilter,
    endDateFilter,
    showUnprocessed,
    hasAccess
  ]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Обработчик для кнопки "Паспортные данные"
  const handlePassportDataClick = () => {
    navigate('/passport-data');
  };

  const exportToExcel = () => {
    console.log('Exporting to Excel...');
    // Логика экспорта в Excel
  };

  const copyAct = (actId: string) => {
    console.log('Copying act:', actId);
    // Логика копирования акта
  };

  // Если нет доступа к данным
  if (!hasAccess) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Журнал актов выполненных работ
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
            Вам не назначены структурные единицы. Для получения доступа к журналу актов
            выполненных работ обратитесь к администратору системы.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Журнал актов выполненных работ
      </Typography>

      {/* Блок фильтров */}
      <Paper className={styles.container} sx={{ width: '100%' }}>
        <Typography variant="h6" className={styles.filterHeader}>
          <FilterList sx={{ mr: 1 }} /> Фильтры
        </Typography>

        <Grid container spacing={2} className={styles.filterRow}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Договоры подряда</InputLabel>
              <Select
                value={contractTypeFilter}
                label="Договоры подряда"
                onChange={(e) => setContractTypeFilter(e.target.value)}
                className={styles.wideSelect}
              >
                {contractTypes.map((type, index) => (
                  <MenuItem key={index} value={type}>{type}</MenuItem>
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
                onChange={(e) => setDepartmentFilter(e.target.value)}
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
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
              <DatePicker
                label="Дата начала"
                value={startDateFilter}
                onChange={(newValue) => setStartDateFilter(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
              <DatePicker
                label="Дата окончания"
                value={endDateFilter}
                onChange={(newValue) => setEndDateFilter(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant={showUnprocessed ? "contained" : "outlined"}
              onClick={() => setShowUnprocessed(!showUnprocessed)}
              fullWidth
            >
              Необработанные акты
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

      {/* Две таблицы рядом */}
      <Box sx={{ display: 'flex', gap: '10px', mt: 2, width: '100%' }}>
        {/* Левая таблица - договоры (1/5 ширины) */}
        <Paper sx={{ width: '18%', minWidth: '18%' }}>
          <Table sx={{ width: '100%' }}>
            <TableHead>
              <TableRow sx={{
                backgroundColor: '#f5f5f5',
                borderBottom: '1px solid rgba(224, 224, 224, 1)'
              }}>
                <TableCell sx={{
                  fontWeight: 'bold',
                  padding: '16px',
                  borderRight: '1px solid rgba(224, 224, 224, 0.5)',
                  width: '50%'
                }}>
                  № договора
                </TableCell>
                <TableCell sx={{
                  fontWeight: 'bold',
                  padding: '16px',
                  width: '50%'
                }}>
                  Дата договора
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredActs.length > 0 ? (
                filteredActs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((act, index) => (
                    <TableRow
                      key={`contract-${index}`}
                      hover
                      sx={{
                        borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
                        backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'inherit'
                      }}
                    >
                      <TableCell sx={{
                        padding: '16px',
                        borderRight: '1px solid rgba(224, 224, 224, 0.5)',
                        width: '50%'
                      }}>
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            console.log('Contract number clicked:', act.contractNumber);
                          }}
                          sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          {act.contractNumber}
                        </Link>
                      </TableCell>
                      <TableCell sx={{
                        padding: '16px',
                        width: '50%'
                      }}>
                        {act.contractDate}
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ padding: '16px' }}>
                    Нет данных о договорах
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* Правая таблица - акты (4/5 ширины) */}
        <Paper sx={{ flex: 4, width: '100%', minWidth: '100%'}}>
          <Table className={styles.table}>
            <TableHead>
              <TableRow className={styles.tableHeadRow}>
                <TableCell className={styles.tableHeadCell}>№ акта</TableCell>
                <TableCell className={styles.tableHeadCell}>Дата акта</TableCell>
                <TableCell className={styles.tableHeadCell}>ФИО/Паспортные данные</TableCell>
                <TableCell className={styles.tableHeadCell}>Подразделение/ЦФО</TableCell>
                <TableCell className={styles.tableHeadCell}>Дата начала работ (услуг)</TableCell>
                <TableCell className={styles.tableHeadCell}>Дата окончания работ (услуг)</TableCell>
                <TableCell className={styles.tableHeadCell}>Сумма акта</TableCell>
                <TableCell className={styles.tableHeadCell}>Исполнитель</TableCell>
                <TableCell className={styles.tableHeadCell}>Дата передачи акта в ОТиЗ</TableCell>
                <TableCell className={styles.tableHeadCell}>Дата внесения в Галактику</TableCell>
                <TableCell className={styles.tableHeadCell}>Сотрудник ОТиЗ</TableCell>
                <TableCell className={styles.tableHeadCell}>Данные обработки</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredActs.length > 0 ? (
                filteredActs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((act, index) => (
                    <TableRow
                      key={`act-${index}`}
                      hover
                      className={`${styles.tableRow} ${index % 2 === 0 ? styles.evenRow : ''}`}
                    >
                      <TableCell className={styles.tableCell}>
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            console.log('Act number clicked:', act.actNumber);
                          }}
                          sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          {act.actNumber}
                        </Link>
                      </TableCell>
                      <TableCell className={styles.tableCell}>{act.actDate}</TableCell>
                      <TableCell className={styles.tableCell}>
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            console.log('Contractor clicked:', act.contractor);
                          }}
                          sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          {act.contractor}
                        </Link>
                      </TableCell>
                      <TableCell className={styles.tableCell}>{act.department}</TableCell>
                      <TableCell className={styles.tableCell}>{act.startDate}</TableCell>
                      <TableCell className={styles.tableCell}>{act.endDate}</TableCell>
                      <TableCell className={styles.tableCell}>{act.amount}</TableCell>
                      <TableCell className={styles.tableCell}>{act.executor}</TableCell>
                      <TableCell className={styles.tableCell}>{act.transferDate || '-'}</TableCell>
                      <TableCell className={styles.tableCell}>{act.galaxyEntryDate || '-'}</TableCell>
                      <TableCell className={styles.tableCell}>{act.okEmployee || '-'}</TableCell>
                      <TableCell className={styles.tableCell}>
                        <Checkbox checked={act.processed || false} disabled />
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    Нет данных об актах
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* Пагинация и кнопки */}
      <Box className={styles.paginationContainer} sx={{
        justifyContent: 'space-between',
        mt: 2,
        pl: 0,
        pr: 0,
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={() => console.log('Данные проверены')}
            sx={{ minWidth: 'auto' }}
          >
            Данные проверены
          </Button>

          <Button
            variant="contained"
            startIcon={<FileCopy />}
            onClick={() => console.log('Сделать копию акта')}
            sx={{
              minWidth: 'auto',
              ml: '20px'
            }}
          >
            Сделать копию акта
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
            {page + 1} из {Math.ceil(filteredActs.length / rowsPerPage)}
          </Typography>
          <IconButton
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(filteredActs.length / rowsPerPage) - 1}
          >
            <ChevronRight />
          </IconButton>
          <IconButton
            onClick={() => setPage(Math.ceil(filteredActs.length / rowsPerPage) - 1)}
            disabled={page >= Math.ceil(filteredActs.length / rowsPerPage) - 1}
          >
            <LastPage />
          </IconButton>
        </Box>

        <Button
          variant="contained"
          onClick={handlePassportDataClick}
          sx={{ minWidth: 'auto' }}
        >
          Паспортные данные
        </Button>
      </Box>
    </Box>
  );
};

export default ActsList;
