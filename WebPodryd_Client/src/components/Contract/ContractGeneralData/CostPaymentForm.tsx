// src/components/Contract/ContractGeneralData/CostPaymentForm.tsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { PaymentFormProps } from './types';
import WorkServiceBlock from './WorkServiceBlock';
import { numberToWordsWithCents } from './utils';

const CostPaymentForm: React.FC<PaymentFormProps> = ({
  selectedStructuralUnit,
  selectedContractName,
  actTemplates,
  selectedWorkServices,
  onWorkServiceChange,
  onAddWorkService,
  onRemoveWorkService,
  getAvailableOptions,
  getCostForWorkService,
  userRole
}) => {
  const isMainWorkService = (index: number): boolean => index === 0;
  const canEditWorkService = (index: number): boolean => {
    if (userRole === 'user' && isMainWorkService(index)) {
      return false;
    }
    return userRole === 'manager' || userRole === 'admin';
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Оплата труда: по договорам "стоимость"
      </Typography>

      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        Наименование работ/услуг:
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          (первая обязательна, можно добавить до 4 дополнительных)
        </Typography>
      </Typography>

      {selectedWorkServices.map((workService, index) => {
        const cost = getCostForWorkService(workService);
        const costInWords = numberToWordsWithCents(cost);

        return (
          <WorkServiceBlock
            key={index}
            workService={workService}
            index={index}
            cost={cost}
            costLabel="Общая стоимость"
            costInWords={costInWords}
            isMainService={isMainWorkService(index)}
            canEdit={canEditWorkService(index)}
            availableOptions={getAvailableOptions(index)}
            onWorkServiceChange={onWorkServiceChange}
            onRemove={onRemoveWorkService}
            selectedStructuralUnit={selectedStructuralUnit}
          />
        );
      })}

      <Button
        variant="outlined"
        onClick={onAddWorkService}
        disabled={!selectedStructuralUnit || selectedWorkServices.length >= 5}
        sx={{ mt: 2 }}
      >
        + Добавить работу/услугу ({selectedWorkServices.length}/5)
      </Button>
    </Box>
  );
};

export default CostPaymentForm;
