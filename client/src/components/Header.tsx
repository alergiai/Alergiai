import React from 'react';
import { User, Settings } from 'lucide-react';
import { Link } from 'wouter';
import { AnimatedContainer } from './ui/animations';
import alergiAiLogo from '../assets/alergi-ai-logo.png';

const Header = () => {
  return (
    <header className="px-5 py-4 bg-white shadow-sm z-10 sticky top-0">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <Link href="/">
          <AnimatedContainer className="flex items-center cursor-pointer">
            <img src={alergiAiLogo} alt="Alergi.AI" className="h-10" />
          </AnimatedContainer>
        </Link>
        
        <div className="flex gap-2">
          <button 
            type="button" 
            className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button 
            type="button" 
            className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            aria-label="User profile"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
