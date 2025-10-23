// src/components/Auth/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { login } from '../../services/AuthService';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    const { token, user } = await login(username, password);

    // Сохраняем данные аутентификации
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    // Обновляем контекст аутентификации
    authLogin(token, user);

    // Перенаправляем пользователя
    navigate(user.mustChangePassword ? '/change-password' : '/dashboard');
  } catch (error: any) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f5f5f5' }}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Аутентификация
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Логин"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Пароль"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
            При первом входе в систему обязательно рекомендуется изменить пароль!
          </Typography>
          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 2 }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Вход'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;