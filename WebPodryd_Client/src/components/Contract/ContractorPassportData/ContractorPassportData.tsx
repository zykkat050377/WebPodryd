// src/components/Contract/ContractorPassportData/ContractorPassportData.tsx

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton,
  Collapse,
  MenuItem
} from '@mui/material';
import { ExpandMore, ExpandLess, AccountBalance, Edit } from '@mui/icons-material';
import BankDetailsDialog from './BankDetailsDialog';
import AddressAutocomplete from './AddressAutocomplete/AddressAutocomplete';
import { BankDetailsFormData } from '../../../types/bankDetails';

interface ContractorPassportDataProps {
  onNext: () => void;
  expanded: boolean;
  onToggle: () => void;
}

const documentTypes = [
  { value: 'Паспорт РБ', label: 'Паспорт РБ' },
  { value: 'Паспорт РФ', label: 'Паспорт РФ' },
  { value: 'Паспорт другой страны', label: 'Паспорт другой страны' },
  { value: 'ID-карта', label: 'ID-карта' },
  { value: 'Вид на жительство', label: 'Вид на жительство' },
];

const streetTypes = [
  { value: 'Улица', label: 'Улица' },
  { value: 'Проспект', label: 'Проспект' },
  { value: 'Переулок', label: 'Переулок' },
  { value: 'Площадь', label: 'Площадь' },
  { value: 'Проезд', label: 'Проезд' },
  { value: 'Бульвар', label: 'Бульвар' },
  { value: 'Шоссе', label: 'Шоссе' },
  { value: 'Тракт', label: 'Тракт' }
];

const ContractorPassportData: React.FC<ContractorPassportDataProps> = ({
  onNext,
  expanded,
  onToggle
}) => {
  const [bankDetails, setBankDetails] = useState<BankDetailsFormData | null>(null);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    country: 'Беларусь',
    region: '',
    city: '',
    district: '',
    settlement: '',
    streetType: 'Улица',
    streetName: '',
    house: '',
    building: '',
    apartment: ''
  });

  const handleBankDetailsSave = (details: BankDetailsFormData) => {
    setBankDetails(details);
  };

  const handleBankDetailsEdit = () => {
    setBankDialogOpen(true);
  };

  const getBankDetailsDisplay = () => {
    if (!bankDetails) return '';
    return `${bankDetails.IBAN}, ${bankDetails.bankName}`;
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleAddressChange = (field: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ cursor: 'pointer' }} onClick={onToggle}>
        <Typography variant="h6">Паспортные данные подрядчика:</Typography>
        <IconButton>{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
      </Box>

      <Collapse in={expanded}>
        <Grid container spacing={3}>
          {/* Первая колонка - Основные данные */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Фамилия" fullWidth margin="normal" required />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Имя" fullWidth margin="normal" required />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Отчество" fullWidth margin="normal" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField label="Телефон моб." fullWidth margin="normal" type="tel" required />
              </Grid>

              <Grid size={{ xs: 12 }}>
                {!bankDetails ? (
                  <Button variant="outlined" startIcon={<AccountBalance />} onClick={() => setBankDialogOpen(true)} fullWidth sx={{ mt: 2, py: 1.5 }}>
                    Банковские реквизиты
                  </Button>
                ) : (
                  <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2 }}>
                    <TextField fullWidth label="Банковские реквизиты" value={getBankDetailsDisplay()} InputProps={{ readOnly: true }} />
                    <IconButton onClick={handleBankDetailsEdit} color="primary"><Edit /></IconButton>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Grid>

          {/* Вторая колонка - Паспортные данные */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Вид документа" select fullWidth margin="normal" defaultValue="Паспорт РБ" required>
                  {documentTypes.map((type) => (<MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Серия" fullWidth margin="normal" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Номер" fullWidth margin="normal" required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Гражданство" fullWidth margin="normal" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Когда выдан" fullWidth margin="normal" type="date" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Кем выдан" fullWidth margin="normal" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Идентификационный №" fullWidth margin="normal" required />
              </Grid>
            </Grid>
          </Grid>

          {/* Адрес регистрации - исправленная секция */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 2 }}>Адрес регистрации:</Typography>
            <Grid container spacing={2} alignItems="flex-start">
              {/* Первая строка адреса */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <AddressAutocomplete
                  label="Страна"
                  value={formData.country}
                  onChange={handleAddressChange('country')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <AddressAutocomplete
                  label="Область"
                  value={formData.region}
                  onChange={handleAddressChange('region')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <AddressAutocomplete
                  label="Город"
                  value={formData.city}
                  onChange={handleAddressChange('city')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <AddressAutocomplete
                  label="Район"
                  value={formData.district}
                  onChange={handleAddressChange('district')}
                />
              </Grid>

              {/* Вторая строка адреса */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Населённый пункт"
                  fullWidth
                  margin="normal"
                  value={formData.settlement}
                  onChange={handleInputChange('settlement')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  label="Тип"
                  select
                  fullWidth
                  margin="normal"
                  value={formData.streetType}
                  onChange={handleInputChange('streetType')}
                >
                  {streetTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label={formData.streetType}
                  fullWidth
                  margin="normal"
                  value={formData.streetName}
                  onChange={handleInputChange('streetName')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                <TextField
                  label="Дом"
                  fullWidth
                  margin="normal"
                  value={formData.house}
                  onChange={handleInputChange('house')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                <TextField
                  label="Корпус"
                  fullWidth
                  margin="normal"
                  value={formData.building}
                  onChange={handleInputChange('building')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                <TextField
                  label="Кв."
                  fullWidth
                  margin="normal"
                  value={formData.apartment}
                  onChange={handleInputChange('apartment')}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button variant="contained" onClick={onNext} sx={{ px: 4, py: 1.5 }}>
            Далее &gt;&gt;&gt;
          </Button>
        </Box>
      </Collapse>

      <BankDetailsDialog
        open={bankDialogOpen}
        onClose={() => setBankDialogOpen(false)}
        onSave={handleBankDetailsSave}
        initialData={bankDetails || undefined}
      />
    </Paper>
  );
};

export default ContractorPassportData;