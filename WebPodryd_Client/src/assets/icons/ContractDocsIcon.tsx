// src/assets/icons/ContractDocsIcon.tsx
import * as React from 'react'; // Добавлен импорт React
import { SvgIcon, SvgIconProps } from '@mui/material';
import { forwardRef } from 'react';

interface ContractDocsIconProps extends SvgIconProps {
  /**
   * Показывать ли тень документов
   * @default true
   */
  withShadow?: boolean;
  /**
   * Количество видимых строк в документах
   * @default 3
   */
  visibleLines?: number;
}

export const ContractDocsIcon = forwardRef<SVGSVGElement, ContractDocsIconProps>(
  ({ withShadow = true, visibleLines = 3, sx, ...props }, ref) => {

    const renderLines = (offsetX = 0, offsetY = 0) => {
      return Array.from({ length: visibleLines }, (_, i) => (
        <line
          key={i}
          x1={25 + offsetX}
          y1={40 + i * 10 + offsetY}
          x2={85 - i * 10 + offsetX}
          y2={40 + i * 10 + offsetY}
          stroke="currentColor"
          strokeWidth="2"
        />
      ));
    };

    return (
      <SvgIcon
        ref={ref}
        viewBox="0 0 100 100"
        {...props}
        sx={sx}
      >
        {/* Основной документ */}
        <rect
          x="20"
          y="30"
          width="60"
          height="70"
          rx="2"
          fill={withShadow ? '#f5f5f5' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        />
        {renderLines()}

        {/* Второй документ */}
        <rect
          x="30"
          y="25"
          width="60"
          height="70"
          rx="2"
          fill="#ffffff"
          stroke="currentColor"
          strokeWidth="2"
        />
        {renderLines(5, -5)}
      </SvgIcon>
    );
  }
);

ContractDocsIcon.displayName = 'ContractDocsIcon';
