
import React from 'react';
import { Page, Language } from './types';
import { NAV_ITEMS } from './constants';

interface NavigationProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  lang: Language;
  isAdmin?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, setPage, lang, isAdmin = false }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {NAV_ITEMS(lang, isAdmin).map((item) => (
          <button
            key={item.page}
            onClick={() => setPage(item.page)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              currentPage === item.page ? 'text-blue-600' : 'text-gray-500 hover:text-blue-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="h-4 bg-white" />
    </nav>
  );
};

export default Navigation;
