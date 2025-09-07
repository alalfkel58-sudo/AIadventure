import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// --- TYPE DEFINITIONS ---
type GameState = 'welcome' | 'setup' | 'playing' | 'ended';
type Theme = 'light' | 'dark';
type Language = 'ko' | 'en' | 'ja';
type Model = 'gemini-2.5-flash' | 'gemini-2.5-pro';
type Item = { name: string; description: string };
type PlayerStatus = {
  health: number;
  time: string;
  location: string;
  inventory: Item[];
};
type Choice = { text: string; requires?: string | null };
type NPC = { name: string; description: string };
type GameData = {
  model: Model;
  genre: string;
  persona: string;
  world: string;
  intro: string;
  npcs: NPC[];
  playerStatus: PlayerStatus;
  history: { role: 'user' | 'model', parts: { text: string }[] }[];
  scenes: string[]; // Added to store scene descriptions for pagination
};
type AiResponse = {
    scene_description: string;
    player_status: PlayerStatus;
    choices: Choice[];
    is_ending: boolean;
};

// --- I1N TRANSLATIONS ---
const translations = {
  ko: {
    title: "AI 어드벤처",
    tagline: "AI가 당신만을 위한 이야기를 실시간으로 만들어냅니다.\n당신의 선택이 곧 이야기가 됩니다.",
    continueAdventure: "모험 계속하기",
    lastSave: "마지막 저장 위치에서 이어하기",
    newAdventure: "새로운 모험 시작",
    createYourWorld: "나만의 세계 창조하기",
    modelSelectLabel: "AI 모델",
    modelFlash: "⚡️ Gemini 2.5 Flash",
    modelPro: "✨ Gemini 2.5 Pro",
    modelFlashDesc: "빠르고 경제적인 모델",
    modelProDesc: "더 창의적이고 강력한 모델",
    genreLabel: "이야기 장르",
    genrePlaceholder: "중세 판타지, 학원물, 사이버펑크 등",
    personaLabel: "플레이어 설정 (페르소나)",
    personaPlaceholder: "나는 기억을 잃은 채 낯선 숲에서 깨어난 모험가다.",
    worldLabel: "세계관 설정",
    worldPlaceholder: "마법과 몬스터가 공존하는 대륙 '아르카디아'.",
    introLabel: "이야기의 시작 (인트로)",
    introPlaceholder: "나는 낡은 오두막 안에서 눈을 뜬다. 창밖에서는 폭풍우가 몰아치고 있다.",
    npcLabel: "주요 등장인물 설정",
    npcCount: (n: number) => `${n}명`,
    npcNameLabel: "이름",
    npcDescLabel: "설정",
    startAdventure: "모험 시작하기",
    storyLoading: "이야기를 생성하는 중...",
    playerChoiceLoading: "잠시만 기다려주세요...",
    theEnd: "The End",
    storyEnded: "이야기가 끝났습니다.",
    downloadLog: "이야기 로그 다운로드",
    startNewAdventure: "새로운 모험 시작하기",
    status: "상태",
    settings: "설정",
    themeToggle: "테마 전환",
    directInputPlaceholder: "행동을 직접 입력하세요...",
    submit: "전송",
    cancel: "취소",
    directInputAction: "직접 행동 입력...",
    statusTitle: "플레이어 상태",
    health: "체력",
    location: "현재 위치",
    time: "시간",
    inventory: "소지품",
    emptyInventory: "아무것도 가지고 있지 않습니다.",
    settingsTitle: "게임 설정",
    gameManagement: "게임 관리",
    saveGame: "게임 저장하기",
    saveGameSuccess: "게임이 저장되었습니다!",
    close: "닫기",
    prevPage: "이전",
    nextPage: "다음",
    pageIndicator: (current: number, total: number) => `페이지 ${current} / ${total}`,
    apiKeyError: "Gemini API 키가 설정되지 않았습니다. 앱이 작동하려면 유효한 키를 입력해야 합니다.",
    genericError: "오류가 발생했습니다. 키가 유효한지 확인하고 다시 시도해주세요.",
    apiKeyPrompt: "시작하려면 Gemini API 키를 입력하세요.",
    saveKey: "키 저장",
  },
  en: {
    title: "AI Adventure",
    tagline: "The AI creates a story just for you in real-time.\nYour choice becomes the story.",
    continueAdventure: "Continue Adventure",
    lastSave: "Continue from last save",
    newAdventure: "Start New Adventure",
    createYourWorld: "Create Your Own World",
    modelSelectLabel: "AI Model",
    modelFlash: "⚡️ Gemini 2.5 Flash",
    modelPro: "✨ Gemini 2.5 Pro",
    modelFlashDesc: "Fast and economical model",
    modelProDesc: "More creative and powerful model",
    genreLabel: "Story Genre",
    genrePlaceholder: "Medieval Fantasy, School Life, Cyberpunk, etc.",
    personaLabel: "Player Setup (Persona)",
    personaPlaceholder: "I am an adventurer who woke up in a strange forest with amnesia.",
    worldLabel: "World Setting",
    worldPlaceholder: "The continent of 'Arcadia', where magic and monsters coexist.",
    introLabel: "The Beginning (Intro)",
    introPlaceholder: "I wake up inside a shabby hut. A storm is raging outside.",
    npcLabel: "Main Characters Setup",
    npcCount: (n: number) => `${n} people`,
    npcNameLabel: "Name",
    npcDescLabel: "Description",
    startAdventure: "Start Adventure",
    storyLoading: "Generating the story...",
    playerChoiceLoading: "Please wait a moment...",
    theEnd: "The End",
    storyEnded: "The story has ended.",
    downloadLog: "Download Story Log",
    startNewAdventure: "Start a New Adventure",
    status: "Status",
    settings: "Settings",
    themeToggle: "Toggle Theme",
    directInputPlaceholder: "Enter your action directly...",
    submit: "Submit",
    cancel: "Cancel",
    directInputAction: "Direct Action Input...",
    statusTitle: "Player Status",
    health: "Health",
    location: "Current Location",
    time: "Time",
    inventory: "Inventory",
    emptyInventory: "You are not carrying anything.",
    settingsTitle: "Game Settings",
    gameManagement: "Game Management",
    saveGame: "Save Game",
    saveGameSuccess: "Game saved!",
    close: "Close",
    prevPage: "Previous",
    nextPage: "Next",
    pageIndicator: (current: number, total: number) => `Page ${current} of ${total}`,
    apiKeyError: "Gemini API Key is not set. You must enter a valid key for the app to function.",
    genericError: "An error occurred. Please check if your key is valid and try again.",
    apiKeyPrompt: "Enter your Gemini API Key to begin.",
    saveKey: "Save Key",
  },
  ja: {
    title: "AIアドベンチャー",
    tagline: "AIがあなただけのためにリアルタイムで物語を創り出します。\nあなたの選択が物語になります。",
    continueAdventure: "冒険を続ける",
    lastSave: "最後のセーブから続ける",
    newAdventure: "新しい冒険を始める",
    createYourWorld: "自分だけの世界を創造する",
    modelSelectLabel: "AIモデル",
    modelFlash: "⚡️ Gemini 2.5 Flash",
    modelPro: "✨ Gemini 2.5 Pro",
    modelProDesc: "より創造的で強力なモデル",
    modelFlashDesc: "高速で経済的なモデル",
    genreLabel: "物語のジャンル",
    genrePlaceholder: "中世ファンタジー、学園もの、サイバーパンクなど",
    personaLabel: "プレイヤー設定（ペルソナ）",
    personaPlaceholder: "私は記憶を失い、見知らぬ森で目覚めた冒険者だ。",
    worldLabel: "世界観設定",
    worldPlaceholder: "魔法とモンスターが共存する大陸「アルカディア」。",
    introLabel: "物語の始まり（イントロ）",
    introPlaceholder: "私は古い小屋の中で目を覚ます。窓の外は嵐が吹き荒れている。",
    npcLabel: "主な登場人物設定",
    npcCount: (n: number) => `${n}人`,
    npcNameLabel: "名前",
    npcDescLabel: "設定",
    startAdventure: "冒険を始める",
    storyLoading: "物語を生成中...",
    playerChoiceLoading: "少々お待ちください...",
    theEnd: "The End",
    storyEnded: "物語は終わりました。",
    downloadLog: "物語のログをダウンロード",
    startNewAdventure: "新しい冒険を始める",
    status: "ステータス",
    settings: "設定",
    themeToggle: "テーマ切り替え",
    directInputPlaceholder: "行動を直接入力してください...",
    submit: "送信",
    cancel: "キャンセル",
    directInputAction: "直接行動入力...",
    statusTitle: "プレイヤーステータス",
    health: "体力",
    location: "現在地",
    time: "時間",
    inventory: "所持品",
    emptyInventory: "何も持っていません。",
    settingsTitle: "ゲーム設定",
    gameManagement: "ゲーム管理",
    saveGame: "ゲームを保存",
    saveGameSuccess: "ゲームが保存されました！",
    close: "閉じる",
    prevPage: "前へ",
    nextPage: "次へ",
    pageIndicator: (current: number, total: number) => `ページ ${current} / ${total}`,
    apiKeyError: "Gemini APIキーが設定されていません。アプリが機能するためには有効なキーを入力する必要があります。",
    genericError: "エラーが発生しました。キーが有効か確認してからもう一度お試しください。",
    apiKeyPrompt: "開始するには、Gemini APIキーを入力してください。",
    saveKey: "キーを保存",
  }
};

// --- HELPER FUNCTIONS ---
const SAVE_KEY = 'ai-adventure-savegame';
const LANG_KEY = 'ai-adventure-language';
const API_KEY_SESSION_KEY = 'gemini-api-key';

const saveGame = (data: GameData) => {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(SAVE_KEY, json);
    return true;
  } catch (error) {
    console.error("Failed to save game:", error);
    return false;
  }
};

const loadGame = (): GameData | null => {
  try {
    const json = localStorage.getItem(SAVE_KEY);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error("Failed to load game:", error);
    return null;
  }
};

const handleDownloadLog = (gameData: GameData | null) => {
    if (!gameData) return;

    let logContent = `AI Adventure Log\n\n`;
    logContent += `Model: ${gameData.model}\n`;
    logContent += `Genre: ${gameData.genre}\n`;
    logContent += `Persona: ${gameData.persona}\n`;
    logContent += `World: ${gameData.world}\n\n`;
    logContent += `--- STORY START ---\n\n`;

    gameData.scenes.forEach((scene, index) => {
        logContent += `--- PAGE ${index + 1} ---\n\n`;
        logContent += `${scene}\n\n`;
    });

    const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-adventure-log.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const emptyGameData: Omit<GameData, 'history' | 'playerStatus' | 'scenes'> = {
  model: 'gemini-2.5-flash',
  genre: '',
  persona: '',
  world: '',
  intro: '',
  npcs: [{ name: '', description: '' }],
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(() => sessionStorage.getItem(API_KEY_SESSION_KEY));
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [hasSave, setHasSave] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem(LANG_KEY) as Language) || 'ko');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const t = useCallback((key: keyof (typeof translations)['ko'], ...args: any[]) => {
    const str = translations[language][key] || key;
    if (typeof str === 'function') {
      return str.apply(null, args);
    }
    return str;
  }, [language]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem(LANG_KEY, language);
  }, [language]);

  useEffect(() => {
    const savedGame = loadGame();
    if (savedGame) {
      setHasSave(true);
    }
  }, []);

  const handleKeySubmit = (key: string) => {
    sessionStorage.setItem(API_KEY_SESSION_KEY, key);
    setApiKey(key);
    setError(null);
  };

  const handleNewGame = () => {
    setGameState('setup');
    setGameData(null);
    setError(null);
  };

  const handleContinueGame = () => {
    const savedGame = loadGame();
    if (savedGame) {
      setGameData(savedGame);
      setCurrentPage(savedGame.scenes.length - 1);
      setGameState('playing');
      setError(null);
    }
  };

  const handleStartAdventure = async (setupData: Omit<GameData, 'history' | 'playerStatus' | 'scenes'>) => {
    setIsLoading(true);
    setError(null);
    const initialPlayerStatus: PlayerStatus = { health: 100, time: "Day 1, Morning", location: "Unknown Place", inventory: [] };
    const fullGameData: GameData = { ...setupData, playerStatus: initialPlayerStatus, history: [], scenes: [] };

    const prompt = `
      You are an AI storyteller for an interactive text adventure game.
      Based on the following settings, generate the first scene of the game.
      - Genre: ${fullGameData.genre}
      - Player Persona: ${fullGameData.persona}
      - World: ${fullGameData.world}
      - Main NPCs: ${fullGameData.npcs.map(n => `${n.name}: ${n.description}`).join(', ')}
      - Story Intro: ${fullGameData.intro}

      You must respond in JSON format based on the story's progression and player's actions.
      The JSON response must include scene_description, player_status (health, time, location, inventory), 2-4 choices, and a boolean is_ending.
      Now, based on these settings, describe the scene for "${fullGameData.intro}" and present the first choices.
    `;
    
    fullGameData.history.push({ role: 'user', parts: [{text: prompt}] });
    setGameData(fullGameData);
    
    try {
      const response = await callGeminiAPI(prompt, fullGameData);
      updateGameFromAiResponse(response, fullGameData);
      setGameState('playing');
    } catch (err) {
      console.error(err);
      setError(t('genericError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePlayerChoice = async (choiceText: string) => {
    if (!gameData) return;
    setIsLoading(true);
    setError(null);
    
    const prompt = `The player chose the following action: "${choiceText}". Describe the result of this action, and present the next situation and choices. Continue the story based on the previous context.`;
    
    const updatedHistory = gameData.history.concat([{ role: 'user' as const, parts: [{ text: prompt }] }]);
    const updatedGameData = { ...gameData, history: updatedHistory };
    setGameData(updatedGameData);

    try {
        const response = await callGeminiAPI(prompt, updatedGameData);
        updateGameFromAiResponse(response, updatedGameData);
    } catch (err) {
        console.error(err);
        setError(t('genericError'));
    } finally {
        setIsLoading(false);
    }
  };
  
  const updateGameFromAiResponse = (response: AiResponse, currentGameData: GameData) => {
      const updatedScenes = [...currentGameData.scenes, response.scene_description];
      setCurrentPage(updatedScenes.length - 1);

      const updatedPlayerStatus = {
        ...response.player_status,
        inventory: response.player_status.inventory || [],
      };

      const updatedGameData = {
          ...currentGameData,
          playerStatus: updatedPlayerStatus,
          history: currentGameData.history.concat([{ role: 'model' as const, parts: [{ text: JSON.stringify(response) }] }]),
          scenes: updatedScenes,
      };

      setGameData(updatedGameData);
      saveGame(updatedGameData);

      if (response.is_ending) {
          setGameState('ended');
      }
  };

  const callGeminiAPI = async (prompt: string, currentGameData: GameData): Promise<AiResponse> => {
      if (!apiKey) {
          throw new Error("API key is not set.");
      }
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const systemInstruction = `
        You are an interactive fiction storyteller. Your role is to create an engaging text-based adventure.
        Based on the user's choices and the established world settings, you will generate the next part of the story.
        You MUST respond in a valid JSON format. Do not include any text outside of the JSON object.
        The JSON object must conform to this schema:
        {
          "scene_description": "A vivid description of the current scene and the outcome of the player's action. Use special syntax: <<stat changes>>, [[important items]], {{interactable objects}}.",
          "player_status": {
            "health": number (0-100),
            "time": "string (e.g., 'Day 1, Morning')",
            "location": "string (e.g., 'Dark Cave')",
            "inventory": [ { "name": "string", "description": "string" } ]
          },
          "choices": [ { "text": "A clear action choice for the player", "requires": "Optional requirement, e.g., 'Agility check needed'" } ],
          "is_ending": boolean
        }
        When a player acquires an item, add it to the inventory.
      `;
      
      const result: GenerateContentResponse = await ai.models.generateContent({
        model: currentGameData.model,
        contents: currentGameData.history,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  scene_description: { type: Type.STRING },
                  player_status: {
                      type: Type.OBJECT,
                      properties: {
                          health: { type: Type.NUMBER },
                          time: { type: Type.STRING },
                          location: { type: Type.STRING },
                          inventory: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                name: { type: Type.STRING },
                                description: { type: Type.STRING }
                              },
                              required: ['name', 'description']
                            }
                          }
                      },
                      required: ['health', 'time', 'location', 'inventory']
                  },
                  choices: {
                      type: Type.ARRAY,
                      items: {
                          type: Type.OBJECT,
                          properties: {
                              text: { type: Type.STRING },
                              requires: { type: Type.STRING },
                          },
                          required: ['text']
                      }
                  },
                  is_ending: { type: Type.BOOLEAN }
              },
              required: ['scene_description', 'player_status', 'choices', 'is_ending']
          },
        },
      });

      const responseText = result.text.trim();
      return JSON.parse(responseText) as AiResponse;
  };

  const renderContent = () => {
    if (!apiKey) {
      return <ApiKeyScreen onKeySubmit={handleKeySubmit} t={t} />;
    }
    switch (gameState) {
      case 'setup':
        return <SetupScreen onStart={handleStartAdventure} t={t} isLoading={isLoading} error={error} />;
      case 'playing':
        return (
          <GameScreen
            gameData={gameData}
            choices={gameData?.history.filter(h => h.role === 'model').map(h => JSON.parse(h.parts[0].text).choices).pop() || []}
            isLoading={isLoading}
            onChoice={handlePlayerChoice}
            theme={theme}
            setTheme={setTheme}
            t={t}
            onSaveRequest={() => gameData && saveGame(gameData)}
            onDownloadRequest={() => handleDownloadLog(gameData)}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            error={error}
          />
        );
      case 'ended':
        return (
            <div className="screen">
                <h1>{t('theEnd')}</h1>
                <p>{gameData?.scenes[gameData.scenes.length - 1] || t('storyEnded')}</p>
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button onClick={() => handleDownloadLog(gameData)}>{t('downloadLog')}</button>
                    <button onClick={handleNewGame}>{t('startNewAdventure')}</button>
                </div>
            </div>
        );
      case 'welcome':
      default:
        return (
          <WelcomeScreen
            onNewGame={handleNewGame}
            onContinue={handleContinueGame}
            hasSave={hasSave}
            setLanguage={setLanguage}
            t={t}
            error={error}
          />
        );
    }
  };

  return <div id="app-container">{renderContent()}</div>;
}

// --- SUB-COMPONENTS ---

const ApiKeyScreen = ({ onKeySubmit, t }: { onKeySubmit: (key: string) => void; t: (key: keyof (typeof translations)['ko']) => string; }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onKeySubmit(key.trim());
    }
  };

  return (
    <div className="screen" style={{ justifyContent: 'center', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '2rem', fontFamily: 'serif', color: 'var(--primary-color)' }}>{t('title')}</h1>
      <p>{t('apiKeyPrompt')}</p>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px', marginTop: '1rem' }}>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter your API Key here"
          style={{ marginBottom: '1rem' }}
        />
        <button type="submit" disabled={!key.trim()} style={{ width: '100%' }}>{t('saveKey')}</button>
      </form>
    </div>
  );
};


const WelcomeScreen = ({ onNewGame, onContinue, hasSave, setLanguage, t, error }: { onNewGame: () => void; onContinue: () => void; hasSave: boolean; setLanguage: (lang: Language) => void; t: (key: keyof (typeof translations)['ko'], ...args: (string | number)[]) => string; error: string | null; }) => (
  <div className="screen" style={{ justifyContent: 'center', gap: '1.5rem' }}>
    <h1 style={{ fontSize: '3rem', fontFamily: 'serif', color: 'var(--primary-color)' }}>{t('title')}</h1>
    <p style={{ whiteSpace: 'pre-line' }}>{t('tagline')}</p>
    {error && <p className="error-message">{error}</p>}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', width: '250px' }}>
      {hasSave && (
        <button onClick={onContinue} style={{ order: 1 }}>
          {t('continueAdventure')}
          <small style={{ display: 'block', opacity: 0.8, fontWeight: 'normal' }}>{t('lastSave')}</small>
        </button>
      )}
      <button onClick={onNewGame} style={{ order: 2, background: 'var(--secondary-color)' }}>{t('newAdventure')}</button>
    </div>
    <div style={{ marginTop: '3rem' }}>
      <button onClick={() => setLanguage('ko')} style={{ background: 'none', color: 'var(--text-color)', padding: '0.5rem 1rem'}}>🇰🇷한국어</button>
      <button onClick={() => setLanguage('en')} style={{ background: 'none', color: 'var(--text-color)', padding: '0.5rem 1rem'}}>🇬🇧English</button>
      <button onClick={() => setLanguage('ja')} style={{ background: 'none', color: 'var(--text-color)', padding: '0.5rem 1rem'}}>🇯🇵日本語</button>
    </div>
  </div>
);

const SetupScreen = ({ onStart, t, isLoading, error }: { onStart: (data: Omit<GameData, 'history' | 'playerStatus' | 'scenes'>) => void; t: (key: keyof (typeof translations)['ko'], ...args: (string | number)[]) => string; isLoading: boolean, error: string | null }) => {
  const [data, setData] = useState(emptyGameData);
  const [numNpcs, setNumNpcs] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  
  const handleNpcChange = (index: number, field: 'name' | 'description', value: string) => {
    const newNpcs = [...data.npcs];
    newNpcs[index] = { ...newNpcs[index], [field]: value };
    setData({ ...data, npcs: newNpcs });
  };
  
  const handleNumNpcsChange = (num: number) => {
    setNumNpcs(num);
    const currentNpcs = data.npcs;
    const newNpcs = Array.from({ length: num }, (_, i) => currentNpcs[i] || { name: '', description: '' });
    setData({ ...data, npcs: newNpcs });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(data);
  };
  
  const canStart = useMemo(() => {
    return !isLoading && data.genre && data.persona && data.world && data.intro && data.npcs.every(n => n.name && n.description);
  }, [data, isLoading]);

  return (
    <form className="setup-screen" onSubmit={handleSubmit}>
      <h2>{t('createYourWorld')}</h2>

      <label>{t('modelSelectLabel')}</label>
      <div className="model-selection">
          <button type="button" onClick={() => setData({ ...data, model: 'gemini-2.5-flash' })} className={data.model === 'gemini-2.5-flash' ? 'selected' : ''}>
              {t('modelFlash')}
          </button>
          <button type="button" onClick={() => setData({ ...data, model: 'gemini-2.5-pro' })} className={data.model === 'gemini-2.5-pro' ? 'selected' : ''}>
              {t('modelPro')}
          </button>
      </div>
      <small style={{textAlign: 'center'}}>{data.model === 'gemini-2.5-flash' ? t('modelFlashDesc') : t('modelProDesc')}</small>
      
      <label htmlFor="genre">{t('genreLabel')}</label>
      <input id="genre" name="genre" value={data.genre} onChange={handleChange} placeholder={t('genrePlaceholder')} />

      <label htmlFor="persona">{t('personaLabel')}</label>
      <textarea id="persona" name="persona" value={data.persona} onChange={handleChange} placeholder={t('personaPlaceholder')} />

      <label htmlFor="world">{t('worldLabel')}</label>
      <textarea id="world" name="world" value={data.world} onChange={handleChange} placeholder={t('worldPlaceholder')} />
      
      <label htmlFor="intro">{t('introLabel')}</label>
      <textarea id="intro" name="intro" value={data.intro} onChange={handleChange} placeholder={t('introPlaceholder')} />
      
      <label>{t('npcLabel')}</label>
      <div>
        {[1, 2, 3].map(num => (
          <button type="button" key={num} onClick={() => handleNumNpcsChange(num)} className={numNpcs === num ? 'selected' : ''} style={{marginRight:'0.5rem'}}>{t('npcCount', num)}</button>
        ))}
      </div>
      {Array.from({ length: numNpcs }).map((_, index) => (
        <div key={index} style={{border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', margin: '1rem 0'}}>
          <label htmlFor={`npcName${index}`}>{t('npcNameLabel')}</label>
          <input id={`npcName${index}`} value={data.npcs[index]?.name || ''} onChange={(e) => handleNpcChange(index, 'name', e.target.value)} />
          <label htmlFor={`npcDesc${index}`}>{t('npcDescLabel')}</label>
          <textarea id={`npcDesc${index}`} value={data.npcs[index]?.description || ''} onChange={(e) => handleNpcChange(index, 'description', e.target.value)} style={{minHeight: '60px'}}/>
        </div>
      ))}
      
      {error && <p className="error-message">{error}</p>}

      <button type="submit" disabled={!canStart} style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.2rem' }}>
        {isLoading ? t('storyLoading') : t('startAdventure')}
      </button>
    </form>
  );
};

const Typewriter = ({ text, onFinished, instant = false }: { text: string, onFinished?: () => void, instant?: boolean }) => {
  const [displayedText, setDisplayedText] = useState('');
  const intervalIdRef = useRef<number | undefined>();

  const parseText = useCallback((textToParse: string) => {
    return textToParse
      .replace(/<<(.*?)>>/g, '<span class="stat-change">$1</span>')
      .replace(/\[\[(.*?)\]\]/g, '<span class="item">$1</span>')
      .replace(/{{(.*?)}}/g, '<span class="interactable">$1</span>');
  }, []);

  useEffect(() => {
    if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    
    if (instant || !text) {
        setDisplayedText(text || '');
        if(onFinished) onFinished();
        return;
    }
    
    setDisplayedText('');
    let i = 0;
    const typingSpeed = 25;
    intervalIdRef.current = window.setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => text.slice(0, prev.length + 1));
        i++;
      } else {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = undefined;
        if (onFinished) onFinished();
      }
    }, typingSpeed);

    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    };
  }, [text, onFinished, instant]);
  
  const handleClick = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = undefined;
      setDisplayedText(text);
      if (onFinished) onFinished();
    }
  };

  return <div className="typewriter-text" onClick={handleClick} dangerouslySetInnerHTML={{ __html: parseText(displayedText) }} />;
};

const GameScreen = ({ gameData, choices, isLoading, onChoice, theme, setTheme, t, onSaveRequest, onDownloadRequest, currentPage, setCurrentPage, error }: { gameData: GameData | null; choices: Choice[]; isLoading: boolean; onChoice: (choice: string) => void; theme: Theme; setTheme: (theme: Theme) => void; t: (key: keyof (typeof translations)['ko'], ...args: (string | number)[]) => string; onSaveRequest: () => boolean | void; onDownloadRequest: () => void; currentPage: number; setCurrentPage: (page: number) => void; error: string | null; }) => {
  const [showDirectInput, setShowDirectInput] = useState(false);
  const [directInputValue, setDirectInputValue] = useState('');
  const [activeModal, setActiveModal] = useState<'status' | 'settings' | null>(null);
  
  const scenes = gameData?.scenes || [];
  const isLastPage = currentPage === scenes.length - 1;

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (directInputValue.trim()) {
      onChoice(directInputValue.trim());
      setDirectInputValue('');
      setShowDirectInput(false);
    }
  };

  return (
    <div className="game-screen">
      {activeModal === 'status' && gameData?.playerStatus && <StatusModal playerStatus={gameData.playerStatus} onClose={() => setActiveModal(null)} t={t} />}
      {activeModal === 'settings' && <SettingsModal onClose={() => setActiveModal(null)} onSave={onSaveRequest} onDownload={onDownloadRequest} t={t} />}
      <header className="game-header">
        <div className="status-bar">
          <span>❤️ {gameData?.playerStatus.health || 100}</span>
          <span>📍 {gameData?.playerStatus.location || '...'}</span>
          <span>🕒 {gameData?.playerStatus.time || '...'}</span>
        </div>
        <div className="header-buttons">
          <button onClick={() => setActiveModal('status')} title={t('status')}>👤</button>
          <button onClick={() => setActiveModal('settings')} title={t('settings')}>⚙️</button>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title={t('themeToggle')}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>
      <main className="story-window">
        {isLoading && scenes.length === 0 ? <p className="loading-text">{t('storyLoading')}</p> : <Typewriter text={scenes[currentPage] || ''} instant={!isLastPage}/>}
      </main>
      
      {error && <p className="error-message in-game-error">{error}</p>}
      
      {scenes.length > 1 && (
        <div className="pagination">
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>{t('prevPage')}</button>
            <span>{t('pageIndicator', currentPage + 1, scenes.length)}</span>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={isLastPage}>{t('nextPage')}</button>
        </div>
      )}

      <footer className="interaction-area">
        {isLastPage && (
          isLoading ? (
            <p className="loading-text">{t('playerChoiceLoading')}</p>
          ) : showDirectInput ? (
            <form className="direct-input-area" onSubmit={handleDirectSubmit}>
              <input 
                type="text" 
                value={directInputValue} 
                onChange={(e) => setDirectInputValue(e.target.value)}
                placeholder={t('directInputPlaceholder')}
                autoFocus
              />
              <button type="submit">{t('submit')}</button>
              <button type="button" onClick={() => setShowDirectInput(false)} style={{background: 'var(--secondary-color)'}}>{t('cancel')}</button>
            </form>
          ) : (
            <div className="choices">
              {choices.map((choice, index) => (
                <button key={index} onClick={() => onChoice(choice.text)}>
                  {choice.text}
                  {choice.requires && <small style={{display: 'block', opacity: 0.8}}>({choice.requires})</small>}
                </button>
              ))}
              <button onClick={() => setShowDirectInput(true)} style={{background: 'var(--secondary-color)'}}>{t('directInputAction')}</button>
            </div>
          )
        )}
      </footer>
    </div>
  );
};

// --- MODAL COMPONENTS ---

const StatusModal = ({ playerStatus, onClose, t }: { playerStatus: PlayerStatus, onClose: () => void, t: (key: keyof (typeof translations)['ko'], ...args: (string | number)[]) => string }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>{t('statusTitle')}</h2>
        <div className="status-grid">
          <div><strong>{t('health')}</strong></div><div>❤️ {playerStatus.health} / 100</div>
          <div><strong>{t('location')}</strong></div><div>📍 {playerStatus.location}</div>
          <div><strong>{t('time')}</strong></div><div>🕒 {playerStatus.time}</div>
        </div>
        <h3 style={{marginTop: '2rem'}}>{t('inventory')}</h3>
        <ul className="inventory-list">
          {playerStatus.inventory.length > 0 ? (
            playerStatus.inventory.map((item, index) => (
              <li key={index}>
                <strong>{item.name}</strong>
                <p>{item.description}</p>
              </li>
            ))
          ) : (
            <p>{t('emptyInventory')}</p>
          )}
        </ul>
      </div>
    </div>
  );
};

const SettingsModal = ({ onClose, onSave, onDownload, t }: { onClose: () => void, onSave: () => boolean | void, onDownload: () => void, t: (key: keyof (typeof translations)['ko'], ...args: (string | number)[]) => string }) => {
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = () => {
    const success = onSave();
    if (success) {
      setSaveMessage(t('saveGameSuccess'));
      setTimeout(() => setSaveMessage(''), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>{t('settingsTitle')}</h2>
        <div className="settings-section">
          <h3>{t('gameManagement')}</h3>
          <button onClick={handleSave}>{t('saveGame')}</button>
          {saveMessage && <span style={{marginLeft: '1rem', color: 'var(--primary-color)'}}>{saveMessage}</span>}
          <button onClick={onDownload} style={{marginTop: '0.5rem'}}>{t('downloadLog')}</button>
        </div>
        <button onClick={onClose} style={{marginTop: '2rem', width: '100%', background: 'var(--secondary-color)'}}>{t('close')}</button>
      </div>
    </div>
  );
};