// src/components/Settings/UserSigning.tsx
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Button, Grid, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TablePagination, Tooltip, Alert, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, Search, Close } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { systemApi } from '../../services/axiosConfig';

interface SigningEmployee {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string;
  position: string;
  warrantNumber: string;
  startDate: string;
  endDate: string;
}

const UserSigning = () => {
  const { user } = useAuth();
  const [signingEmployees, setSigningEmployees] = useState<SigningEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [openAddSigningModal, setOpenAddSigningModal] = useState(false);
  const [openEditSigningModal, setOpenEditSigningModal] = useState(false);
  const [selectedSigningEmployee, setSelectedSigningEmployee] = useState<SigningEmployee | null>(null);

  const [newSigningEmployee, setNewSigningEmployee] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    position: '',
    warrantNumber: '',
    startDate: '',
    endDate: ''
  });

  const [signingPage, setSigningPage] = useState(0);
  const [signingRowsPerPage, setSigningRowsPerPage] = useState(5);
  const [signingFilter, setSigningFilter] = useState({
    search: ''
  });

  // Функция для форматирования даты в формат YYYY-MM-DD для input type="date"
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    return date.toISOString().split('T')[0]; // "2025-02-03"
  };

  // Загрузка данных с сервера
  const fetchSigningEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await systemApi.get('/api/SigningEmployee');
      setSigningEmployees(response.data);
    } catch (err: any) {
      console.error('Ошибка загрузки сотрудников:', err);
      setError('Не удалось загрузить список сотрудников');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSigningEmployees();
  }, []);

  const handleOpenAddSigningModal = () => setOpenAddSigningModal(true);
  const handleCloseAddSigningModal = () => {
    setOpenAddSigningModal(false);
    setNewSigningEmployee({
      lastName: '',
      firstName: '',
      middleName: '',
      position: '',
      warrantNumber: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleOpenEditSigningModal = (employee: SigningEmployee) => {
    setSelectedSigningEmployee(employee);
    setOpenEditSigningModal(true);
  };

  const handleCloseEditSigningModal = () => setOpenEditSigningModal(false);

  const handleAddSigningEmployee = async () => {
    try {
      setError(null);

      const employeeData = {
        lastName: newSigningEmployee.lastName,
        firstName: newSigningEmployee.firstName,
        middleName: newSigningEmployee.middleName,
        position: newSigningEmployee.position,
        warrantNumber: newSigningEmployee.warrantNumber,
        startDate: newSigningEmployee.startDate || null,
        endDate: newSigningEmployee.endDate || null
      };

      await systemApi.post('/api/SigningEmployee', employeeData);

      setSuccess('Сотрудник успешно добавлен');
      handleCloseAddSigningModal();
      fetchSigningEmployees(); // Обновляем список

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Ошибка добавления:', err);
      setError(err.response?.data?.message || err.response?.data || 'Ошибка при добавлении сотрудника');
    }
  };

  const handleEditSigningEmployee = async () => {
    if (!selectedSigningEmployee) return;

    try {
      setError(null);

      const employeeData = {
        lastName: selectedSigningEmployee.lastName,
        firstName: selectedSigningEmployee.firstName,
        middleName: selectedSigningEmployee.middleName,
        position: selectedSigningEmployee.position,
        warrantNumber: selectedSigningEmployee.warrantNumber,
        startDate: selectedSigningEmployee.startDate || null,
        endDate: selectedSigningEmployee.endDate || null
      };

      await systemApi.put(`/api/SigningEmployee/${selectedSigningEmployee.id}`, employeeData);

      setSuccess('Данные сотрудника успешно обновлены');
      handleCloseEditSigningModal();
      fetchSigningEmployees(); // Обновляем список

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Ошибка обновления:', err);
      setError(err.response?.data?.message || err.response?.data || 'Ошибка при обновлении данных сотрудника');
    }
  };

  const handleDeleteSigningEmployee = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      return;
    }

    try {
      setError(null);
      await systemApi.delete(`/api/SigningEmployee/${id}`);

      setSuccess('Сотрудник успешно удален');
      fetchSigningEmployees(); // Обновляем список

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Ошибка удаления:', err);
      setError(err.response?.data?.message || err.response?.data || 'Ошибка при удалении сотрудника');
    }
  };

  const handleSigningInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSigningEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSigningChangePage = (event: unknown, newPage: number) => {
    setSigningPage(newPage);
  };

  const handleSigningChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSigningRowsPerPage(parseInt(event.target.value, 10));
    setSigningPage(0);
  };

  const handleSigningFilterChange = (value: string) => {
    setSigningFilter({ search: value });
    setSigningPage(0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const getFullName = (employee: SigningEmployee) => {
    return `${employee.lastName} ${employee.firstName} ${employee.middleName || ''}`.trim();
  };

  const filteredSigningEmployees = signingEmployees.filter(employee => {
    const fullName = getFullName(employee).toLowerCase();
    return signingFilter.search === '' ||
      fullName.includes(signingFilter.search.toLowerCase()) ||
      employee.position.toLowerCase().includes(signingFilter.search.toLowerCase());
  });

  const signingEmployeesToShow = filteredSigningEmployees.slice(
    signingPage * signingRowsPerPage,
    signingPage * signingRowsPerPage + signingRowsPerPage
  );

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Загрузка данных...</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Управление сотрудниками с правом заключения ДП:</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAddSigningModal}
        >
          Добавить сотрудника
        </Button>
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

      {/* Исправленный Grid с новой версией MUI */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 8, md: 4 }}>
          <TextField
            fullWidth
            label="Поиск по ФИО или должности"
            value={signingFilter.search}
            onChange={(e) => handleSigningFilterChange(e.target.value)}
            slotProps={{
              input: {
                endAdornment: <Search color="action" />
              }
            }}
            sx={{
              minWidth: 300,
              '& .MuiInputBase-root': {
                pr: 1
              }
            }}
          />
        </Grid>
      </Grid>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ФИО</TableCell>
            <TableCell>Должность</TableCell>
            <TableCell>№ доверенности</TableCell>
            <TableCell>Дата начала</TableCell>
            <TableCell>Дата окончания</TableCell>
            <TableCell align="right">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {signingEmployeesToShow.length > 0 ? (
            signingEmployeesToShow.map((employee) => (
              <TableRow
                key={employee.id}
                hover
              >
                <TableCell>{getFullName(employee)}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.warrantNumber || '-'}</TableCell>
                <TableCell>{formatDate(employee.startDate)}</TableCell>
                <TableCell>{formatDate(employee.endDate)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Редактировать">
                    <IconButton
                      onClick={() => handleOpenEditSigningModal(employee)}
                    >
                      <Edit color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton
                      onClick={() => handleDeleteSigningEmployee(employee.id)}
                    >
                      <Delete color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                {signingEmployees.length === 0 ? 'Нет данных о сотрудниках' : 'Ничего не найдено'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredSigningEmployees.length}
        rowsPerPage={signingRowsPerPage}
        page={signingPage}
        onPageChange={handleSigningChangePage}
        onRowsPerPageChange={handleSigningChangeRowsPerPage}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
      />

      {/* Модальное окно добавления */}
      <Dialog
        open={openAddSigningModal}
        onClose={handleCloseAddSigningModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Добавление сотрудника с правом подписи
          <IconButton
            aria-label="close"
            onClick={handleCloseAddSigningModal}
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
                value={newSigningEmployee.lastName}
                onChange={handleSigningInputChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Имя"
                name="firstName"
                value={newSigningEmployee.firstName}
                onChange={handleSigningInputChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Отчество"
                name="middleName"
                value={newSigningEmployee.middleName}
                onChange={handleSigningInputChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Должность"
                name="position"
                value={newSigningEmployee.position}
                onChange={handleSigningInputChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="№ доверенности"
                name="warrantNumber"
                value={newSigningEmployee.warrantNumber}
                onChange={handleSigningInputChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Дата начала"
                name="startDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newSigningEmployee.startDate}
                onChange={handleSigningInputChange}
                slotProps={{
                  input: {
                    // Убеждаемся, что значение в правильном формате
                    value: formatDateForInput(newSigningEmployee.startDate)
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Дата окончания"
                name="endDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newSigningEmployee.endDate}
                onChange={handleSigningInputChange}
                slotProps={{
                  input: {
                    // Убеждаемся, что значение в правильном формате
                    value: formatDateForInput(newSigningEmployee.endDate)
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddSigningModal}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleAddSigningEmployee}
            disabled={!newSigningEmployee.lastName || !newSigningEmployee.firstName || !newSigningEmployee.position}
          >
            Добавить сотрудника
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно редактирования */}
      <Dialog
        open={openEditSigningModal}
        onClose={handleCloseEditSigningModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Редактирование данных сотрудника с правом подписи
          <IconButton
            aria-label="close"
            onClick={handleCloseEditSigningModal}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSigningEmployee && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Фамилия"
                  value={selectedSigningEmployee.lastName}
                  onChange={(e) => setSelectedSigningEmployee({
                    ...selectedSigningEmployee,
                    lastName: e.target.value
                  })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Имя"
                  value={selectedSigningEmployee.firstName}
                  onChange={(e) => setSelectedSigningEmployee({
                    ...selectedSigningEmployee,
                    firstName: e.target.value
                  })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Отчество"
                  value={selectedSigningEmployee.middleName}
                  onChange={(e) => setSelectedSigningEmployee({
                    ...selectedSigningEmployee,
                    middleName: e.target.value
                  })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Должность"
                  value={selectedSigningEmployee.position}
                  onChange={(e) => setSelectedSigningEmployee({
                    ...selectedSigningEmployee,
                    position: e.target.value
                  })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="№ доверенности"
                  value={selectedSigningEmployee.warrantNumber}
                  onChange={(e) => setSelectedSigningEmployee({
                    ...selectedSigningEmployee,
                    warrantNumber: e.target.value
                  })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  label="Дата начала"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formatDateForInput(selectedSigningEmployee.startDate)}
                  onChange={(e) => setSelectedSigningEmployee({
                    ...selectedSigningEmployee,
                    startDate: e.target.value
                  })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  label="Дата окончания"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formatDateForInput(selectedSigningEmployee.endDate)}
                  onChange={(e) => setSelectedSigningEmployee({
                    ...selectedSigningEmployee,
                    endDate: e.target.value
                  })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditSigningModal}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleEditSigningEmployee}
            disabled={!selectedSigningEmployee?.lastName || !selectedSigningEmployee?.firstName || !selectedSigningEmployee?.position}
          >
            Сохранить данные
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserSigning;