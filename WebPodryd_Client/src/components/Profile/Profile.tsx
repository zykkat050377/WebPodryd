// src/components/Profile/Profile.tsx
import { Box, Typography, Avatar, Paper, Button, Chip, Divider, Alert } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Функция для получения полного имени пользователя
const getFullName = (user: any): string => {
  if (!user) return 'Не указано';

  const lastName = user.lastName || '';
  const firstName = user.firstName || '';
  const middleName = user.middleName || '';

  const fullName = `${lastName} ${firstName} ${middleName}`.trim();
  return fullName || user.username || 'Не указано';
};

// Функция для получения инициалов
const getInitials = (user: any): string => {
  if (!user) return '';

  const lastName = user.lastName || '';
  const firstName = user.firstName || '';
  const middleName = user.middleName || '';

  const initials = `${firstName.charAt(0)}${middleName ? middleName.charAt(0) : ''}`;
  return initials || user.username?.charAt(0) || '';
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Загрузка данных пользователя...</Typography>
      </Box>
    );
  }

  const fullName = getFullName(user);
  const initials = getInitials(user);

  // Маппинг ролей для отображения
  const roleMapping: { [key: string]: string } = {
    'admin': 'Администратор',
    'manager': 'Менеджер',
    'user': 'Пользователь'
  };

  const displayRole = roleMapping[user.role] || user.role;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Мой профиль</Typography>

      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
          <Avatar sx={{
            width: 80,
            height: 80,
            mr: 3,
            bgcolor: 'primary.main',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            {initials || user.username?.charAt(0) || '?'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5">{fullName}</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {user.position || 'Должность не указана'}
            </Typography>
            <Chip
              label={displayRole}
              color="primary"
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Контактная информация</Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Логин:</strong> {user.username || 'Не указан'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Email:</strong> {user.email || 'Не указан'}
            </Typography>
            {user.username && user.email && user.username !== user.email && (
              <Typography variant="body2" color="text.secondary">
                Логин и email отличаются
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Личная информация
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Фамилия:</strong> {user.lastName || 'Не указана'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Имя:</strong> {user.firstName || 'Не указано'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Отчество:</strong> {user.middleName || 'Не указано'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Структурные единицы ({user.departments?.length || 0})
          </Typography>
          {user.departments && user.departments.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pl: 1 }}>
              {user.departments.map((dept) => (
                <Chip
                  key={dept.id}
                  label={dept.name}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          ) : (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Структурные единицы не назначены. Обратитесь к администратору для получения доступа к данным.
            </Alert>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Системная информация
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>ID пользователя:</strong> {user.id}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Роль в системе:</strong> {displayRole}
            </Typography>
            <Typography variant="body1">
              <strong>Статус пароля:</strong>
              {user.mustChangePassword ? (
                <Chip label="Требуется смена" color="warning" size="small" sx={{ ml: 1 }} />
              ) : (
                <Chip label="Установлен" color="success" size="small" sx={{ ml: 1 }} />
              )}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<ExitToAppIcon />}
            onClick={handleLogout}
          >
            Выход
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;