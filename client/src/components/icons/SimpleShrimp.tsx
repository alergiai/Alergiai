import React from 'react';
import { LucideProps } from 'lucide-react';

export const SimpleShrimp: React.FC<LucideProps> = ({
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
      {/* Simplified shrimp shape */}
      <path d="M18 8c0 4-4 8-10 8s-4-4-4-8" />
      <path d="M18 8c-2 0-4 1-4 3" />
      <path d="M8 16l-2 3" />
      <path d="M12 16l0 3" />
      <path d="M16 14l2 3" />
    </svg>
  );
};

export default SimpleShrimp;