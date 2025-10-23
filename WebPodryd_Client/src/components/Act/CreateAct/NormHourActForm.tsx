// src/components/Act/CreateAct/NormHourActForm.tsx
import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  IconButton,
  Button,
  Grid
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { ActFormProps } from './types';

const NormHourActForm: React.FC<ActFormProps> = ({
  selectedContract,
  actData,
  onWorkServiceChange,
  onAddWorkService,
  onRemoveWorkService,
  selectedStructuralUnit,
  numberToWordsWithCents
}) => {
  const handleQuantityChange = (index: number, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value) || 0;
    onWorkServiceChange(index, 'quantity', numValue);
  };

  const handleNameChange = (index: number, value: string) => {
    // Разрешаем редактирование только для услуг, добавленных вручную
    if (!actData.workServices[index].isFromContract) {
      onWorkServiceChange(index, 'name', value);
    }
  };

  const totalAmountInWords = numberToWordsWithCents(actData.totalAmount);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Акт выполненных работ: по договорам "нормо-часа"
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Наименование работы/услуги</TableCell>
            <TableCell align="center">Кол-во, час</TableCell>
            <TableCell align="center">Ед. изм.</TableCell>
            <TableCell align="right">Цена нормо-часа, Br</TableCell>
            <TableCell align="right">Сумма, Br</TableCell>
            <TableCell align="center">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {actData.workServices.map((service, index) => (
            <TableRow key={index}>
              <TableCell>
                <TextField
                  fullWidth
                  value={service.name || ''}
                  size="small"
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  disabled={!selectedStructuralUnit || service.isFromContract}
                  placeholder="Введите название работы/услуги"
                  InputProps={{
                    readOnly: service.isFromContract // Только для чтения для услуг из договора
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  value={service.quantity === 0 ? '' : service.quantity}
                  size="small"
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                  disabled={!selectedStructuralUnit}
                  sx={{ width: 100 }}
                  inputProps={{
                    min: 0,
                    step: 0.5
                  }}
                  placeholder="0"
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  value={service.unit || 'час'}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ width: 100 }}
                />
              </TableCell>
              <TableCell align="right">
                <TextField
                  type="number"
                  value={service.price === 0 ? '' : service.price}
                  size="small"
                  InputProps={{
                    readOnly: true, // Цена только для чтения
                    startAdornment: <Typography sx={{ mr: 1 }}>Br</Typography>,
                  }}
                  disabled={!selectedStructuralUnit}
                  sx={{ width: 120 }}
                  placeholder="0.00"
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight="bold">
                  {(service.amount || 0).toFixed(2)} Br
                </Typography>
              </TableCell>
              <TableCell align="center">
                <IconButton
                  onClick={() => onRemoveWorkService(index)}
                  color="error"
                  disabled={actData.workServices.length <= 1 || service.isFromContract}
                  size="small"
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button
        variant="outlined"
        startIcon={<Add />}
        onClick={onAddWorkService}
        disabled={!selectedStructuralUnit}
        sx={{ mt: 2 }}
      >
        Добавить работу/услугу
      </Button>

      <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6">
              Итого: {(actData.totalAmount || 0).toFixed(2)} Br
            </Typography>
            <TextField
              fullWidth
              label="Сумма прописью"
              value={totalAmountInWords}
              InputProps={{ readOnly: true }}
              size="small"
              multiline
              rows={2}
              sx={{ mt: 1 }}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default NormHourActForm;