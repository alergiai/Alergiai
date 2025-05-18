import React from 'react';
import { LucideProps } from 'lucide-react';

export const Shrimp: React.FC<LucideProps> = ({
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
      {/* Shrimp body */}
      <path d="M17 12C17 8.5 14.5 6 11 6C7.5 6 5 8.5 5 12" />
      <path d="M11 12C13.5 12 15 13.5 15 16" />
      <path d="M8 16C8 13.5 9.5 12 12 12" />
      {/* Shrimp tail */}
      <path d="M18 11C20 10 21 8 21 6" />
      <path d="M17 11C19 10 20 8 20 6" />
      {/* Shrimp legs/antennas */}
      <path d="M5 15L3 18" />
      <path d="M8 17L6 20" />
      <path d="M11 18L10 21" />
      <path d="M14 17L15 20" />
    </svg>
  );
};

export default Shrimp;