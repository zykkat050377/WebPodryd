// src/assets/icons/HandshakeIcon.tsx
import { SvgIcon, SvgIconProps } from '@mui/material';
import { forwardRef } from 'react';
import { useTheme } from '@mui/material/styles'; // Добавлен импорт useTheme

interface HandshakeIconProps extends SvgIconProps {
  /**
   * Анимировать ли иконку
   * @default false
   */
  animated?: boolean;
  /**
   * Толщина линий рукопожатия
   * @default 2
   */
  handshakeStrokeWidth?: number;
}

export const HandshakeIcon = forwardRef<SVGSVGElement, HandshakeIconProps>(
  ({ animated = false, handshakeStrokeWidth = 2, sx, ...props }, ref) => {
    const theme = useTheme(); // Теперь useTheme доступен

    return (
      <SvgIcon
        ref={ref}
        viewBox="0 0 100 60"
        {...props}
        sx={{
          ...(animated && {
            animation: `${theme.animations.handshake} 2s ease-in-out infinite`
          }),
          ...sx,
        }}
      >
        {/* Левая рука */}
        <path
          d="M20,30 Q25,15 30,20 Q35,25 40,20"
          fill="none"
          stroke="currentColor"
          strokeWidth={handshakeStrokeWidth}
          strokeLinecap="round"
        />
        {/* Правая рука */}
        <path
          d="M80,30 Q75,15 70,20 Q65,25 60,20"
          fill="none"
          stroke="currentColor"
          strokeWidth={handshakeStrokeWidth}
          strokeLinecap="round"
        />
        {/* Рукопожатие (толще остальных) */}
        <path
          d="M40,20 Q50,25 60,20"
          fill="none"
          stroke="currentColor"
          strokeWidth={handshakeStrokeWidth * 1.5}
          strokeLinecap="round"
        />
      </SvgIcon>
    );
  }
);

HandshakeIcon.displayName = 'HandshakeIcon';