
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, PlayerState, Content, Language } from './types';
import useGameEngine from './hooks/useGameEngine';
import GameScreen from './components/GameScreen';
import SetupScreen from './components/SetupScreen';
import StatPanel from './components/StatPanel';
import PageNavigator from './components/PageNavigator';
import DebugModal from './components/DebugModal';
import SettingsModal from './components/SettingsModal';
import { t } from './lib/i18n';
import { audioManager } from './lib/AudioManager';

type Theme = 'light' | 'dark';
type MusicTrack = 'ambient_fantasy' | 'ambient_scifi' | 'ambient_horror' | 'ambient_default';


const HealthBar: React.FC<{ health: number; max?: number }> = ({ health, max = 10 }) => {
    const numericHealth = typeof health === 'number' && !isNaN(health) ? health : 0;
    const numericMax = typeof max === 'number' && !isNaN(max) ? max : 10;

    return (
      <div className="flex items-center gap-1 w-24">
        {Array.from({ length: numericMax }).map((_, i) => (
          <div 
            key={i}
            className={`h-3 flex-1 ${i < numericHealth ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-700'}`}
          />
        ))}
      </div>
    );
};


const AppHeader: React.FC<{ 
  playerState: PlayerState | null;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  showStatsButton: boolean;
  pages: string[][];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  theme: Theme;
  onThemeToggle: () => void;
  lang: Language;
  isMuted: boolean;
  onMuteToggle: () => void;
}> = ({ playerState, onOpenStats, onOpenSettings, showStatsButton, pages, currentPage, setCurrentPage, theme, onThemeToggle, lang, isMuted, onMuteToggle }) => {
  if (!playerState || !showStatsButton) return (
    <header className="flex-shrink-0 border-b border-gray-300 dark:border-gray-700 pb-2 mb-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300">{t('appTitle', lang)}</h1>
        <div className="flex items-center gap-2">
            <button onClick={onMuteToggle} className="px-3 py-1.5 text-xl bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
              {isMuted ? '🔇' : '🔊'}
            </button>
            <button onClick={onOpenSettings} className="px-3 py-1.5 text-xl bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
              ⚙️
            </button>
            <button onClick={onThemeToggle} className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
        </div>
      </div>
    </header>
  );

  const { day, timeOfDay, currentLocation, stats } = playerState;
  const health = stats?.['체력'] || stats?.['health'] || stats?.['호감도'] || stats?.['affection'] || 0;

  return (
    <header className="flex-shrink-0 pb-2 mb-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300">{t('appTitle', lang)}</h1>
        <div className="flex items-center gap-2">
            <button onClick={onMuteToggle} className="px-3 py-2 text-xl bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
              {isMuted ? '🔇' : '🔊'}
            </button>
             <button onClick={onOpenSettings} className="px-3 py-2 text-xl bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
              ⚙️
            </button>
            <button onClick={onThemeToggle} className="px-3 py-2 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {showStatsButton && (
            <button
                onClick={onOpenStats}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors font-sans"
                aria-label={t('viewStatus', lang)}
            >
                {t('status', lang)}
            </button>
            )}
        </div>
      </div>
      <div className="font-sans grid grid-cols-3 items-center text-sm text-gray-600 dark:text-gray-500 pt-2">
        <div className="flex items-center gap-2">
          <span>❤️</span>
          <HealthBar health={health as number} max={10} />
        </div>
        <div className="text-center">
          <div>{lang === 'ko' ? `${day}${t('day', lang)} ${timeOfDay}` : `${t('day', lang)} ${day}, ${timeOfDay}`}</div>
        </div>
        <span className="text-right">{currentLocation}</span>
      </div>
      {pages.length > 1 && (
        <div className="pt-4">
          <PageNavigator
            currentPage={currentPage}
            totalPages={pages.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </header>
  );
};


const App: React.FC = () => {
  const {
    gameState,
    playerState,
    pages,
    currentPage,
    setCurrentPage,
    currentChoices,
    isTyping,
    isNavigating,
    setIsTyping,
    handleChoice,
    startGame,
    isDebugMode,
    setIsDebugMode,
    isDebugging,
    debugPrompt,
    confirmSendPrompt,
    cancelDebug,
    gameSetup,
    model,
    changeModel,
    updateGameSetup,
    setStoryDirection,
    getCurrentSummary,
    saveGame,
    loadGame,
    storyHistory,
    lang,
    setLang,
  } = useGameEngine();

  const [isStatPanelOpen, setIsStatPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [hasSave, setHasSave] = useState(false);
  const [isMuted, setIsMuted] = useState(audioManager.getMuteState());
  
  const onTypingFinished = useCallback(() => {
    setIsTyping(false);
  }, [setIsTyping]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  useEffect(() => {
      try {
        const savedGame = localStorage.getItem('ai-adventure-save');
        setHasSave(!!savedGame);
      } catch (error) {
        console.warn("Could not check for saved game:", error);
        setHasSave(false);
      }
  }, [gameState]);

  const getMusicTrackForGenre = (genre: string): MusicTrack => {
    const lowerGenre = genre.toLowerCase();
    if (lowerGenre.includes('fantasy')) return 'ambient_fantasy';
    if (lowerGenre.includes('sci-fi') || lowerGenre.includes('science fiction') || lowerGenre.includes('cyberpunk')) return 'ambient_scifi';
    if (lowerGenre.includes('horror') || lowerGenre.includes('thriller')) return 'ambient_horror';
    return 'ambient_default';
  };

  useEffect(() => {
    if (gameState === GameState.Playing && gameSetup) {
        const track = getMusicTrackForGenre(gameSetup.genre);
        audioManager.playMusic(track);
    } else if (gameState === GameState.Ended || gameState === GameState.Setup) {
        audioManager.stopMusic();
    }

    return () => {
        if (gameState === GameState.Playing) {
            audioManager.stopMusic();
        }
    };
  }, [gameState, gameSetup]);


  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };
  
  const handleMuteToggle = () => {
    const newMuteState = audioManager.toggleMute();
    setIsMuted(newMuteState);
  };

  const handleDownloadLog = useCallback(() => {
    const logLines: string[] = [];

    for (const content of storyHistory) {
      if (content.role === 'model') {
        try {
          const responseJson = JSON.parse(content.parts[0].text);
          if (responseJson.dialogue && Array.isArray(responseJson.dialogue)) {
            logLines.push(responseJson.dialogue.join('\n\n').replace(/<<|>>/g, ''));
          }
        } catch (e) {
          // This might be a summary confirmation or an error, skip for a clean log.
        }
      } else if (content.role === 'user') {
        const userText = content.parts[0].text;
        if (userText.startsWith('(The player attempted:')) {
            // It's a skill check
            const outcomeMatch = userText.match(/\. The player rolled \d+ and (succeeded|failed|성공|실패)\./);
            const attemptMatch = userText.match(/\(The player attempted: "([^"]*)"/);
            if (attemptMatch) {
                const outcomeText = outcomeMatch ? ` (${outcomeMatch[1]})` : '';
                logLines.push(`\n[ACTION] > ${attemptMatch[1]}${outcomeText}\n`);
            }
        } else {
            // It's a regular choice
            const choiceMatch = userText.match(/My choice is: "([^"]*)"/);
            if (choiceMatch && choiceMatch[1]) {
                logLines.push(`\n[CHOICE] > ${choiceMatch[1]}\n`);
            }
        }
      }
    }

    const storyText = logLines.join('\n');
    const blob = new Blob([storyText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-adventure-log.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [storyHistory]);

  const renderContent = () => {
    if (gameState === GameState.Setup) {
        return <SetupScreen onStart={startGame} hasSave={hasSave} onLoadGame={loadGame} lang={lang} onLangChange={setLang} />;
    }
    
    if (gameState === GameState.Ended) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="flex-grow overflow-y-auto w-full text-left p-4">
                  {pages.flat().map((line, index) => (
                    <p key={index} className="text-xl leading-relaxed whitespace-pre-wrap mb-4">{line}</p>
                  ))}
                </div>
                <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 my-4">{t('theEnd', lang)}</h2>
                <div className="flex gap-4">
                    <button
                      onClick={handleDownloadLog}
                      className="mt-4 px-6 py-2 bg-blue-600 dark:bg-blue-800 hover:bg-blue-700 dark:hover:bg-blue-700 rounded-lg transition-colors text-white"
                    >
                      {t('downloadLog', lang)}
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-6 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {t('startNewStory', lang)}
                    </button>
                </div>
            </div>
          );
    }
    
    return (
        <GameScreen
            pages={pages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            choices={currentChoices}
            isTyping={isTyping}
            isNavigating={isNavigating}
            onTypingFinished={onTypingFinished}
            onNext={() => {}} // Not used in AI mode
            onChoice={handleChoice}
            lang={lang}
        />
    )
  };

  return (
    <div className="w-full max-w-5xl h-[95vh] flex flex-col bg-white dark:bg-black text-black dark:text-white shadow-2xl rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-4 flex-shrink-0">
        <AppHeader 
          playerState={playerState} 
          onOpenStats={() => setIsStatPanelOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          showStatsButton={gameState === GameState.Playing || gameState === GameState.Ended}
          pages={pages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          lang={lang}
          isMuted={isMuted}
          onMuteToggle={handleMuteToggle}
        />
      </div>
      <main className="flex-grow relative overflow-y-auto px-4 pb-4">
        {renderContent()}
      </main>
      <StatPanel 
        playerState={playerState} 
        isOpen={isStatPanelOpen} 
        onClose={() => setIsStatPanelOpen(false)}
        lang={lang}
      />
      <DebugModal
        isOpen={isDebugging}
        promptHistory={debugPrompt}
        onClose={cancelDebug}
        onSend={confirmSendPrompt}
        lang={lang}
      />
      {gameSetup && (
         <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            initialSetup={gameSetup}
            onSetupChange={updateGameSetup}
            currentModel={model}
            onModelChange={changeModel}
            isDebugMode={isDebugMode}
            onDebugToggle={() => setIsDebugMode(!isDebugMode)}
            onSaveGame={saveGame}
            onDownloadLog={handleDownloadLog}
            onSetStoryDirection={setStoryDirection}
            onGetCurrentSummary={getCurrentSummary}
            lang={lang}
        />
      )}
    </div>
  );
};

export default App;
