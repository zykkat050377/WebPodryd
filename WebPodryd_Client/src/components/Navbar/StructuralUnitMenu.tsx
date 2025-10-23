// src/components/Navbar/StructuralUnitMenu.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  MenuItem,
  Menu,
  Tooltip,
  Typography,
  Box
} from '@mui/material';
import { AccountTree, ExpandLess, ExpandMore, Warning } from '@mui/icons-material';
import { useStructuralUnits } from '../../context/StructuralUnitsContext';

interface StructuralUnitMenuProps {
  collapsed: boolean;
}

const StructuralUnitMenu = ({ collapsed }: StructuralUnitMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { structuralUnits } = useStructuralUnits();

  const availableDepartments = useMemo(() => {
    if (structuralUnits.length === 0) {
      return [{ name: "Все СЕ", code: "" }];
    }

    return [{ name: "Все СЕ", code: "" }, ...structuralUnits];
  }, [structuralUnits]);

  const departmentsCount = availableDepartments.length - 1;

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

  const handleLocationSelect = (department: { name: string; code: string }) => {
    const selectedUnit = department.name === "Все СЕ" ? "" : department.name;
    navigate(`/contracts${selectedUnit ? `?unit=${encodeURIComponent(selectedUnit)}` : ''}`);
    handleClose();
  };

  const hasDepartments = structuralUnits.length > 0;

  const formatDepartmentDisplay = (department: { name: string; code: string }) => {
    if (department.name === "Все СЕ") {
      return department.name;
    }
    return `${department.name}${department.code ? ` (${department.code})` : ''}`;
  };

  return (
    <>
      <Tooltip
        title={collapsed ?
          (hasDepartments ? "Структурная единица" : "Нет доступных СЕ")
          : ""}
        placement="right"
      >
        <ListItemButton
          onClick={handleClick}
          disabled={!hasDepartments}
          sx={{
            opacity: hasDepartments ? 1 : 0.6,
            '&:hover': {
              backgroundColor: hasDepartments ? 'rgba(255,255,255,0.08)' : 'transparent'
            }
          }}
        >
          <ListItemIcon sx={{
            minWidth: 0,
            mr: collapsed ? 0 : 2,
            justifyContent: 'center'
          }}>
            {hasDepartments ? (
              <AccountTree fontSize="small" />
            ) : (
              <Warning fontSize="small" />
            )}
          </ListItemIcon>
          {!collapsed && (
            <>
              <ListItemText
                primary="Структурная единица"
                secondary={
                  hasDepartments ?
                    `${departmentsCount} СЕ` :
                    "Нет доступа"
                }
                primaryTypographyProps={{
                  variant: 'body2',
                  color: hasDepartments ? 'inherit' : 'text.disabled'
                }}
                secondaryTypographyProps={{
                  variant: 'caption',
                  color: hasDepartments ? 'rgba(255,255,255,0.7)' : 'error.main'
                }}
              />
              {hasDepartments && (open ? <ExpandLess /> : <ExpandMore />)}
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
              maxHeight: 400,
              width: 250,
            },
          }}
        >
          {hasDepartments ? (
            availableDepartments.map((department, index) => (
              <MenuItem
                key={index}
                onClick={() => handleLocationSelect(department)}
              >
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" noWrap>
                    {formatDepartmentDisplay(department)}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning fontSize="small" color="error" />
                <Typography variant="body2">
                  Нет доступных СЕ
                </Typography>
              </Box>
            </MenuItem>
          )}
        </Menu>
      ) : (
        <Collapse in={open && hasDepartments} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{
            bgcolor: 'rgba(0,0,0,0.1)',
            maxHeight: 300,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 3,
            }
          }}>
            {availableDepartments.map((department, index) => (
              <ListItemButton
                key={index}
                sx={{ pl: 6 }}
                onClick={() => handleLocationSelect(department)}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {department.name}
                      </Typography>
                      {department.code && (
                        <Typography
                          variant="body2"
                          color="rgba(255,255,255,0.7)"

                        >
                          ({department.code})
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      )}

      {!collapsed && !hasDepartments && open && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{
            bgcolor: 'rgba(0,0,0,0.1)',
          }}>
            <ListItemButton sx={{ pl: 6 }} disabled>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Warning fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Нет доступных структурных единиц"
                secondary="Обратитесь к администратору для получения доступа"
                primaryTypographyProps={{
                  variant: 'body2',
                  color: 'error.main',
                  fontSize: '0.875rem'
                }}
                secondaryTypographyProps={{
                  variant: 'caption',
                  color: 'error.light'
                }}
              />
            </ListItemButton>
          </List>
        </Collapse>
      )}
    </>
  );
};

export default StructuralUnitMenu;