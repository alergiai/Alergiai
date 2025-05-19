import React from 'react';
import { Link } from 'wouter';
import { AnimatedContainer } from './ui/animations';
import alergiAiLogo from '../assets/alergi-ai-logo.png';

const Header = () => {
  return (
    <header className="pt-6 pb-2 z-10 bg-gradient-to-b from-white to-transparent">
      <div className="flex justify-center items-center max-w-md mx-auto">
        <Link href="/">
          <AnimatedContainer className="flex items-center cursor-pointer">
            <img src={alergiAiLogo} alt="Alergi.AI" className="h-12" />
          </AnimatedContainer>
        </Link>
      </div>
    </header>
  );
};

export default Header;
