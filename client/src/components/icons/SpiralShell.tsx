import React from 'react';
import { LucideProps } from 'lucide-react';

export const SpiralShell: React.FC<LucideProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 21C16.5 21 20 17.5 20 12C20 6.5 16.5 3 12 3C7.5 3 4 6.5 4 12C4 17.5 7.5 21 12 21Z" />
      <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" />
      <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" />
    </svg>
  );
};

export default SpiralShell;