import React from 'react';
import { ShieldCheck, User } from 'lucide-react';
import { Link } from 'wouter';

const Header = () => {
  return (
    <header className="px-4 py-4 bg-white shadow-sm z-10 sticky top-0">
      <div className="flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <ShieldCheck className="text-primary-500 w-6 h-6" />
            <h1 className="text-xl font-heading font-bold text-gray-900">AllerScan</h1>
          </div>
        </Link>
        <button 
          type="button" 
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
          aria-label="User profile"
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
