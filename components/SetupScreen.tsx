import React, { useState, useMemo } from 'react';
import { GameSetup, Language } from '../types';
import { t } from '../lib/i18n';

interface SetupScreenProps {
  onStart: (setup: GameSetup) => void;
  hasSave: boolean;
  onLoadGame: () => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
}

const FormField: React.FC<{label: string, children: React.ReactNode, description?: string}> = ({label, children, description}) => (
    <div className="w-full">
      <label className="block text-left text-gray-500 dark:text-gray-400 text-sm font-bold mb-2">
        {label}
      </label>
      {children}
      {description && <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">{description}</p>}
    </div>
);

const LanguageSelector: React.FC<{ selectedLang: Language; onSelect: (lang: Language) => void; }> = ({ selectedLang, onSelect }) => {
    const languages: { code: Language, label: string, flag: string }[] = [
        { code: 'ko', label: '한국어', flag: '🇰🇷' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'jp', label: '日本語', flag: '🇯🇵' },
    ];

    return (
        <div className="grid grid-cols-3 gap-2">
            {languages.map(({ code, label, flag }) => (
                <button
                    key={code}
                    onClick={() => onSelect(code)}
                    className={`p-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${selectedLang === code ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-black' : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                >
                    <span>{flag}</span>
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
};

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, hasSave, onLoadGame, lang, onLangChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState<'gemini-2.5-flash' | 'gemini-2.5-pro'>('gemini-2.5-flash');
  const [persona, setPersona] = useState('');
  const [genre, setGenre] = useState('');
  const [intro, setIntro] = useState('');
  const [background, setBackground] = useState('');
  const [numCharacters, setNumCharacters] = useState(1);
  const [characterNames, setCharacterNames] = useState<string[]>(['']);
  const [characterDescriptions, setCharacterDescriptions] = useState<string[]>(['']);
  const [customSystemInstruction, setCustomSystemInstruction] = useState('');

  const handleNumCharactersChange = (num: number) => {
    setNumCharacters(num);
    const newNames = Array.from({ length: num }, (_, i) => characterNames[i] || '');
    const newDescriptions = Array.from({ length: num }, (_, i) => characterDescriptions[i] || '');
    setCharacterNames(newNames);
    setCharacterDescriptions(newDescriptions);
  };
  
  const handleCharacterNameChange = (index: number, name: string) => {
    const newNames = [...characterNames];
    newNames[index] = name;
    setCharacterNames(newNames);
  };
  
  const handleCharacterDescriptionChange = (index: number, desc: string) => {
    const newDescriptions = [...characterDescriptions];
    newDescriptions[index] = desc;
    setCharacterDescriptions(newDescriptions);
  }
  
  const canStart = useMemo(() => {
    const baseFieldsFilled = persona.trim() && genre.trim() && intro.trim() && background.trim();
    const charactersFilled = characterNames.length === numCharacters && 
                             characterNames.every(name => name.trim()) &&
                             characterDescriptions.length === numCharacters &&
                             characterDescriptions.every(desc => desc.trim());
    return baseFieldsFilled && charactersFilled;
  }, [persona, genre, intro, background, characterNames, characterDescriptions, numCharacters]);

  const handleStart = () => {
    if (canStart) {
      onStart({ persona, genre, intro, background, numCharacters, characterNames, characterDescriptions, apiKey, model, lang, customSystemInstruction });
    } else {
      alert(t('fillAllFieldsError', lang));
    }
  };

  return (
    <div className="w-full flex flex-col items-center p-4 animate-fade-in">
      <div className="text-center w-full max-w-sm flex-shrink-0">
        <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-gray-200">{t('startStory', lang)}</h1>
        <p className="text-md text-gray-600 dark:text-gray-500 mb-8">{t('setupIntro', lang)}</p>
      </div>
      
      <div className="w-full max-w-sm space-y-4 font-sans pb-8">
        {hasSave && (
           <button 
              onClick={onLoadGame}
              className="w-full px-8 py-4 mb-4 bg-green-600 dark:bg-green-700 text-white font-bold rounded-lg shadow-lg hover:bg-green-500 dark:hover:bg-green-600 transition-all transform hover:scale-105"
            >
              {t('continueAdventure', lang)}
            </button>
        )}

        <FormField label={t('language', lang)}>
            <LanguageSelector selectedLang={lang} onSelect={onLangChange} />
        </FormField>

        <FormField label={t('geminiApiKeyOptional', lang)} description={t('geminiApiKeyDesc', lang)}>
            <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t('geminiApiKeyPlaceholder', lang)}
                className="w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900 dark:text-white"
            />
        </FormField>

        <FormField label={t('chooseModel', lang)} description={t('modelDesc', lang)}>
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => setModel('gemini-2.5-flash')}
                    className={`p-3 rounded-lg text-sm transition-colors ${model === 'gemini-2.5-flash' ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-black' : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                >
                    ⚡️ Gemini 2.5 Flash
                </button>
                <button
                    onClick={() => setModel('gemini-2.5-pro')}
                    className={`p-3 rounded-lg text-sm transition-colors ${model === 'gemini-2.5-pro' ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-black' : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                >
                    ✨ Gemini 2.5 Pro
                </button>
            </div>
        </FormField>

        <FormField label={t('storyGenre', lang)}>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder={t('genrePlaceholder', lang)}
            className="w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900 dark:text-white"
          />
        </FormField>
        
        <FormField label={t('playerPersona', lang)}>
          <textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder={t('personaPlaceholder', lang)}
            className="w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900 dark:text-white"
          />
        </FormField>

        <FormField label={t('worldBackground', lang)}>
          <textarea
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder={t('backgroundPlaceholder', lang)}
            className="w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900 dark:text-white"
          />
        </FormField>
        
        <FormField label={t('storyIntro', lang)}>
          <textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder={t('introPlaceholder', lang)}
            className="w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900 dark:text-white"
          />
        </FormField>

        <FormField label={t('numChars', lang)}>
          <div className="flex justify-center items-center gap-4 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
            {[1, 2, 3].map(num => (
                <button 
                    key={num}
                    onClick={() => handleNumCharactersChange(num)}
                    className={`w-12 h-12 rounded-lg transition-colors font-bold ${numCharacters === num ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-black' : 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                >
                    {num}
                </button>
            ))}
          </div>
        </FormField>

        {Array.from({ length: numCharacters }).map((_, index) => (
             <React.Fragment key={index}>
                <FormField label={t('charNameLabel', lang, { index: index + 1 })}>
                    <input
                        type="text"
                        value={characterNames[index] || ''}
                        onChange={(e) => handleCharacterNameChange(index, e.target.value)}
                        placeholder={t('charNamePlaceholder', lang)}
                        className="w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900 dark:text-white"
                    />
                </FormField>
                <FormField label={t('charDescLabel', lang, { index: index + 1 })}>
                    <textarea
                        value={characterDescriptions[index] || ''}
                        onChange={(e) => handleCharacterDescriptionChange(index, e.target.value)}
                        placeholder={t('charDescPlaceholder', lang)}
                        className="w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900 dark:text-white"
                    />
                </FormField>
             </React.Fragment>
        ))}
        
        <button 
          onClick={handleStart}
          disabled={!canStart}
          className="w-full px-8 py-4 bg-gray-800 dark:bg-gray-200 text-white dark:text-black font-bold rounded-lg shadow-lg hover:bg-black dark:hover:bg-white transition-all transform hover:scale-105 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {hasSave ? t('startNewAdventure', lang) : t('startAdventure', lang)}
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;