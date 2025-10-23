// src/components/Act/ActForm.tsx
import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import CreateAct from './CreateAct/CreateAct';

const ActForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'create'>('create');

  const handleBackToStart = () => {
    setCurrentStep('create');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Форма акта выполненных работ</Typography>

      <CreateAct
        onBack={handleBackToStart}
        expanded={currentStep === 'create'}
        onToggle={() => setCurrentStep('create')}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => navigate('/acts')}
          sx={{ px: 4, py: 1.5 }}
          size="large"
        >
          Сохранить данные
        </Button>
      </Box>
    </Box>
  );
};

export default ActForm;
