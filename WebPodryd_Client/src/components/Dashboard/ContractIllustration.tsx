// src/components/Dashboard/ContractIllustration.tsx
import { Box, keyframes } from '@mui/material';
import HandshakeIcon from '../../assets/handshake.svg';
import ContractDocsIcon from '../../assets/contract-docs.svg';

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

const ContractIllustration = () => {
  return (
    <Box sx={{
      position: 'relative',
      height: 400,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* Анимированное рукопожатие */}
      <HandshakeIcon
        sx={{
          fontSize: 300,
          animation: `${floatAnimation} 3s ease-in-out infinite`,
          color: 'primary.main',
          zIndex: 2
        }}
      />

      {/* Парящие документы */}
      <ContractDocsIcon
        sx={{
          position: 'absolute',
          fontSize: 120,
          right: '15%',
          top: '20%',
          animation: `${floatAnimation} 4s ease-in-out infinite 0.5s`,
          color: 'secondary.light',
          opacity: 0.8
        }}
      />
    </Box>
  );
};