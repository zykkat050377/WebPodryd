// src/components/common/Logo.tsx//
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import LogoIcon from '@assets/logo.svg?react';
import styles from './styles/Logo.module.css';

interface LogoProps {
  color?: string;
}

const Logo = ({ color = 'inherit' }: LogoProps) => {
  return (
    <Link to="/dashboard" className={styles.logoLink}>
      <Box
        component={LogoIcon}
        className={styles.logoImage}
        sx={{
          color,
          '& path': {
            fill: 'currentColor'
          }
        }}
      />
    </Link>
  );
};

export default Logo;