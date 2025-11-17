
import React from 'react';
import { BrainCircuitIcon, StarIcon } from './icons';

interface HeaderProps {
  xp: number;
}

const Header: React.FC<HeaderProps> = ({ xp }) => {
  const level = Math.floor(xp / 1000) + 1;
  const xpForLevel = xp % 1000;
  const progressPercentage = (xpForLevel / 1000) * 100;

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-20 shadow-lg shadow-purple-500/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <BrainCircuitIcon className="h-8 w-8 text-purple-400" />
            <h1 className="ml-3 text-2xl font-bold tracking-tight text-white">EDA</h1>
            <span className="ml-2 hidden sm:inline-block text-xs font-medium text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full">Economic Decision Assistant</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm font-medium text-yellow-300">
                    <StarIcon className="h-5 w-5 mr-1"/>
                    <span>Level {level}</span>
                </div>
                <div className="w-32 hidden sm:block">
                    <div className="h-2 bg-gray-700 rounded-full">
                        <div 
                          className="h-2 bg-yellow-400 rounded-full" 
                          style={{ width: `${progressPercentage}%`}}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-1">{xpForLevel} / 1000 XP</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
