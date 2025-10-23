// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { systemApi } from '../services/axiosConfig';

export interface Department {
  id: number;
  name: string;
  code: string;
  createdAt?: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
  token: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  position?: string;
  departments?: Department[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const login = useCallback((token: string, userData: any) => {
    console.log('Login data received:', userData); // Для отладки

    // Приводим данные к единому формату (обрабатываем разные варианты имен полей)
    const user: User = {
      id: userData.id || userData.userId,
      username: userData.username || userData.userName, // Обрабатываем userName vs username
      email: userData.email,
      role: userData.role,
      mustChangePassword: userData.mustChangePassword ?? false,
      token,
      firstName: userData.firstName,
      lastName: userData.lastName,
      middleName: userData.middleName,
      position: userData.position,
      departments: userData.departments || []
    };

    console.log('Processed user data for storage:', user); // Для отладки

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setIsAuthenticated(true);

    if (user.mustChangePassword) {
      navigate('/change-password', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  // Улучшенная функция для загрузки полных данных пользователя
  const loadFullUserData = useCallback(async (token: string, currentUser: User) => {
    try {
      // Получаем всех пользователей из системы
      const usersResponse = await systemApi.get('/api/UserManagement');
      const allUsers = usersResponse.data;

      // Находим полные данные текущего пользователя по username или email
      const systemUser = allUsers.find((u: any) =>
        u.username === currentUser.username ||
        u.email === currentUser.email ||
        u.userName === currentUser.username // Дополнительная проверка
      );

      if (systemUser) {
        const fullUserData: User = {
          id: systemUser.id || currentUser.id,
          username: systemUser.username || systemUser.userName || currentUser.username,
          email: systemUser.email || currentUser.email,
          role: systemUser.role || currentUser.role,
          mustChangePassword: currentUser.mustChangePassword,
          token,
          firstName: systemUser.firstName || currentUser.firstName,
          lastName: systemUser.lastName || currentUser.lastName,
          middleName: systemUser.middleName || currentUser.middleName,
          position: systemUser.position || currentUser.position,
          departments: systemUser.departments || currentUser.departments || []
        };

        console.log('Updated user data with full profile:', fullUserData);
        setUser(fullUserData);
        localStorage.setItem('user', JSON.stringify(fullUserData));
      } else {
        console.warn('Пользователь не найден в системе управления, используем базовые данные');
      }
    } catch (error) {
      console.warn('Не удалось загрузить полные данные пользователя:', error);
      // Продолжаем использовать существующие данные пользователя
    }
  }, []);

  // Улучшенная функция загрузки данных пользователя из localStorage
  const loadUserFromStorage = useCallback(async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        // Парсим JSON из localStorage с обработкой ошибок
        let user;
        try {
          user = JSON.parse(userData);
        } catch (parseError) {
          console.error('Невалидный JSON в localStorage:', parseError);
          logout();
          return;
        }

        // УСОВЕРШЕНСТВОВАННАЯ ПРОВЕРКА: учитываем разные варианты данных
        const hasRequiredFields = (
          user.id &&
          (user.username || user.userName) && // Проверяем оба варианта
          user.token &&
          user.role !== undefined
        );

        if (!hasRequiredFields) {
          console.error('Неполные данные пользователя в localStorage:', user);
          console.log('Токен в localStorage:', token);
          logout();
          return;
        }

        // Нормализуем данные пользователя (приводим к единому формату)
        const normalizedUser: User = {
          id: user.id,
          username: user.username || user.userName, // Унифицируем поле username
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword ?? false,
          token: user.token,
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName,
          position: user.position,
          departments: user.departments || []
        };

        console.log('Normalized user data from storage:', normalizedUser);

        setUser(normalizedUser);
        setIsAuthenticated(true);

        // Загружаем актуальные данные пользователя в фоне
        loadFullUserData(token, normalizedUser);

      } catch (e) {
        console.error('Не удалось загрузить данные пользователя из localStorage:', e);
        logout();
      }
    } else {
      console.log('No auth data in storage - token:', !!token, 'userData:', !!userData);
    }
  }, [logout, loadFullUserData]);

  // Загружаем пользователя при монтировании
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};