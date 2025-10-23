// src/components/Contract/ContractForm.tsx
import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import ContractorPassportData from './ContractorPassportData/ContractorPassportData';
import ContractGeneralData from './ContractGeneralData/ContractGeneralData';

const ContractForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'passport' | 'general'>('passport');

  const handleNext = () => {
    setCurrentStep('general');
  };

  const handleBack = () => {
    setCurrentStep('passport');
  };

  const handleSave = () => {
    // Здесь будет логика сохранения данных
    console.log('Сохранение данных договора');
    navigate('/contracts');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Форма договора</Typography>

      <ContractorPassportData
        onNext={handleNext}
        expanded={currentStep === 'passport'}
        onToggle={() => setCurrentStep('passport')}
      />

      <ContractGeneralData
        onBack={handleBack}
        expanded={currentStep === 'general'}
        onToggle={() => setCurrentStep('general')}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ px: 4, py: 1.5 }}
          size="large"
        >
          Сохранить данные
        </Button>
      </Box>
    </Box>
  );
};

export default ContractForm;