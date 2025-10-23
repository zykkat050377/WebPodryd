// src/components/Navbar/SettingsMenu.tsx
import { useState, useEffect } from 'react';
import { ListItemButton, ListItemIcon, ListItemText, Collapse, List, MenuItem, Menu, Tooltip, Badge, Box, Typography } from '@mui/material';
import { ExpandLess, ExpandMore, Settings, PersonAdd, Article, Assignment, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SettingsMenuProps {
  collapsed: boolean;
}

// Моковые данные для демонстрации (в реальном приложении загружайте с API)
const mockActSettingsStats = {
  servicesWithoutCost: 5, // Услуги без стоимости
  expiredTemplates: 2,    // Просроченные шаблоны
  totalIssues: 7          // Всего проблем
};

const SettingsMenu = ({ collapsed }: SettingsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [actSettingsStats, setActSettingsStats] = useState(mockActSettingsStats);
  const navigate = useNavigate();
  const { user } = useAuth();

  // В реальном приложении загружайте данные с API
  useEffect(() => {
    // TODO: Заменить на реальный API вызов
    const fetchActSettingsStats = async () => {
      try {
        // const response = await api.get('/api/act-settings/stats');
        // setActSettingsStats(response.data);
        setActSettingsStats(mockActSettingsStats);
      } catch (error) {
        console.error('Ошибка загрузки статистики актов:', error);
      }
    };

    if (user?.role === 'manager' || user?.role === 'admin') {
      fetchActSettingsStats();
    }
  }, [user]);

  const settingsItems = [
    {
      text: 'Добавить пользователя',
      icon: <PersonAdd fontSize="small" />,
      action: () => navigate('/user-management'),
      requiredRoles: ['admin', 'manager'],
      badgeCount: 0
    },
    {
      text: 'Настроить договор',
      icon: <Article fontSize="small" />,
      action: () => navigate('/contract-settings'),
      requiredRoles: ['manager'],
      badgeCount: 0
    },
    {
      text: 'Настроить акт',
      icon: <Assignment fontSize="small" />,
      action: () => navigate('/act-settings'),
      requiredRoles: ['manager'],
      badgeCount: actSettingsStats.totalIssues,
      badgeColor: 'warning' as const
    }
  ];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (collapsed) {
      setAnchorEl(event.currentTarget);
    } else {
      setOpen(!open);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Функция проверки прав доступа
  const hasPermission = (requiredRoles: string[]) => {
    if (!user?.role) return false;
    return requiredRoles.includes(user.role);
  };

  // Функция для отображения бейджа
  const renderBadge = (count: number, color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default') => {
    if (count === 0) return null;

    return (
      <Badge
        badgeContent={count}
        color={color}
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '0.6rem',
            height: 16,
            minWidth: 16,
            transform: 'scale(1) translate(50%, -50%)',
          }
        }}
      />
    );
  };

  // Функция для отображения текста с бейджем
  const renderItemText = (text: string, badgeCount: number, badgeColor?: 'warning') => {
    if (collapsed) return text;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Typography variant="body2" component="span">
          {text}
        </Typography>
        {badgeCount > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {badgeColor === 'warning' && <Warning color="warning" sx={{ fontSize: 16 }} />}
            <Badge
              badgeContent={badgeCount}
              color={badgeColor || 'default'}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.6rem',
                  height: 16,
                  minWidth: 16,
                }
              }}
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      <Tooltip
        title={
          collapsed ?
            `Настройки${actSettingsStats.totalIssues > 0 ? ` (${actSettingsStats.totalIssues} проблем)` : ''}` :
            ""
        }
        placement="right"
      >
        <ListItemButton onClick={handleClick}>
          <ListItemIcon sx={{
            minWidth: 0,
            mr: collapsed ? 0 : 2,
            justifyContent: 'center'
          }}>
            {actSettingsStats.totalIssues > 0 ? (
              <Badge
                badgeContent={actSettingsStats.totalIssues}
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
                <Settings fontSize="small" />
              </Badge>
            ) : (
              <Settings fontSize="small" />
            )}
          </ListItemIcon>
          {!collapsed && (
            <>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>Настройки</span>
                    {actSettingsStats.totalIssues > 0 && (
                      <Badge
                        badgeContent={actSettingsStats.totalIssues}
                        color="warning"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.6rem',
                            height: 16,
                            minWidth: 16,
                          }
                        }}
                      />
                    )}
                  </Box>
                }
              />
              {open ? <ExpandLess /> : <ExpandMore />}
            </>
          )}
        </ListItemButton>
      </Tooltip>

      {collapsed ? (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            style: {
              minWidth: 200,
            },
          }}
        >
          {settingsItems.map((item, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                if (hasPermission(item.requiredRoles)) {
                  item.action();
                }
              }}
              disabled={!hasPermission(item.requiredRoles)}
            >
              <ListItemIcon>
                {item.badgeCount > 0 ? (
                  <Badge
                    badgeContent={item.badgeCount}
                    color={item.badgeColor || 'default'}
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.6rem',
                        height: 16,
                        minWidth: 16,
                      }
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Typography variant="body2">
                  {item.text}
                </Typography>
                {item.badgeCount > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                    {item.badgeColor === 'warning' && <Warning color="warning" sx={{ fontSize: 16 }} />}
                    <Badge
                      badgeContent={item.badgeCount}
                      color={item.badgeColor || 'default'}
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.6rem',
                          height: 16,
                          minWidth: 16,
                        }
                      }}
                    />
                  </Box>
                )}
              </Box>
            </MenuItem>
          ))}
        </Menu>
      ) : (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{
            bgcolor: 'rgba(0,0,0,0.1)',
            '& .MuiListItemButton-root': {
              pl: 6
            }
          }}>
            {settingsItems.map((item, index) => (
              <ListItemButton
                key={index}
                onClick={() => {
                  if (hasPermission(item.requiredRoles)) {
                    item.action();
                  }
                }}
                disabled={!hasPermission(item.requiredRoles)}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {item.badgeCount > 0 ? (
                    <Badge
                      badgeContent={item.badgeCount}
                      color={item.badgeColor || 'default'}
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.6rem',
                          height: 16,
                          minWidth: 16,
                        }
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={renderItemText(item.text, item.badgeCount, item.badgeColor)}
                  sx={{
                    opacity: hasPermission(item.requiredRoles) ? 1 : 0.5
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export default SettingsMenu;