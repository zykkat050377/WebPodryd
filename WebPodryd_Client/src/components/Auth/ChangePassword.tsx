// src/components/Auth/ChangePassword.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { changePassword } from '../../services/AuthService';
import { useAuth } from '../../context/AuthContext';
import { sha256 } from 'js-sha256';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const validatePassword = (password: string): string[] => {
    const errors = [];
    if (password.length < 8) errors.push('Пароль должен содержать минимум 8 символов');
    if (!/(?=.*[a-z])/.test(password)) errors.push('Пароль должен содержать строчные буквы');
    if (!/(?=.*[A-Z])/.test(password)) errors.push('Пароль должен содержать заглавные буквы');
    if (!/(?=.*\d)/.test(password)) errors.push('Пароль должен содержать цифры');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(', '));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Новые пароли не совпадают');
      return;
    }

    if (oldPassword === newPassword) {
      setError('Новый пароль должен отличаться от старого');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await changePassword(oldPassword, newPassword, confirmPassword);

      // Обновляем состояние аутентификации
      if (user) {
        const updatedUser = {
          ...user,
          mustChangePassword: false
        };

        // Обновляем контекст и localStorage
        login(result.token || user.token, updatedUser);
      }

      setSuccess(true);

      // Перенаправляем на главную страницу через 2 секунды
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    } catch (error: any) {
      console.error('Ошибка смены пароля:', error);
      setError(error.message || 'Ошибка при смене пароля');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      bgcolor: '#f5f5f5',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Paper sx={{
        p: 4,
        width: 400,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
          Смена пароля
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Это ваш первый вход в систему. Пожалуйста, установите новый пароль.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Пароль успешно изменен! Перенаправляем на главную страницу...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Текущий пароль"
            type="password"
            margin="normal"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            disabled={isLoading || success}
            autoComplete="current-password"
          />
          <TextField
            fullWidth
            label="Новый пароль"
            type="password"
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isLoading || success}
            autoComplete="new-password"
            helperText="Минимум 8 символов, заглавные и строчные буквы, цифры"
          />
          <TextField
            fullWidth
            label="Повторите новый пароль"
            type="password"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading || success}
            autoComplete="new-password"
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            type="submit"
            disabled={isLoading || success}
            endIcon={isLoading ? <CircularProgress size={24} /> : null}
          >
            {isLoading ? 'Смена пароля...' : 'Сменить пароль'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ChangePassword;