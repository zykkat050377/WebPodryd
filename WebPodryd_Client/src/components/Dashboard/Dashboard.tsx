// src/components/Dashboard/Dashboard.tsx
import { Box, Typography, Button, keyframes } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HandshakeIcon from '../../assets/handshake.svg?react';
import ContractDocsIcon from '../../assets/contract-docs.svg?react';
import { useNavigate } from 'react-router-dom';


// Локальные анимации для надежности
const handshakeAnimation = keyframes`
  0%, 100% { transform: rotate(-10deg) translateY(0); }
  25% { transform: rotate(0deg) translateY(-10px); }
  50% { transform: rotate(10deg) translateY(0); }
  75% { transform: rotate(0deg) translateY(-10px); }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{
      p: 2,
      pl: 2,
      textAlign: 'center',
      backgroundColor: theme.palette.background.default,

      marginLeft: '0px'
    }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
        Система учета договоров подряда и актов выполненных работ
      </Typography>

      {/* Анимированное рукопожатие - именно здесь как на скриншоте */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        mb: 4,
        '& svg': {
          width: '280px',
          height: '240px',
          color: theme.palette.primary.main,
          animation: `${handshakeAnimation} 1.8s ease-in-out infinite`,
          '& path': {
            stroke: 'currentColor',
            strokeWidth: 2,
            fill: 'none'
          }
        }
      }}>
        <HandshakeIcon />
      </Box>

      {/* Кнопки действий - стилизованные как на скриншоте */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        mt: 4,
        '& .MuiButton-root': {
          width: '280px',
          fontSize: '1rem',
          fontWeight: 'bold',
          py: 1.5,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }
      }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<HandshakeIcon style={{
            width: '24px',
            height: '24px',
            animation: `${floatAnimation} 3s ease-in-out infinite`
          }} />}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
          onClick={() => navigate('/create-contract')}
        >
          СОЗДАТЬ ДОГОВОР
        </Button>

        <Button
          variant="outlined"
          size="large"
          startIcon={<HandshakeIcon style={{
            width: '24px',
            height: '24px'
          }} />}
          sx={{
            borderWidth: '2px',
            '&:hover': { borderWidth: '2px' }
          }}
          onClick={() => navigate('/create-act')}
        >
          СОЗДАТЬ АКТ
        </Button>
      </Box>

      {/* Парящие документы внизу */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 6,
        mt: 4,
        '& svg': {
          animation: `${floatAnimation} 4s ease-in-out infinite`,
          '&:nth-of-type(2)': {
            animationDelay: '0.5s'
          }
        }
      }}>
        <ContractDocsIcon style={{
          width: '100px',
          height: '100px',
          color: theme.palette.secondary.main,
          opacity: 0.8
        }} />
        <ContractDocsIcon style={{
          width: '100px',
          height: '100px',
          color: theme.palette.primary.light,
          opacity: 0.6
        }} />
      </Box>
    </Box>
  );
};

export default Dashboard;
