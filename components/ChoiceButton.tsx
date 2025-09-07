import React from 'react';
import { Choice } from '../types';

interface ChoiceButtonProps {
  choice: Choice;
  onChoice: (choice: Choice) => void;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ choice, onChoice }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent the GameScreen's onClick from firing
    onChoice(choice);
  };
    
  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-4 bg-gray-100 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900 hover:border-gray-800 dark:hover:border-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
    >
      <span className="block text-lg">
        {choice.text}
      </span>
      {choice.description && (
        <span className="block text-sm text-green-600 dark:text-green-400 font-sans mt-1">
          ({choice.description})
        </span>
      )}
    </button>
  );
};

export default ChoiceButton;
