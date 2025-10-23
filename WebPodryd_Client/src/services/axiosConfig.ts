// src/services/axiosConfig.ts
import axios from 'axios';

// System API - для департаментов и пользователей
export const systemApi = axios.create({
  baseURL: 'http://localhost:29565',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Identity API - для аутентификации
export const identityApi = axios.create({
  baseURL: 'https://localhost:44350',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Main API - для основных данных (договоры, шаблоны и т.д.)
export const mainApi = axios.create({
  baseURL: 'http://localhost:29565', // ваш основной API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Функция для настройки интерцепторов
const setupApiInterceptors = (instance: any) => {
  // Request interceptor
  instance.interceptors.request.use(
    (config: any) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            break;
          case 403:
            error.message = 'Доступ запрещен';
            break;
          case 404:
            error.message = 'Ресурс не найден';
            break;
          case 500:
            error.message = 'Ошибка сервера';
            break;
          default:
            error.message = error.response.data?.message || 'Произошла ошибка';
        }
      } else if (error.request) {
        error.message = 'Нет ответа от сервера';
      } else {
        error.message = 'Ошибка при настройке запроса';
      }

      return Promise.reject(error);
    }
  );
};

// Применяем интерцепторы ко всем API instances
setupApiInterceptors(systemApi);
setupApiInterceptors(identityApi);
setupApiInterceptors(mainApi);

// Для обратной совместимости
const api = mainApi;
export default api;