import React, { useState, useEffect } from 'react';
import { Content, Language } from '../types';
import { t } from '../lib/i18n';

interface DebugModalProps {
  isOpen: boolean;
  promptHistory: Content[] | null;
  onClose: () => void;
  onSend: (editedHistory: Content[]) => void;
  lang: Language;
}

const DebugModal: React.FC<DebugModalProps> = ({ isOpen, promptHistory, onClose, onSend, lang }) => {
  const [editedHistory, setEditedHistory] = useState<Content[]>([]);
  const [editedHistoryText, setEditedHistoryText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && promptHistory) {
      const historyText = JSON.stringify(promptHistory, null, 2);
      setEditedHistory(promptHistory);
      setEditedHistoryText(historyText);
      setJsonError(null);
    }
  }, [promptHistory, isOpen]);

  if (!isOpen || !promptHistory) return null;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEditedHistoryText(newText);
    try {
      const parsed = JSON.parse(newText);
      if (Array.isArray(parsed)) {
        // Re-type the history to ensure roles are correctly typed for the game engine
        const typedHistory = parsed.map(item => ({
            role: item.role === 'user' ? 'user' : 'model',
            parts: item.parts,
        })) as Content[];
        setEditedHistory(typedHistory);
        setJsonError(null);
      } else {
        setJsonError('Invalid format: Must be an array of Content objects.');
      }
    } catch (error) {
      setJsonError('Invalid JSON format.');
    }
  };

  const handleSend = () => {
    if (!jsonError) {
      onSend(editedHistory);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-40 flex items-center justify-center transition-opacity p-4" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="w-full max-w-lg h-[90vh] bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 p-6 flex flex-col font-sans"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-200">{t('debugPrompt', lang)}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl" aria-label={t('close', lang)}>&times;</button>
        </div>
        
        <div className="flex-grow flex flex-col min-h-0">
            <h3 className="text-lg font-semibold mb-2 text-gray-400">{t('fullPromptEditable', lang)}</h3>
            <textarea
                value={editedHistoryText}
                onChange={handleTextChange}
                className={`w-full flex-grow p-3 bg-black border rounded-lg resize-none focus:outline-none text-gray-200 font-mono text-sm ${jsonError ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-600 focus:ring-2 focus:ring-blue-500'}`}
            />
            {jsonError && <p className="text-red-500 text-xs mt-1">{jsonError}</p>}
        </div>
        
        <div className="mt-6 flex justify-end gap-4 flex-shrink-0">
            <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
            >
                {t('cancel', lang)}
            </button>
             <button
                onClick={handleSend}
                disabled={!!jsonError}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {t('send', lang)}
            </button>
        </div>
      </div>
    </div>
  );
};

export default DebugModal;