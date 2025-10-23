// src/components/Contract/ContractGeneralData/WorkServiceBlock.tsx
import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Autocomplete,
  IconButton
} from '@mui/material';
import { Lock, Delete } from '@mui/icons-material';
import { WorkServiceBlockProps } from './types';

const WorkServiceBlock: React.FC<WorkServiceBlockProps> = ({
  workService,
  index,
  cost,
  costLabel,
  costInWords,
  isMainService,
  canEdit,
  availableOptions,
  onWorkServiceChange,
  onRemove,
  selectedStructuralUnit
}) => {
  return (
    <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Работа/услуга {index + 1}:
      </Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 5 }}>
          <Autocomplete
            options={availableOptions}
            value={workService}
            onChange={(event, newValue) => onWorkServiceChange(index, newValue)}
            disabled={!selectedStructuralUnit || !canEdit}
            renderInput={(params) => (
              <TextField
                {...params}
                label={`Наименование работы/услуги ${index + 1}`}
                size="small"
                disabled={!selectedStructuralUnit || !canEdit}
                required={isMainService}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: isMainService ? (
                    <Lock color="action" sx={{ mr: 1, fontSize: 16 }} />
                  ) : null,
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                {option}
              </li>
            )}
          />
          {isMainService && (
            <Typography variant="caption" color="text.secondary">
              Обязательная работа/услуга {!canEdit ? '(нельзя изменить)' : ''}
            </Typography>
          )}
        </Grid>

        <Grid size={{ xs: 5 }}>
          <TextField
            fullWidth
            label={costLabel}
            type="number"
            value={cost}
            disabled={true}
            InputProps={{
              startAdornment: (
                <Typography color="text.secondary" sx={{ mr: 1 }}>
                  Br
                </Typography>
              )
            }}
            size="small"
          />
        </Grid>

        <Grid size={{ xs: 2 }}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => onRemove(index)}
            disabled={!selectedStructuralUnit || isMainService}
            sx={{ minWidth: 'auto' }}
          >
            × Удалить
          </Button>
        </Grid>
      </Grid>

      {/* Стоимость прописью для каждой работы/услуги */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Стоимость прописью"
            value={costInWords}
            disabled={true}
            size="small"
            multiline
            rows={2}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkServiceBlock;
