import React, { useState } from 'react';
import { Choice, Language } from '../types';
import Typewriter from './Typewriter';
import ChoiceButton from './ChoiceButton';
import { t } from '../lib/i18n';

interface GameScreenProps {
  pages: string[][];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  choices: Choice[];
  isTyping: boolean;
  isNavigating: boolean;
  onTypingFinished: () => void;
  onNext: () => void;
  onChoice: (choice: Choice) => void;
  lang: Language;
}

const CustomChoiceInput: React.FC<{ onSend: (text: string) => void; onCancel: () => void; lang: Language }> = ({ onSend, onCancel, lang }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim()) {
            onSend(text.trim());
        }
    };

    return (
        <div className="w-full flex flex-col gap-2 animate-fade-in">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('customChoicePlaceholder', lang)}
                className="w-full p-3 bg-gray-100 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-gray-500 text-black dark:text-white"
                autoFocus
            />
            <div className="flex justify-end gap-2">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                    {t('cancel', lang)}
                </button>
                <button onClick={handleSend} className="px-4 py-2 bg-gray-800 dark:bg-gray-200 text-white dark:text-black rounded-lg hover:bg-black dark:hover:bg-white transition-colors">
                    {t('send', lang)}
                </button>
            </div>
        </div>
    );
};


const GameScreen: React.FC<GameScreenProps> = ({
  pages,
  currentPage,
  setCurrentPage,
  choices,
  isTyping,
  isNavigating,
  onTypingFinished,
  onNext,
  onChoice,
  lang
}) => {
  const [isWritingCustom, setIsWritingCustom] = useState(false);
  
  const currentPageContent = pages[currentPage] || [];
  const isLastPageOfAllContent = pages.length === 0 || currentPage === pages.length - 1;

  const handleScreenClick = () => {
    if (isTyping) {
      onTypingFinished();
      return;
    }

    if (choices.length > 0 && isLastPageOfAllContent) {
      return; // If choices are visible, screen clicks should do nothing
    }
    
    if (isLastPageOfAllContent) {
      // In AI mode, there's no automatic "next scene", so this does nothing.
      // Kept for potential future use or manual page turns.
    } else {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentPage > 0) {
          setCurrentPage(currentPage - 1);
      }
  }
  
  const handleNextPage = (e: React.MouseEvent) => {
      e.stopPropagation();
      if(!isLastPageOfAllContent) {
        setCurrentPage(currentPage + 1);
      }
  }
  
  const handleSendCustomChoice = (text: string) => {
    onChoice({ text });
    setIsWritingCustom(false);
  };

  const pageText = currentPageContent.join('\n');
  const showChoices = choices.length > 0 && isLastPageOfAllContent && !isTyping && !isNavigating;

  return (
    <div className="h-full flex flex-col justify-between" onClick={handleScreenClick}>
      <div key={currentPage} className="flex-grow p-2 pr-4 text-left relative animate-fade-in">
        <Typewriter
            fullText={pageText}
            isTyping={isTyping}
            onFinished={onTypingFinished}
          />
      </div>
      
      <div className="flex-shrink-0 p-4">
        {isNavigating ? (
            <div className="text-center text-gray-500 dark:text-gray-600 animate-pulse font-sans">
                {t('generatingStory', lang)}
            </div>
        ) : showChoices ? (
          <div className="grid grid-cols-1 gap-2">
            {isWritingCustom ? (
                <CustomChoiceInput 
                    onSend={handleSendCustomChoice}
                    onCancel={() => setIsWritingCustom(false)}
                    lang={lang}
                />
            ) : (
                <>
                    {choices.map((choice, index) => (
                      <ChoiceButton key={index} choice={choice} onChoice={onChoice} />
                    ))}
                    <button
                        onClick={() => setIsWritingCustom(true)}
                        className="w-full text-center p-4 bg-gray-200 dark:bg-gray-800 border border-dashed border-gray-400 dark:border-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 hover:border-gray-800 dark:hover:border-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-600 dark:text-gray-400"
                    >
                        {t('writeChoice', lang)}
                    </button>
                </>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center h-10">
            <button 
                onClick={handlePrevPage}
                className={`px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-opacity ${currentPage === 0 ? 'opacity-0' : 'opacity-100'}`}
                disabled={currentPage === 0}
            >
                {t('prevPage', lang)}
            </button>
            <div className="text-center text-gray-500 dark:text-gray-600 animate-pulse font-sans">
                {isTyping ? t('typing', lang) : (isLastPageOfAllContent && choices.length === 0 && !isNavigating) ? t('storyEnd', lang) : t('clickForNext', lang)}
            </div>
            <button 
                onClick={handleNextPage}
                className={`px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-opacity ${isLastPageOfAllContent ? 'opacity-0' : 'opacity-100'}`}
                disabled={isLastPageOfAllContent}
            >
                {t('nextPage', lang)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;
