//src/components/Contract/ContractorPassportData/BankDetailsDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

interface BankDetailsFormData {
  IBAN: string;
  bankName: string;
  BIC: string;
}

interface BankDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (details: BankDetailsFormData) => void;
  initialData?: BankDetailsFormData;
}

const BankDetailsDialog: React.FC<BankDetailsDialogProps> = ({
  open,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState<BankDetailsFormData>({
    IBAN: '',
    bankName: '',
    BIC: ''
  });

  const [errors, setErrors] = useState<Partial<BankDetailsFormData>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ IBAN: '', bankName: '', BIC: '' });
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<BankDetailsFormData> = {};

    if (!formData.IBAN.trim()) {
      newErrors.IBAN = 'Расчетный счет обязателен';
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Наименование банка обязательно';
    }

    if (!formData.BIC.trim()) {
      newErrors.BIC = 'BIC обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof BankDetailsFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ IBAN: '', bankName: '', BIC: '' });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AccountBalanceIcon color="primary" />
          <Typography variant="h6">Банковские реквизиты</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Расчетный счет IBAN"
              value={formData.IBAN}
              onChange={handleChange('IBAN')}
              placeholder="BY00XXXX00000000000000000000"
              error={!!errors.IBAN}
              helperText={errors.IBAN}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Наименование банка"
              value={formData.bankName}
              onChange={handleChange('bankName')}
              error={!!errors.bankName}
              helperText={errors.bankName}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Номер договора BIC"
              value={formData.BIC}
              onChange={handleChange('BIC')}
              error={!!errors.BIC}
              helperText={errors.BIC}
              required
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        <Button onClick={handleSave} variant="contained">
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BankDetailsDialog;