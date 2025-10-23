// src/components/Settings/UserManagement.tsx
import {Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button, Grid, FormControl,
        InputLabel, Select, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
        TablePagination, Tooltip, CircularProgress, Alert, Tab, Tabs } from '@mui/material';
import { Add, Edit, Delete, Search, Close } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { systemApi, identityApi } from '../../services/axiosConfig';
import UserSigning from './UserSigning';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  position: string;
  role: string;
  departments: Department[];
}

export interface Department {
  id: number;
  name: string;
  code: string;
  createdAt?: Date;
}

interface CreateUserRequest {
  lastName: string;
  firstName: string;
  middleName?: string;
  position?: string;
  email: string;
  role: string;
  departmentIds: number[];
  username: string;
  password?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-management-tabpanel-${index}`}
      aria-labelledby={`user-management-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const UserManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [accountingEmployees, setAccountingEmployees] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [openAddAccountingModal, setOpenAddAccountingModal] = useState(false);
  const [openEditAccountingModal, setOpenEditAccountingModal] = useState(false);
  const [selectedAccountingEmployee, setSelectedAccountingEmployee] = useState<User | null>(null);

  const [newAccountingEmployee, setNewAccountingEmployee] = useState<CreateUserRequest>({
    lastName: '',
    firstName: '',
    middleName: '',
    position: '',
    email: '',
    username: '',
    role: 'user',
    departmentIds: [],
    password: 'Temp123!'
  });

  const [accountingPage, setAccountingPage] = useState(0);
  const [accountingRowsPerPage, setAccountingRowsPerPage] = useState(5);
  const [accountingFilter, setAccountingFilter] = useState({
    department: '',
    role: '',
    search: ''
  });

  const roles = [
    { value: "admin", label: 'Администратор' },
    { value: "manager", label: "Менеджер" },
    { value: "user", label: "Пользователь" }
  ];

  const roleMapping = {
    'admin': 'Администратор',
    'manager': 'Менеджер',
    'user': 'Пользователь'
  };

  const TEMPORARY_PASSWORD = 'Temp123!';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const usersResponse = await systemApi.get('/api/UserManagement');
        const deptsResponse = await systemApi.get('/api/Department');

        setAccountingEmployees(usersResponse.data);
        setDepartments(deptsResponse.data);

      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getFilteredAccountingEmployees = () => {
    let filtered = accountingEmployees;

    if (accountingFilter.department) {
      filtered = filtered.filter(employee =>
        employee.departments?.some(dept => dept.name === accountingFilter.department)
      );
    }

    if (accountingFilter.role) {
      filtered = filtered.filter(employee => employee.role === accountingFilter.role);
    }

    if (accountingFilter.search) {
      const searchLower = accountingFilter.search.toLowerCase();
      filtered = filtered.filter(employee =>
        `${employee.lastName} ${employee.firstName} ${employee.middleName || ''}`
          .toLowerCase()
          .includes(searchLower)
      );
    }

    return filtered;
  };

  const getPaginatedAccountingEmployees = () => {
    const filteredEmployees = getFilteredAccountingEmployees();
    const startIndex = accountingPage * accountingRowsPerPage;
    const endIndex = startIndex + accountingRowsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  };

  const handleOpenEditAccountingModal = async (employee: User) => {
    try {
      const response = await systemApi.get(`/api/UserManagement/${employee.id}`);
      const userData = response.data;

      setSelectedAccountingEmployee({
        ...userData,
        departments: userData.departments || []
      });
      setOpenEditAccountingModal(true);
    } catch (err: any) {
      console.error('Ошибка загрузки данных:', err);
      if (err.response?.status === 404) {
        setSelectedAccountingEmployee({
          ...employee,
          departments: employee.departments || []
        });
        setOpenEditAccountingModal(true);
      } else {
        setError('Не удалось загрузить данные пользователя');
      }
    }
  };

  const handleCloseEditAccountingModal = () => {
    setOpenEditAccountingModal(false);
    setSelectedAccountingEmployee(null);
  };

  const handleCloseAddAccountingModal = () => {
    setOpenAddAccountingModal(false);
    setNewAccountingEmployee({
      lastName: '',
      firstName: '',
      middleName: '',
      position: '',
      email: '',
      username: '',
      role: 'user',
      departmentIds: [],
      password: TEMPORARY_PASSWORD
    });
  };

  const handleRoleChange = (role: string) => {
    setNewAccountingEmployee(prev => {
      let newDepartmentIds = [...prev.departmentIds];

      // Если выбрана роль admin или manager, добавляем все департаменты
      if ((role === 'admin' || role === 'manager') && departments.length > 0) {
        const allDepartmentIds = departments.map(dept => dept.id);
        allDepartmentIds.forEach(deptId => {
          if (!newDepartmentIds.includes(deptId)) {
            newDepartmentIds.push(deptId);
          }
        });
      }
      // Если выбрана роль user, оставляем только первый департамент
      else if (role === 'user') {
        if (departments.length > 0) {
          newDepartmentIds = [departments[0].id]; // Оставляем только первый департамент
        } else {
          newDepartmentIds = []; // Если нет департаментов, очищаем
        }
      }

      return {
        ...prev,
        role,
        departmentIds: newDepartmentIds
      };
    });
  };

  const handleAddAccountingEmployee = async () => {
    try {
      if (!newAccountingEmployee.lastName || !newAccountingEmployee.firstName || !newAccountingEmployee.email) {
        setError('Заполните обязательные поля: Фамилия, Имя, Email');
        return;
      }

      const username = newAccountingEmployee.username || newAccountingEmployee.email;

      const userData: CreateUserRequest = {
        lastName: newAccountingEmployee.lastName,
        firstName: newAccountingEmployee.firstName,
        middleName: newAccountingEmployee.middleName || undefined,
        position: newAccountingEmployee.position || undefined,
        email: newAccountingEmployee.email,
        username: username,
        role: newAccountingEmployee.role,
        departmentIds: newAccountingEmployee.departmentIds,
        password: TEMPORARY_PASSWORD
      };

      const identityResponse = await identityApi.post('/Account/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName,
        position: userData.position,
        role: userData.role
      });

      if (!identityResponse.data.userId) {
        throw new Error('Не удалось получить ID созданного пользователя');
      }

      const systemUserData = {
        identityUserId: identityResponse.data.userId,
        lastName: userData.lastName,
        firstName: userData.firstName,
        middleName: userData.middleName,
        position: userData.position,
        email: userData.email,
        role: userData.role,
        departmentIds: userData.departmentIds
      };

      await systemApi.post('/api/UserManagement', systemUserData);

      const newUser: User = {
        id: identityResponse.data.userId,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName || '',
        position: userData.position || '',
        role: userData.role,
        departments: departments.filter(dept => userData.departmentIds.includes(dept.id))
      };

      setAccountingEmployees(prev => [...prev, newUser]);
      setSuccess(`Сотрудник успешно добавлен. Временный пароль: ${TEMPORARY_PASSWORD}`);
      handleCloseAddAccountingModal();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error('Ошибка при добавлении:', err);
      setError(err.response?.data?.message || err.response?.data?.Message || 'Ошибка при добавлении пользователя');
    }
  };

  const handleEditAccountingEmployee = async () => {
    if (!selectedAccountingEmployee) return;

    try {
      const updateData = {
        lastName: selectedAccountingEmployee.lastName,
        firstName: selectedAccountingEmployee.firstName,
        middleName: selectedAccountingEmployee.middleName,
        position: selectedAccountingEmployee.position,
        email: selectedAccountingEmployee.email,
        role: selectedAccountingEmployee.role,
        departmentIds: selectedAccountingEmployee.departments
          .map(dept => dept.id)
          .filter(id => id !== undefined && id !== null)
      };

      const response = await systemApi.put(`/api/UserManagement/${selectedAccountingEmployee.id}`, updateData);

      setAccountingEmployees(prev =>
        prev.map(user =>
          user.id === selectedAccountingEmployee.id
            ? { ...selectedAccountingEmployee }
            : user
        )
      );

      setSuccess('Данные сотрудника успешно обновлены');
      handleCloseEditAccountingModal();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Ошибка при сохранении:', err);
      setError(err.response?.data?.message || 'Не удалось обновить данные пользователя');
    }
  };

  const handleDeleteAccountingEmployee = async () => {
    if (!userToDelete) return;

    try {
      await systemApi.delete(`/api/UserManagement/${userToDelete}`);
      setAccountingEmployees(prev => prev.filter(user => user.id !== userToDelete));
      setDeleteConfirmOpen(false);
      setSuccess('Сотрудник успешно удален');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Полная ошибка при удалении:', err);
      if (err.response?.status === 403) {
        setError('У вас нет прав для удаления пользователей');
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message || 'Нельзя удалить собственный аккаунт');
      } else if (err.response?.status === 404) {
        setError('Пользователь не найден');
      } else if (err.response?.status === 500) {
        setError('Ошибка сервера при удаления пользователя');
      } else {
        setError(err.response?.data?.message || 'Не удалось удалить пользователя');
      }
    }
  };

  const handleAccountingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAccountingEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (index: number, value: number) => {
    setNewAccountingEmployee(prev => {
      const newDepartmentIds = [...prev.departmentIds];
      if (index < newDepartmentIds.length) {
        newDepartmentIds[index] = value;
      }
      return { ...prev, departmentIds: newDepartmentIds };
    });
  };

  const handleRemoveDepartment = (index: number) => {
    setNewAccountingEmployee(prev => {
      const newDepartmentIds = [...prev.departmentIds];
      newDepartmentIds.splice(index, 1);
      return { ...prev, departmentIds: newDepartmentIds };
    });
  };

  const handleAddDepartment = () => {
    if (newAccountingEmployee.role === 'user' && departments.length > 0) {
      setNewAccountingEmployee(prev => ({
        ...prev,
        departmentIds: [...prev.departmentIds, departments[0].id]
      }));
    }
  };

  const handleEditDepartmentChange = (index: number, value: number) => {
    if (!selectedAccountingEmployee) return;

    const selectedDept = departments.find(dept => dept.id === value);
    if (!selectedDept) return;

    const newDepartments = [...selectedAccountingEmployee.departments];
    if (index < newDepartments.length) {
      newDepartments[index] = selectedDept;
    } else {
      newDepartments.push(selectedDept);
    }

    setSelectedAccountingEmployee({
      ...selectedAccountingEmployee,
      departments: newDepartments
    });
  };

  const handleEditRemoveDepartment = (index: number) => {
    if (!selectedAccountingEmployee) return;
    const newDepartments = [...selectedAccountingEmployee.departments];
    newDepartments.splice(index, 1);
    setSelectedAccountingEmployee({
      ...selectedAccountingEmployee,
      departments: newDepartments
    });
  };

  const handleEditAddDepartment = () => {
    if (!selectedAccountingEmployee) return;
    const firstDepartment = departments[0];
    if (firstDepartment) {
      setSelectedAccountingEmployee({
        ...selectedAccountingEmployee,
        departments: [...selectedAccountingEmployee.departments, firstDepartment]
      });
    }
  };

  useEffect(() => {
    setAccountingPage(0);
  }, [accountingFilter.department, accountingFilter.role, accountingFilter.search]);

  if (user?.role === 'user') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Доступ запрещен</Typography>
        <Typography>У вас нет прав для просмотра этой страницы</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Загрузка данных...</Typography>
      </Box>
    );
  }

  const filteredEmployees = getFilteredAccountingEmployees();
  const paginatedEmployees = getPaginatedAccountingEmployees();

  const canEdit = user?.role === 'admin';
  const canDelete = user?.role === 'admin';
  const canAdd = user?.role === 'admin';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="h4">Управление пользователями</Typography>

        {/* Стилизованные вкладки - без трансформации */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Paper
            elevation={2}
            sx={{
              display: 'flex',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              '& .MuiTab-root': {
                minWidth: 160,
                position: 'relative',
                fontWeight: 500,
                '&:first-of-type': {
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '1px',
                    height: '60%',
                    backgroundColor: 'divider',
                  }
                }
              }
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
              <Tab
                label="Учёт ДП/Акт"
                sx={{
                  fontWeight: activeTab === 0 ? 600 : 500,
                  backgroundColor: activeTab === 0 ? 'primary.main' : 'background.paper',
                  color: activeTab === 0 ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor: activeTab === 0 ? 'primary.dark' : 'action.hover',
                  },
                  borderRight: activeTab === 0 ? 'none' : '1px solid',
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    color: 'white',
                  },
                  '& .MuiTab-iconWrapper': {
                    color: activeTab === 0 ? 'white' : 'inherit',
                  }
                }}
              />
              <Tab
                label="Заключение ДП"
                sx={{
                  fontWeight: activeTab === 1 ? 600 : 500,
                  backgroundColor: activeTab === 1 ? 'primary.main' : 'background.paper',
                  color: activeTab === 1 ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor: activeTab === 1 ? 'primary.dark' : 'action.hover',
                  },
                  borderLeft: activeTab === 1 ? 'none' : '1px solid',
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    color: 'white',
                  },
                  '& .MuiTab-iconWrapper': {
                    color: activeTab === 1 ? 'white' : 'inherit',
                  }
                }}
              />
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

      {/* Контейнер для табличной части - без наложений */}
      <Box sx={{ position: 'relative' }}>
        <TabPanel value={activeTab} index={0}>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Управление сотрудниками по учёту ДП:</Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Структурная единица</InputLabel>
                  <Select
                    label="Структурная единица"
                    value={accountingFilter.department}
                    onChange={(e) => setAccountingFilter(prev => ({...prev, department: e.target.value}))}
                  >
                    <MenuItem value="">Все СЕ</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.name}>{dept.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Роль</InputLabel>
                  <Select
                    label="Роль"
                    value={accountingFilter.role}
                    onChange={(e) => setAccountingFilter(prev => ({...prev, role: e.target.value}))}
                  >
                    <MenuItem value="">Все</MenuItem>
                    {roles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Поиск по ФИО"
                  value={accountingFilter.search}
                  onChange={(e) => setAccountingFilter(prev => ({...prev, search: e.target.value}))}
                  InputProps={{
                    endAdornment: <Search color="action" />
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                {canAdd && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenAddAccountingModal(true)}
                    fullWidth
                  >
                    Добавить сотрудника
                  </Button>
                )}
              </Grid>
            </Grid>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ФИО</TableCell>
                  <TableCell>Должность</TableCell>
                  <TableCell>СЕ</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell>Роль</TableCell>
                  {canEdit && <TableCell align="right">Действия</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell>
                      {`${employee.lastName} ${employee.firstName} ${employee.middleName || ''}`.trim()}
                    </TableCell>
                    <TableCell>{employee.position || '-'}</TableCell>
                    <TableCell>
                      {employee.departments && employee.departments.length > 0
                        ? employee.departments.map(d => d.name).filter(Boolean).join('; ')
                        : '-'}
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{roleMapping[employee.role as keyof typeof roleMapping] || employee.role}</TableCell>
                    {canEdit && (
                      <TableCell align="right">
                        <Tooltip title="Редактировать">
                          <IconButton
                            onClick={() => handleOpenEditAccountingModal(employee)}
                          >
                            <Edit color="primary" />
                          </IconButton>
                        </Tooltip>
                        {canDelete && (
                          <Tooltip title="Удалить">
                            <IconButton
                              onClick={() => {
                                setUserToDelete(employee.id);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Delete color="error" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredEmployees.length}
              rowsPerPage={accountingRowsPerPage}
              page={accountingPage}
              onPageChange={(_, newPage) => setAccountingPage(newPage)}
              onRowsPerPageChange={(e) => {
                setAccountingRowsPerPage(parseInt(e.target.value, 10));
                setAccountingPage(0);
              }}
              labelRowsPerPage="Строк на странице:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
            />
          </Paper>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <UserSigning />
        </TabPanel>
      </Box>

      {/* Диалог подтверждения удаления */}
      {canDelete && (
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogContent>
            <Typography>Вы уверены, что хотите удалить этого пользователя?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Отмена</Button>
            <Button onClick={handleDeleteAccountingEmployee} color="error" variant="contained">
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Модальное окно добавления сотрудника - доступно только для admin */}
      {canAdd && (
        <Dialog
          open={openAddAccountingModal}
          onClose={handleCloseAddAccountingModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Добавление сотрудника ответственного за учёт ДП
            <IconButton
              aria-label="close"
              onClick={handleCloseAddAccountingModal}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Фамилия"
                  name="lastName"
                  value={newAccountingEmployee.lastName}
                  onChange={handleAccountingInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Имя"
                  name="firstName"
                  value={newAccountingEmployee.firstName}
                  onChange={handleAccountingInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Отчество"
                  name="middleName"
                  value={newAccountingEmployee.middleName}
                  onChange={handleAccountingInputChange}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Должность"
                  name="position"
                  value={newAccountingEmployee.position}
                  onChange={handleAccountingInputChange}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="E-mail"
                  name="email"
                  type="email"
                  value={newAccountingEmployee.email}
                  onChange={handleAccountingInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={newAccountingEmployee.username}
                  onChange={handleAccountingInputChange}
                  helperText="Если не указан, будет использован email"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Назначить роль</InputLabel>
                  <Select
                    label="Назначить роль"
                    value={newAccountingEmployee.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Структурные единицы
                  {(newAccountingEmployee.role === 'admin' || newAccountingEmployee.role === 'manager') && (
                    <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                      (Все СЕ добавлены автоматически)
                    </Typography>
                  )}
                </Typography>

                {newAccountingEmployee.departmentIds.map((deptId, index) => (
                  <Grid container spacing={1} key={index} alignItems="center" sx={{ mb: 1 }}>
                    <Grid size={{ xs: 10 }}>
                      <FormControl fullWidth>
                        <InputLabel>Структурная единица</InputLabel>
                        <Select
                          label="Структурная единица"
                          value={deptId}
                          onChange={(e) => handleDepartmentChange(index, Number(e.target.value))}
                          disabled={newAccountingEmployee.role === 'admin' || newAccountingEmployee.role === 'manager'}
                        >
                          {departments.map((department) => (
                            <MenuItem key={department.id} value={department.id}>
                              {department.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 2 }}>
                      <IconButton
                        onClick={() => handleRemoveDepartment(index)}
                        color="error"
                        disabled={newAccountingEmployee.departmentIds.length === 1}
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}

                {newAccountingEmployee.role === 'user' && (
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleAddDepartment}
                    sx={{ mt: 1 }}
                  >
                    ДОБАВИТЬ СЕ
                  </Button>
                )}

                {(newAccountingEmployee.role === 'admin' || newAccountingEmployee.role === 'manager') && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Все структурные единицы добавлены автоматически. Вы можете удалить ненужные, оставив минимум одну.
                  </Typography>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddAccountingModal}>ОТМЕНА</Button>
            <Button
              variant="contained"
              onClick={handleAddAccountingEmployee}
              disabled={!newAccountingEmployee.lastName || !newAccountingEmployee.firstName || !newAccountingEmployee.email}
            >
              ДОБАВИТЬ СОТРУДНИКА
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Модальное окно редактирования сотрудника */}
      {canEdit && (
        <Dialog
          open={openEditAccountingModal}
          onClose={handleCloseEditAccountingModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Редактирование данных сотрудника
            <IconButton
              aria-label="close"
              onClick={handleCloseEditAccountingModal}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {selectedAccountingEmployee && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Фамилия"
                    value={selectedAccountingEmployee.lastName}
                    onChange={(e) => setSelectedAccountingEmployee({
                      ...selectedAccountingEmployee,
                      lastName: e.target.value
                    })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Имя"
                    value={selectedAccountingEmployee.firstName}
                    onChange={(e) => setSelectedAccountingEmployee({
                      ...selectedAccountingEmployee,
                      firstName: e.target.value
                    })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Отчество"
                    value={selectedAccountingEmployee.middleName || ''}
                    onChange={(e) => setSelectedAccountingEmployee({
                      ...selectedAccountingEmployee,
                      middleName: e.target.value
                    })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Должность"
                    value={selectedAccountingEmployee.position || ''}
                    onChange={(e) => setSelectedAccountingEmployee({
                      ...selectedAccountingEmployee,
                      position: e.target.value
                    })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="E-mail"
                    value={selectedAccountingEmployee.email}
                    onChange={(e) => setSelectedAccountingEmployee({
                      ...selectedAccountingEmployee,
                      email: e.target.value
                    })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Назначить роль</InputLabel>
                    <Select
                      label="Назначить роль"
                      value={selectedAccountingEmployee.role}
                      onChange={(e) => setSelectedAccountingEmployee({
                        ...selectedAccountingEmployee,
                        role: e.target.value
                      })}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Структурные единицы
                  </Typography>
                  {selectedAccountingEmployee.departments.map((dept, index) => (
                    <Grid container spacing={1} key={index} alignItems="center" sx={{ mb: 1 }}>
                      <Grid size={{ xs: 10 }}>
                        <FormControl fullWidth>
                          <InputLabel>Структурная единица</InputLabel>
                          <Select
                            label="Структурная единица"
                            value={dept.id || ''}
                            onChange={(e) => handleEditDepartmentChange(index, Number(e.target.value))}
                          >
                            {departments.map((department) => (
                              <MenuItem key={department.id} value={department.id}>
                                {department.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 2 }}>
                        <IconButton
                          onClick={() => handleEditRemoveDepartment(index)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleEditAddDepartment}
                    sx={{ mt: 1 }}
                  >
                    ДОБАВИТЬ СЕ
                  </Button>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditAccountingModal}>ОТМЕНА</Button>
            <Button variant="contained" onClick={handleEditAccountingEmployee}>
              Сохранить данные
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default UserManagement;