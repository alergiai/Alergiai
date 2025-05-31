import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-20'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        viewBox="0 0 300 100"
        className={`${sizeClasses[size]} mr-3`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield background */}
        <path
          d="M30 15C30 15 45 10 60 15C75 20 75 45 60 75C45 85 30 75 15 75C0 45 0 20 15 15C22.5 12.5 30 15 30 15Z"
          fill="currentColor"
          className="text-primary"
        />
        
        {/* Fork */}
        <path
          d="M25 25L25 60M22 25L22 35M28 25L28 35M31 25L31 35M34 25L34 35"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Knife */}
        <path
          d="M45 25L45 60M48 25L48 45"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Text */}
        <text
          x="85"
          y="35"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="24"
          fontWeight="700"
          fill="currentColor"
          className="text-gray-800"
        >
          Alergi.AI
        </text>
      </svg>
    </div>
  );
};

export default Logo;