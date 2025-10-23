// src/components/Layout/Navbar.tsx
import { useCallback, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  useTheme, Box, Typography, IconButton, Tooltip, Collapse, Badge
} from '@mui/material';
import {
  ExitToApp, Description, PostAdd, Note, Person, Menu, MenuOpen, Warning
} from '@mui/icons-material';
import Logo from '../common/Logo';
import StructuralUnitMenu from '../Navbar/StructuralUnitMenu';
import SettingsMenu from '../Navbar/SettingsMenu';
import { useAuth } from '../../context/AuthContext';
import { ConfirmationDialog } from '../common/ConfirmationDialog';

const menuItems = [
  {
    text: 'Договоры',
    path: '/contracts',
    icon: <Description fontSize="small" />
  },
  {
    text: 'Акты',
    path: '/acts',
    icon: <Note fontSize="small" />
  },
  {
    text: 'Создать договор',
    path: '/create-contract',
    icon: <PostAdd fontSize="small" />
  },
  {
    text: 'Создать акт',
    path: '/create-act',
    icon: <PostAdd fontSize="small" />
  }
];

// Моковые данные для демонстрации (в реальном приложении загружайте с API)
const mockGlobalStats = {
  expiredWarrants: 3,     // Просроченные доверенности
  servicesWithoutCost: 5, // Услуги без стоимости
  totalIssues: 8          // Всего проблем
};

// Функция для получения инициалов пользователя
const getInitials = (user: any): string => {
  if (!user) return '';

  const lastName = user.lastName || '';
  const firstName = user.firstName || '';
  const middleName = user.middleName || '';

  if (lastName && firstName) {
    const firstInitial = firstName.charAt(0);
    const middleInitial = middleName ? `${middleName.charAt(0)}.` : '';
    return `${lastName} ${firstInitial}.${middleInitial}`.trim();
  }

  return user.username || '';
};

// Функция для получения полного имени пользователя
const getFullName = (user: any): string => {
  if (!user) return 'Не указано';

  const lastName = user.lastName || '';
  const firstName = user.firstName || '';
  const middleName = user.middleName || '';

  const fullName = `${lastName} ${firstName} ${middleName}`.trim();
  return fullName || user.username || 'Не указано';
};

// Функция для получения краткого отображения (фамилия + инициалы)
const getShortName = (user: any): string => {
  if (!user) return '';

  const lastName = user.lastName || '';
  const firstName = user.firstName || '';
  const middleName = user.middleName || '';

  if (lastName && firstName) {
    const firstInitial = firstName.charAt(0);
    const middleInitial = middleName ? `${middleName.charAt(0)}.` : '';
    return `${lastName} ${firstInitial}.${middleInitial}`.trim();
  }

  return user.username || '';
};

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [globalStats, setGlobalStats] = useState(mockGlobalStats);
  const { user, logout } = useAuth();

  // Состояние для диалога выхода
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  // В реальном приложении загружайте данные с API
  useEffect(() => {
    // TODO: Заменить на реальный API вызов
    const fetchGlobalStats = async () => {
      try {
        // const response = await api.get('/api/global/stats');
        // setGlobalStats(response.data);
        setGlobalStats(mockGlobalStats);
      } catch (error) {
        console.error('Ошибка загрузки глобальной статистики:', error);
      }
    };

    fetchGlobalStats();
  }, []);

  // Функция для открытия диалога
  const handleOpenLogoutDialog = () => {
    setOpenLogoutDialog(true);
  };

  // Функция подтверждения выхода
  const handleConfirmLogout = useCallback(() => {
    logout();
    navigate('/login');
    setOpenLogoutDialog(false);
  }, [logout, navigate]);

  // Функция отмены выхода
  const handleCancelLogout = () => {
    setOpenLogoutDialog(false);
  };

  // При загрузке проверяем сохраненное состояние
  useEffect(() => {
    const savedState = localStorage.getItem('navbarCollapsed');
    if (savedState) {
      setCollapsed(savedState === 'true');
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('navbarCollapsed', String(newState));
  }, [collapsed]);

  const isActive = (path: string) =>
    location.pathname === path ||
    location.pathname.startsWith(`${path}/`);

  // Маппинг ролей для отображения
  const roleMapping: { [key: string]: string } = {
    'admin': 'Администратор',
    'manager': 'Менеджер',
    'user': 'Пользователь'
  };

  const displayRole = user?.role ? roleMapping[user.role] || user.role : '';
  const shortName = getShortName(user);
  const fullName = getFullName(user);

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? 72 : 300,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: collapsed ? 72 : 300,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.primary.main,
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Заголовок с кнопкой сворачивания и глобальным индикатором */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          p: collapsed ? 1 : 2,
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          position: 'relative'
        }}>
          {!collapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Logo color="white" />
              {globalStats.totalIssues > 0 && (
                <Tooltip
                  title={
                    <Box>
                      <div>Проблемы в системе:</div>
                      <div>- {globalStats.expiredWarrants} просроченных доверенностей</div>
                      <div>- {globalStats.servicesWithoutCost} услуг без стоимости</div>
                    </Box>
                  }
                  placement="bottom"
                  arrow
                >
                  <Badge
                    badgeContent={globalStats.totalIssues}
                    color="warning"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.6rem',
                        height: 18,
                        minWidth: 18,
                        transform: 'scale(1) translate(50%, -50%)',
                      }
                    }}
                  >
                    <Warning sx={{ color: 'white', opacity: 0.8 }} />
                  </Badge>
                </Tooltip>
              )}
            </Box>
          )}

          <Tooltip
            title={collapsed ? "Развернуть меню" : "Свернуть меню"}
            placement="right"
            arrow
          >
            <IconButton
              onClick={toggleCollapse}
              sx={{
                color: 'white',
                position: collapsed ? 'relative' : 'absolute',
                right: 8,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s ease-in-out'
                }
              }}
            >
              {collapsed ? (
                <Menu fontSize="small" sx={{ color: 'white' }} />
              ) : (
                <MenuOpen fontSize="small" sx={{ color: 'white' }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        <List disablePadding sx={{
          '& .MuiListItemButton-root': {
            px: collapsed ? 1 : 2,
            py: 1,
            justifyContent: collapsed ? 'center' : 'flex-start',
            minHeight: 48,
          },
          flexGrow: 1,
          overflowY: 'auto',
        }}>
          {/* Выпадающий список структурных единиц */}
          <StructuralUnitMenu collapsed={collapsed} />

          {/* Основные пункты меню */}
          {menuItems.map(({ text, path, icon }) => (
            <Tooltip key={path} title={collapsed ? text : ''} placement="right">
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive(path)}
                  onClick={() => navigate(path)}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'rgba(255,255,255,0.15)',
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.08)',
                    }
                  }}
                >
                  <ListItemIcon sx={{
                    color: 'inherit',
                    minWidth: 0,
                    mr: collapsed ? 0 : 2,
                    justifyContent: 'center'
                  }}>
                    {icon}
                  </ListItemIcon>
                  <Collapse in={!collapsed} orientation="horizontal">
                    <ListItemText
                      primary={text}
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: { fontWeight: isActive(path) ? 600 : 400 }
                      }}
                    />
                  </Collapse>
                </ListItemButton>
              </ListItem>
            </Tooltip>
          ))}

          {/* Выпадающий список настроек с индикаторами */}
          <SettingsMenu collapsed={collapsed} />
        </List>

        {/* Фиксированный блок профиля и выхода */}
        <Box sx={{
          mt: 'auto',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          paddingTop: '10px',
          paddingBottom: '10px',
          backgroundColor: 'primary.dark'
        }}>
          {/* Информация о пользователе - всегда видна */}
          <Box sx={{
            px: collapsed ? 1 : 2,
            py: 1,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            minHeight: '48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            {collapsed ? (
              <Tooltip
                title={
                  <Box>
                    <div>{fullName}</div>
                    <div>Должность: {user?.position || 'Не указана'}</div>
                    <div>Роль: {displayRole}</div>
                    <div>Логин: {user?.username}</div>
                    {user?.departments && user.departments.length > 0 && (
                      <div>СЕ: {user.departments.length}</div>
                    )}
                    {globalStats.totalIssues > 0 && (
                      <div>Проблем: {globalStats.totalIssues}</div>
                    )}
                  </Box>
                }
                placement="right"
                arrow
              >
                <Box sx={{ textAlign: 'center' }}>
                  {globalStats.totalIssues > 0 ? (
                    <Badge
                      badgeContent={globalStats.totalIssues}
                      color="warning"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.6rem',
                          height: 16,
                          minWidth: 16,
                          transform: 'scale(1) translate(50%, -50%)',
                        }
                      }}
                    >
                      <Person fontSize="small" sx={{ color: 'white', opacity: 0.8 }} />
                    </Badge>
                  ) : (
                    <Person fontSize="small" sx={{ color: 'white', opacity: 0.8 }} />
                  )}
                </Box>
              </Tooltip>
            ) : (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'white',
                      opacity: 0.9,
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                      fontWeight: 'bold',
                    }}
                  >
                    {shortName || user?.username}
                  </Typography>
                  {globalStats.totalIssues > 0 && (
                    <Tooltip title={`${globalStats.totalIssues} проблем в системе`}>
                      <Badge
                        badgeContent={globalStats.totalIssues}
                        color="warning"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.6rem',
                            height: 16,
                            minWidth: 16,
                          }
                        }}
                      >
                        <Warning sx={{ fontSize: 14, color: 'warning.main' }} />
                      </Badge>
                    </Tooltip>
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'white',
                    opacity: 0.8,
                    display: 'block',
                    fontSize: '0.7rem',
                    lineHeight: 1.2
                  }}
                >
                  {user?.position || 'Должность не указана'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'white',
                    opacity: 0.7,
                    display: 'block',
                    fontSize: '0.65rem',
                    lineHeight: 1.2
                  }}
                >
                  {displayRole}
                </Typography>
                {user?.departments && user.departments.length > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'white',
                      opacity: 0.6,
                      display: 'block',
                      fontSize: '0.65rem',
                      lineHeight: 1.2,
                      mt: 0.5
                    }}
                  >
                    {user.departments.length} структурных единиц
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Кнопка профиля */}
          <Tooltip title={collapsed ? "Мой профиль" : ""} placement="right">
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate('/profile')}
                sx={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
              >
                <ListItemIcon sx={{
                  color: 'inherit',
                  minWidth: 0,
                  mr: collapsed ? 0 : 2,
                  justifyContent: 'center'
                }}>
                  <Person fontSize="small" />
                </ListItemIcon>
                <Collapse in={!collapsed} orientation="horizontal">
                  <ListItemText
                    primary="Мой профиль"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </Collapse>
              </ListItemButton>
            </ListItem>
          </Tooltip>

          {/* Кнопка выхода */}
          <Tooltip title={collapsed ? "Выход" : ''} placement="right">
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleOpenLogoutDialog}
                sx={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
              >
                <ListItemIcon sx={{
                  color: 'inherit',
                  minWidth: 0,
                  mr: collapsed ? 0 : 2,
                  justifyContent: 'center'
                }}>
                  <ExitToApp fontSize="small" />
                </ListItemIcon>
                <Collapse in={!collapsed} orientation="horizontal">
                  <ListItemText
                    primary="Выход"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </Collapse>
              </ListItemButton>
            </ListItem>
          </Tooltip>
        </Box>
      </Drawer>

      {/* Используем ваш кастомный диалог */}
      <ConfirmationDialog
        open={openLogoutDialog}
        title="Подтверждение выхода"
        message="Вы сохранили данные с которыми работали? Вы действительно хотите выйти из системы?"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </>
  );
};

export default Navbar;