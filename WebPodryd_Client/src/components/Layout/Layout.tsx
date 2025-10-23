// src/components/Layout/Layout.tsx
import { Box } from '@mui/material';
import Navbar from './Navbar';
import { useLayoutContext } from '../../context/LayoutContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { collapsed } = useLayoutContext();
  const navigate = useNavigate();

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;
    const sessionTimeoutMinutes = 60; // Полное время сессии
    const warningTimeMinutes = 5; // За сколько минут предупредить

    const resetTimers = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      inactivityTimer = setTimeout(logout, sessionTimeoutMinutes * 60 * 1000);
      warningTimer = setTimeout(showWarning,
        (sessionTimeoutMinutes - warningTimeMinutes) * 60 * 1000);
    };

    const showWarning = () => {
      // Можно заменить на модальное окно MUI
      if (window.confirm('Ваша сессия скоро завершится. Продолжить работу?')) {
        resetTimers();
      } else {
        logout();
      }
    };

    const logout = () => {
      // Здесь можно добавить вызов API для выхода, если нужно
      navigate('/Identity/Account/Login?timeout=1');
    };

    // События, сбрасывающие таймер
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimers);
    });

    // Инициализация таймеров
    resetTimers();

    // Очистка
    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimers);
      });
    };
  }, [navigate]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pl: 2,
          ml: '24px',
          width: `calc(100% - ${collapsed ? 96 : 324}px)`,
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
