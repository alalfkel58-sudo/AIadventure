import React, { useState, useRef, useCallback } from 'react';
import { PlayerState, Language } from '../types';
import { t } from '../lib/i18n';

interface StatPanelProps {
  playerState: PlayerState | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

interface TooltipState {
  content: string;
  x: number;
  y: number;
}

const StatDisplay: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => {
    const isNumeric = typeof value === 'number';
    const max = 10;
    
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
            <span className="text-gray-600 dark:text-gray-400 w-24">{label}</span>
            <div className="flex-grow flex items-center gap-1">
                {isNumeric ? (
                    Array.from({ length: max }).map((_, i) => (
                        <div 
                            key={i}
                            className={`h-4 flex-grow transition-colors ${i < value ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-800'}`}
                        />
                    ))
                ) : (
                    <span className="text-right w-full font-bold">{value}</span>
                )}
            </div>
             {isNumeric && <span className="w-8 text-right font-mono">{value}</span>}
        </div>
    );
};


const StatPanel: React.FC<StatPanelProps> = ({ playerState, isOpen, onClose, lang }) => {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const handleShowTooltip = useCallback((e: React.MouseEvent | React.TouchEvent, description: string) => {
    const show = (clientX: number, clientY: number) => {
        setTooltip({ content: description, x: clientX, y: clientY });
    };

    if ('touches' in e) {
      const touch = e.touches[0];
      show(touch.clientX, touch.clientY);
    } else {
       show(e.clientX, e.clientY);
    }
  }, []);

  const handleHideTooltip = useCallback(() => {
    setTooltip(null);
  }, []);

  if (!isOpen || !playerState) return null;

  const { stats, inventory, itemDescriptions } = playerState;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center transition-opacity" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="w-11/12 max-w-sm bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl z-50 p-6 transform transition-transform scale-100 font-sans"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white text-2xl" aria-label={t('close', lang)}>&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-black dark:text-gray-200 border-b border-gray-300 dark:border-gray-700 pb-2">{t('playerStatus', lang)}</h2>
        
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-500 dark:text-gray-400">{t('stats', lang)}</h3>
            <div className="space-y-1 text-sm">
                {Object.entries(stats).map(([key, value]) => (
                    <StatDisplay key={key} label={key} value={value} />
                ))}
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-500 dark:text-gray-400">{t('inventory', lang)}</h3>
            {inventory.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {inventory.map(item => {
                      const description = itemDescriptions?.[item];
                      
                      const interactionProps = description ? { 
                          onMouseEnter: (e: React.MouseEvent) => handleShowTooltip(e, description),
                          onMouseLeave: handleHideTooltip,
                          onTouchStart: (e: React.TouchEvent) => handleShowTooltip(e, description),
                          onTouchEnd: handleHideTooltip
                      } : {};
                      
                      const className = description ? 'cursor-help text-green-600 dark:text-green-400' : 'cursor-default';
                      
                      return (
                        <li key={item}>
                          <span className={className} {...interactionProps}>
                            {item}
                            {description && <span className="ml-2" role="img" aria-label={t('viewDescription', lang)}>ℹ️</span>}
                          </span>
                        </li>
                      );
                    })}
                </ul>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-600 italic">{t('emptyInventory', lang)}</p>
            )}
        </div>
        
        {/* Other dynamic playerState properties can be rendered here */}
        
      </div>
      {tooltip && (
        <div
            className="fixed top-0 left-0 p-2 bg-black bg-opacity-75 text-white rounded-md text-sm z-50 pointer-events-none max-w-xs"
            style={{ transform: `translate(${tooltip.x + 10}px, ${tooltip.y + 10}px)` }}
        >
            {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default StatPanel;
