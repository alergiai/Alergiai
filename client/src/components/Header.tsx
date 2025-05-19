import React from 'react';
import { Link } from 'wouter';
import { AnimatedContainer } from './ui/animations';
import alergiAiSvg from '../assets/alergiai.svg';

const Header = () => {
  return (
    <header className="pt-6 pb-2 z-10 bg-gradient-to-b from-white to-transparent">
      <div className="flex justify-center items-center max-w-md mx-auto">
        <Link href="/">
          <AnimatedContainer className="flex items-center cursor-pointer">
            <img src={alergiAiSvg} alt="Alergi.AI Logo" className="h-9 mr-2" />
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Alergi.AI
            </h1>
          </AnimatedContainer>
        </Link>
      </div>
    </header>
  );
};

export default Header;
