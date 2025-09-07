import React, { useState, useEffect, useMemo } from 'react';
import { GameSetup, Language } from '../types';
import { t } from '../lib/i18n';

const FormField: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
    <div className="w-full">
      <label className="block text-left text-gray-500 text-sm font-bold mb-2">
        {label}
      </label>
      {children}
    </div>
);

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSetup: GameSetup;
    onSetupChange: (newSetup: GameSetup) => void;
    currentModel: 'gemini-2.5-flash' | 'gemini-2.5-pro';
    onModelChange: (newModel: 'gemini-2.5-flash' | 'gemini-2.5-pro') => void;
    isDebugMode: boolean;
    onDebugToggle: () => void;
    onSaveGame: () => boolean;
    onDownloadLog: () => void;
    onSetStoryDirection: (direction: string) => void;
    onGetCurrentSummary: () => string;
    lang: Language;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    initialSetup,
    onSetupChange,
    currentModel,
    onModelChange,
    isDebugMode,
    onDebugToggle,
    onSaveGame,
    onDownloadLog,
    onSetStoryDirection,
    onGetCurrentSummary,
    lang,
}) => {
    const [setup, setSetup] = useState(initialSetup);
    const [storyDirection, setStoryDirection] = useState('');
    const [summary, setSummary] = useState<string | null>(null);


    useEffect(() => {
        setSetup(initialSetup);
        // Reset local state when modal opens/closes or initial setup changes
        setStoryDirection('');
        setSummary(null);
    }, [initialSetup, isOpen]);

    const handleCharacterNameChange = (index: number, name: string) => {
        const newNames = [...setup.characterNames];
        newNames[index] = name;
        setSetup(s => ({ ...s, characterNames: newNames }));
    };

    const handleCharacterDescriptionChange = (index: number, desc: string) => {
        const newDescriptions = [...setup.characterDescriptions];
        newDescriptions[index] = desc;
        setSetup(s => ({ ...s, characterDescriptions: newDescriptions }));
    };

    const handleSaveChanges = () => {
        onSetupChange(setup);
        onModelChange(setup.model);
        onSetStoryDirection(storyDirection);
        onClose();
    };

    const handleViewSummary = () => {
        setSummary(onGetCurrentSummary());
    };

    const handleSaveGame = () => {
        if (onSaveGame()) {
            alert(t('gameSaved', lang));
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center transition-opacity" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="w-11/12 max-w-md h-[90vh] bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 p-6 flex flex-col font-sans text-white"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-2xl font-bold">{t('settings', lang)}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl" aria-label={t('close', lang)}>&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                     {/* --- Game Management --- */}
                    <div className="p-4 bg-gray-900 rounded-lg">
                        <h3 className="font-bold text-lg mb-3 text-yellow-400">{t('gameManagement', lang)}</h3>
                        <div className="space-y-2">
                            <button
                                onClick={handleSaveGame}
                                className="w-full p-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-500 transition-colors"
                            >
                                {t('saveStory', lang)}
                            </button>
                             <button
                                onClick={onDownloadLog}
                                className="w-full p-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors"
                            >
                                {t('downloadLog', lang)}
                            </button>
                        </div>
                    </div>

                    {/* --- Debug --- */}
                    <div className="p-4 bg-gray-900 rounded-lg">
                        <h3 className="font-bold text-lg mb-3 text-red-400">{t('debug', lang)}</h3>
                         <div className="flex justify-between items-center">
                            <label htmlFor="debug-toggle" className="text-gray-300">{t('debugMode', lang)}</label>
                            <button
                                id="debug-toggle"
                                onClick={onDebugToggle}
                                className={`px-4 py-2 text-sm rounded-lg font-bold ${isDebugMode ? 'bg-red-500 text-white' : 'bg-gray-600'}`}
                            >
                                {isDebugMode ? t('enabled', lang) : t('disabled', lang)}
                            </button>
                        </div>
                    </div>

                    {/* --- Model --- */}
                    <div className="p-4 bg-gray-900 rounded-lg">
                        <h3 className="font-bold text-lg mb-3 text-blue-400">{t('aiModel', lang)}</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setSetup(s => ({ ...s, model: 'gemini-2.5-flash' }))}
                                className={`p-3 rounded-lg text-sm transition-colors ${setup.model === 'gemini-2.5-flash' ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                ⚡️ Flash
                            </button>
                            <button
                                onClick={() => setSetup(s => ({ ...s, model: 'gemini-2.5-pro' }))}
                                className={`p-3 rounded-lg text-sm transition-colors ${setup.model === 'gemini-2.5-pro' ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                ✨ Pro
                            </button>
                        </div>
                    </div>

                     {/* --- Story Control --- */}
                    <div className="p-4 bg-gray-900 rounded-lg">
                        <h3 className="font-bold text-lg mb-3 text-purple-400">{t('storyControl', lang)}</h3>
                        <div className="space-y-4">
                            <button
                                onClick={handleViewSummary}
                                className="w-full p-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500 transition-colors"
                            >
                                {t('viewCurrentSummary', lang)}
                            </button>
                            {summary && (
                                <div className="p-3 bg-gray-800 border border-gray-700 rounded-md text-sm text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                    {summary}
                                </div>
                            )}
                            <FormField label={t('nextStoryDirection', lang)}>
                                <textarea value={storyDirection} onChange={(e) => setStoryDirection(e.target.value)} placeholder={t('directionPlaceholder', lang)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md h-20 resize-none"/>
                            </FormField>
                        </div>
                    </div>

                    {/* --- World Settings --- */}
                    <div className="p-4 bg-gray-900 rounded-lg">
                        <h3 className="font-bold text-lg mb-3 text-green-400">{t('storySettings', lang)}</h3>
                         <div className="space-y-4">
                            <FormField label={t('storyGenre', lang)}>
                                <input type="text" value={setup.genre} onChange={(e) => setSetup(s => ({ ...s, genre: e.target.value }))} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"/>
                            </FormField>
                             <FormField label={t('playerPersona', lang)}>
                                <textarea value={setup.persona} onChange={(e) => setSetup(s => ({ ...s, persona: e.target.value }))} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md h-20 resize-none"/>
                            </FormField>
                            <FormField label={t('worldBackground', lang)}>
                                <textarea value={setup.background} onChange={(e) => setSetup(s => ({ ...s, background: e.target.value }))} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md h-20 resize-none"/>
                            </FormField>
                            <FormField label={t('customSystemPrompt', lang)}>
                                <textarea value={setup.customSystemInstruction || ''} onChange={(e) => setSetup(s => ({ ...s, customSystemInstruction: e.target.value }))} placeholder={t('customSystemPromptPlaceholder', lang)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md h-20 resize-none"/>
                            </FormField>
                            {setup.characterNames.map((_, index) => (
                                <React.Fragment key={index}>
                                    <FormField label={t('charNameLabel', lang, { index: index + 1 })}>
                                        <input type="text" value={setup.characterNames[index] || ''} onChange={(e) => handleCharacterNameChange(index, e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"/>
                                    </FormField>
                                    <FormField label={t('charDescLabel', lang, { index: index + 1 })}>
                                        <textarea value={setup.characterDescriptions[index] || ''} onChange={(e) => handleCharacterDescriptionChange(index, e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md h-20 resize-none"/>
                                    </FormField>
                                </React.Fragment>
                            ))}
                         </div>
                    </div>
                </div>

                <div className="mt-6 flex-shrink-0">
                    <button
                        onClick={handleSaveChanges}
                        className="w-full px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-500 transition-colors"
                    >
                        {t('saveAndApply', lang)}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;