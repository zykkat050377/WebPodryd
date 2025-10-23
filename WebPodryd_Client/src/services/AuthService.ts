// src/services/AuthService.ts
import { sha256 } from 'js-sha256';
import { identityApi, systemApi } from './axiosConfig';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    mustChangePassword: boolean;
  };
}

export const login = async (username: string, password: string) => {
  try {
    // 1. Логин в Identity API
    const loginResponse = await identityApi.post('/Account/login', {
      username,
      password
    }, {
      withCredentials: true
    });

    const { token, user: identityUser } = loginResponse.data;

    console.log('Login response:', identityUser); // ← Добавить для отладки

    if (!token) {
      throw new Error('Токен не получен');
    }

    // 2. Получаем полные данные пользователя из системы
    let fullUserData = identityUser;

    try {
      const usersResponse = await systemApi.get('/api/UserManagement');
      const allUsers = usersResponse.data;

      // Находим текущего пользователя по username или email
      const currentUser = allUsers.find((u: any) =>
        u.username === username || u.email === identityUser.email
      );

      if (currentUser) {
        fullUserData = {
          ...identityUser,
          ...currentUser,
          departments: currentUser.departments || []
        };
      }
    } catch (systemError) {
      console.warn('Не удалось загрузить полные данные пользователя:', systemError);
    }

    return {
      token,
      user: fullUserData
    };
  } catch (error: any) {
      console.error('Login error:', error);
    if (error.response?.status === 401) {
      throw new Error('Неверные учетные данные');
    }
    throw new Error(error.response?.data?.message || 'Ошибка сервера');
  }
};

// Функция для получения инициалов
export const getInitials = (user: any): string => {
  if (!user) return '';

  const lastName = user.lastName || '';
  const firstName = user.firstName || '';
  const middleName = user.middleName || '';

  if (lastName && firstName) {
    return `${lastName} ${firstName.charAt(0)}.${middleName ? `${middleName.charAt(0)}.` : ''}`.trim();
  }

  return user.username || '';
};

// Функция для получения полного имени
export const getFullName = (user: any): string => {
  if (!user) return 'Не указано';

  const lastName = user.lastName || '';
  const firstName = user.firstName || '';
  const middleName = user.middleName || '';

  const fullName = `${lastName} ${firstName} ${middleName}`.trim();
  return fullName || 'Не указано';
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Требуется авторизация. Пожалуйста, войдите снова.');
    }

    const response = await identityApi.post('/Account/change-password', {
      oldPassword: oldPassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Ошибка смены пароля:', error);

    const errorMessage = error.response?.data?.message ||
                       error.response?.data?.Message ||
                       'Ошибка при смене пароля. Проверьте текущий пароль.';

    throw new Error(errorMessage);
  }
};