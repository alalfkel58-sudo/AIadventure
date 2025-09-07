import { useState, useMemo, useCallback } from 'react';
import { GameState, PlayerState, Choice, Content, GameSetup, Language } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { t } from '../lib/i18n';

const getSystemInstruction = (lang: Language, customInstruction?: string): string => {
    const langMap = {
        'ko': 'KOREAN',
        'en': 'ENGLISH',
        'jp': 'JAPANESE'
    };
    const targetLang = langMap[lang];

    const baseInstruction = `You are a master storyteller and game master for a dynamic text-based adventure game. Your goal is to create an immersive, engaging, and coherent narrative in ${targetLang} based on the user's initial setup and subsequent choices. You MUST respond with a valid JSON object that adheres to the provided schema. Do not output any text, conversational filler, or acknowledgements outside of the JSON object. Your response must begin directly with { and end with }.

Game Rules:
1.  **Maintain State:** The playerState you receive reflects the current situation. Your response MUST include an updated playerState. You can add, remove, or change stats and inventory items as the story dictates.
2.  **Story Progression:** The dialogue should describe the outcome of the player's last choice and set up the next situation.
3.  **Meaningful Choices:** Provide 2-4 distinct and interesting choices that lead the story in different directions.
4.  **Genre Adherence:** Stick to the genre defined by the player.
5.  **Language:** All story content (dialogue, playerState keys/values, choices text/description) MUST be in ${targetLang}.
6.  **Be Creative:** Introduce challenges, characters, and plot twists. An ending (isEnding: true) should only occur at a natural, climactic story conclusion.
7.  **Pacing:** Combine related sentences into a single, cohesive paragraph. Each string in the 'dialogue' array should be a substantial paragraph, not just one sentence. Avoid creating too many short, separate dialogue entries.
8.  **Primary Stat:** Depending on the genre, maintain a primary player stat called '체력' (Health) for action/adventure genres, or '호감도' (Affection/Favorability) for romance/social genres. This stat should be numeric and typically range from 0 to 10.
9.  **Utilize Stat/Inventory Checks:** Create situations where the success or failure of an action is determined by the player's stats (e.g., '힘' to lift a heavy object) or a specific inventory item (e.g., a '열쇠' to open a door). The outcome must be described in the dialogue.
10. **Stat Change Styling:** When a player's stat changes, you MUST enclose the descriptive text in double angle brackets, like <<Your Strength has increased by 1>> or <<체력이 1 증가했습니다>>. This allows the UI to apply a special visual effect. Do not use parentheses for this.
11. **Skill Checks:** For actions that could succeed or fail, you can create a skill check. Set 'isSkillCheck' to true and provide the 'skill' to use and the 'successChance' percentage (0-100). The game engine will handle the outcome and tell you if it succeeded or failed. Do not describe the outcome of the skill check yourself, only set up the choice for it.
12. **Player-Initiated Skill Checks:** If the player writes their own action (a custom choice) that implies a chance of success or failure (e.g., "I try to pick the lock," "I attempt to persuade the guard with a 75% chance"), your response MUST be a single choice that formalizes this into a skill check. This choice must have 'isSkillCheck: true', and you should determine an appropriate 'skill' and 'successChance' based on the player's action and stats. Do NOT narrate the outcome of the attempt. The game engine requires the skill check choice to perform the roll.`;
    
    let finalInstruction = baseInstruction;
    if (customInstruction) {
        finalInstruction += `\n\n**Custom User Instructions (CRITICAL):**\n${customInstruction}`;
    }
    return finalInstruction;
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    dialogue: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "The next part of the story dialogue. Each string is a new paragraph or line.",
    },
    playerState: {
      type: Type.OBJECT,
      properties: {
        stats: {
          type: Type.ARRAY,
          description: "An array of objects representing player stats. For numeric values, provide them as strings.",
          items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING, description: "The name of the stat (e.g., '체력')." },
              value: { type: Type.STRING, description: "The value of the stat (e.g., '10', '높음')." }
            },
            required: ['key', 'value']
          }
        },
        inventory: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of items the player currently has.",
        },
        itemDescriptions: {
          type: Type.ARRAY,
          description: "An array of objects for item descriptions.",
           items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING, description: "The name of the item (e.g., '낡은 지도')." },
              value: { type: Type.STRING, description: "The description of the item." }
            },
            required: ['key', 'value']
          }
        },
        currentLocation: { type: Type.STRING, description: "The player's current location." },
        day: { type: Type.INTEGER, description: "The current day number." },
        timeOfDay: { type: Type.STRING, description: "The current time of day, e.g., '아침', '점심', '저녁'." }
      },
      required: ["stats", "inventory", "itemDescriptions", "currentLocation", "day", "timeOfDay"]
    },
    choices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "The text for the choice button.",
          },
          description: {
            type: Type.STRING,
            description: "A short, optional description of the choice's potential outcome or requirement."
          },
          isSkillCheck: { type: Type.BOOLEAN, description: "Set to true if this choice is a skill check with a chance of success." },
          skill: { type: Type.STRING, description: "For skill checks, the player stat to use (e.g., '힘')." },
          successChance: { type: Type.INTEGER, description: "For skill checks, the percentage chance of success (0-100)." },
        },
        required: ["text"]
      },
      description: "A list of 2 to 4 choices for the player to make.",
    },
    isEnding: {
      type: Type.BOOLEAN,
      description: "Set to true if this is a definitive end to the story (good or bad)."
    }
  },
  required: ["dialogue", "playerState", "choices", "isEnding"],
};


const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Setup);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [currentChoices, setCurrentChoices] = useState<Choice[]>([]);
  const [dialogueHistory, setDialogueHistory] = useState<string[]>([]);
  const [storyHistory, setStoryHistory] = useState<Content[]>([]);

  const [isTyping, setIsTyping] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugPrompt, setDebugPrompt] = useState<Content[] | null>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [gameSetup, setGameSetup] = useState<GameSetup | null>(null);
  const [model, setModel] = useState<'gemini-2.5-flash' | 'gemini-2.5-pro'>('gemini-2.5-flash');
  const [lastRequest, setLastRequest] = useState<Content[] | null>(null);
  const [pendingSetupUpdate, setPendingSetupUpdate] = useState<GameSetup | null>(null);
  const [storyDirection, setStoryDirection] = useState('');
  const [lang, setLang] = useState<Language>('ko');


  const pages = useMemo(() => {
    if (dialogueHistory.length === 0) return [['']];
    return dialogueHistory.map(line => [line]);
  }, [dialogueHistory]);

  const processAIResponse = (responseText: string) => {
    try {
      setLastRequest(null); // Clear last request on success
      const responseJson = JSON.parse(responseText);
      const { dialogue, playerState: aiPlayerState, choices, isEnding } = responseJson;
      
      const convertedStats: Record<string, string | number> = {};
      if (Array.isArray(aiPlayerState.stats)) {
          for (const stat of aiPlayerState.stats) {
              if (stat.key && stat.value !== undefined) {
                  const numericValue = parseFloat(stat.value);
                  convertedStats[stat.key] = isNaN(numericValue) ? stat.value : numericValue;
              }
          }
      }

      const convertedItemDescriptions: Record<string, string> = {};
      if (Array.isArray(aiPlayerState.itemDescriptions)) {
          for (const item of aiPlayerState.itemDescriptions) {
              if (item.key && item.value) {
                  convertedItemDescriptions[item.key] = item.value;
              }
          }
      }
      
      const finalPlayerState: PlayerState = {
        ...aiPlayerState,
        stats: convertedStats,
        itemDescriptions: convertedItemDescriptions,
      };
      
      setPlayerState(finalPlayerState);
      setCurrentChoices(choices);
      
      // Combine new dialogue lines into a single page for better pacing
      const newDialogueBlock = dialogue.join('\n\n');
      const newHistory = [...dialogueHistory, newDialogueBlock];
      setDialogueHistory(newHistory);
      setCurrentPage(dialogueHistory.length); // Go to the start of the new content
      setIsTyping(true);

      if (isEnding) {
        setGameState(GameState.Ended);
        try { localStorage.removeItem('ai-adventure-save'); } catch (e) { console.warn(e); }
      }
      
      setStoryHistory(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);

    } catch (error) {
      console.error("Failed to parse AI response:", error, "Raw text:", responseText);
      const errorDialogue = ["Fatal Error: Could not process AI response. The format may be incorrect."];
      setDialogueHistory(prev => [...prev, ...errorDialogue]);
      setCurrentChoices([{ text: "Retry" }]);
    }
  };
  
  const summarizeHistory = async (historyToSummarize: Content[]): Promise<string> => {
    if (!ai) return "Summary failed: AI not initialized.";
    
    const langMap = { 'ko': 'Korean', 'en': 'English', 'jp': 'Japanese' };
    const targetLang = langMap[lang];
    const summarizationPrompt = `Please summarize the following game story history concisely in ${targetLang}. Capture all key plot points, character status, locations, and inventory items. This summary will be used as context for the next part of the story.\n\nSTORY SO FAR:\n\n${historyToSummarize.map(c => `${c.role}: ${c.parts[0].text}`).join('\n')}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: summarizationPrompt
        });
        return response.text;
    } catch (error) {
        console.error("Failed to summarize history:", error);
        return "Failed to generate summary.";
    }
  }

  const callAI = async (history: Content[], aiOverride?: GoogleGenAI) => {
    const aiInstance = aiOverride || ai;
    if (!aiInstance) {
      console.error("AI not initialized, cannot make API call.");
      const errorDialogue = ["Fatal Error: AI engine not configured. Please check your API key."];
      setDialogueHistory(prev => [...prev, ...errorDialogue]);
      return;
    }

    setIsNavigating(true);
    setCurrentChoices([]);
    setLastRequest(history);

    try {
      const response = await aiInstance.models.generateContent({
        model: model,
        contents: history,
        config: {
          systemInstruction: getSystemInstruction(lang, gameSetup?.customSystemInstruction),
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.9,
        },
      });
      processAIResponse(response.text);
    } catch (error) {
      console.error("Gemini API call failed:", error);
       const errorDialogue = ["Fatal Error: Failed to connect to AI. Please verify your API key is valid, check your internet connection, and try again later."];
       setDialogueHistory(prev => [...prev, ...errorDialogue]);
       setCurrentChoices([{ text: "Retry" }]);
    } finally {
      setIsNavigating(false);
    }
  };

  const startGame = useCallback(async (setup: GameSetup) => {
    try { localStorage.removeItem('ai-adventure-save'); } catch(e) { console.warn(e); }
    const finalApiKey = setup.apiKey || process.env.API_KEY;

    if (!finalApiKey) {
        alert(t('apiKeyNotSet', setup.lang));
        return;
    }
    
    setGameSetup(setup);
    setModel(setup.model);
    setLang(setup.lang);

    const newAi = new GoogleGenAI({ apiKey: finalApiKey });
    setAi(newAi);

    setGameState(GameState.Playing);
    setDialogueHistory([]);
    setStoryHistory([]);
    setCurrentPage(0);

    const characterDetails = setup.characterNames.map((name, index) => 
        `- ${name}: ${setup.characterDescriptions[index]}`
    ).join('\n');

    const initialPrompt = `Start a new story with the following detailed setup:
- Genre: ${setup.genre}
- Player Persona: ${setup.persona}
- Background Setting: ${setup.background}
- Main Characters (in addition to the player):\n${characterDetails}
- Story Introduction: ${setup.intro}

Generate the very first scene of the story in the designated language. The player state should reflect the persona and starting situation.`;
    
    const initialHistory: Content[] = [{ role: 'user', parts: [{ text: initialPrompt }] }];
    
    if (isDebugMode) {
      setDebugPrompt(initialHistory);
      setIsDebugging(true);
    } else {
      setStoryHistory(initialHistory);
      await callAI(initialHistory, newAi);
    }
  }, [isDebugMode]);
  
  const executeChoice = async (prompt: string, currentStoryHistory: Content[]) => {
      let fullHistory: Content[] = [...currentStoryHistory];
      const modelLang = lang === 'ko' ? "알겠습니다." : "Understood.";

      const gameMasterNotes: string[] = [];
      if (pendingSetupUpdate) {
          gameMasterNotes.push(`The story's core parameters have been updated. Please adhere to these new settings from this point forward.\n- Genre: ${pendingSetupUpdate.genre}\n- Player Persona: ${pendingSetupUpdate.persona}\n- Background: ${pendingSetupUpdate.background}\n- Characters: ${pendingSetupUpdate.characterNames.map((n, i) => `${n} (${pendingSetupUpdate.characterDescriptions[i]})`).join(', ')}\n- Custom Instruction: ${pendingSetupUpdate.customSystemInstruction || 'N/A'}`);
          setGameSetup(pendingSetupUpdate);
          setPendingSetupUpdate(null);
      }
      if (storyDirection) {
        gameMasterNotes.push(`The player has provided a specific direction for the next scene: "${storyDirection}". Please incorporate this direction into the story's continuation.`);
        setStoryDirection(''); // Clear after use
      }

      if (gameMasterNotes.length > 0) {
          const updateLog = `(Game Master Note: The following instructions are critical. Apply them silently to the story's continuation. Do NOT output any conversational filler, acknowledgements, or confirmation messages like "Understood." Your response must begin directly with the valid JSON object based on the player's last choice.)\n\n${gameMasterNotes.join('\n\n')}`;
          fullHistory.push({ role: 'user', parts: [{ text: updateLog }] });
          // To ensure the model sees this, we add a placeholder model response
          fullHistory.push({ role: 'model', parts: [{ text: "{\"dialogue\": [\"...\"], \"playerState\": {}, \"choices\": [], \"isEnding\": false}" }] });
      }
      
      fullHistory.push({ role: 'user', parts: [{ text: prompt }] });
      
      let historyForAPI: Content[] = fullHistory;
      
      const HISTORY_LIMIT = 10;
      if (fullHistory.length > HISTORY_LIMIT) {
          console.log("Summarizing history to save tokens...");
          const summary = await summarizeHistory(currentStoryHistory);
          const lastUserInteraction = fullHistory.slice(-1);
          
          const summaryUserContent: Content = { role: 'user', parts: [{ text: `This is a summary of the story so far:\n${summary}` }] };
          const summaryModelContent: Content = { role: 'model', parts: [{ text: modelLang }] };

          const newStoryHistory: Content[] = [
            summaryUserContent,
            summaryModelContent,
            ...lastUserInteraction,
          ];
          historyForAPI = newStoryHistory;
          setStoryHistory(newStoryHistory);
      } else {
          setStoryHistory(fullHistory);
      }
      
      await callAI(historyForAPI);
  }
  
  const handleChoice = useCallback(async (choice: Choice) => {
    if (isTyping || !ai || isNavigating) return;
    setIsTyping(false);
    
    if (choice.text === "Retry" && lastRequest) {
        await callAI(lastRequest);
        return;
    }
    
    let prompt: string;

    if (choice.isSkillCheck && choice.successChance !== undefined) {
        const roll = Math.floor(Math.random() * 100) + 1; // 1-100
        const success = roll <= choice.successChance;
        const outcome = success ? t('succeeded', lang) : t('failed', lang);
        const skill = choice.skill || t('unspecifiedSkill', lang);
        const statValue = playerState?.stats[skill] ?? t('n/a', lang);

        prompt = `(The player attempted: "${choice.text}". This was a skill check using '${skill}' (Player's Stat: ${statValue}) with a ${choice.successChance}% chance. The player rolled ${roll} and ${outcome}.)\n\nDescribe the narrative outcome of this ${outcome} attempt and continue the story.`;
    } else {
        prompt = `My choice is: "${choice.text}"\n\nAlso consider this optional description of my intent: "${choice.description || 'N/A'}"\n\nContinue the story.`;
    }
    
    if (isDebugMode) {
      const historyForDebug: Content[] = [...storyHistory, { role: 'user', parts: [{ text: prompt }] }];
      setDebugPrompt(historyForDebug);
      setIsDebugging(true);
    } else {
      await executeChoice(prompt, storyHistory);
    }
  }, [isTyping, isNavigating, storyHistory, isDebugMode, ai, lastRequest, storyDirection, pendingSetupUpdate, lang, playerState]);
  
  const confirmSendPrompt = (editedHistory: Content[]) => {
      setIsDebugging(false);
      setDebugPrompt(null);
      if (!ai) return;
      
      if (dialogueHistory.length === 0) {
          setStoryHistory(editedHistory);
          callAI(editedHistory);
          return;
      }

      let lastUserPartIndex = -1;
      for (let i = editedHistory.length - 1; i >= 0; i--) {
        if (editedHistory[i].role === 'user') {
          lastUserPartIndex = i;
          break;
        }
      }
      
      if (lastUserPartIndex > -1) {
        const lastUserPart = editedHistory[lastUserPartIndex];
        const promptText = lastUserPart.parts[0].text;
        const historyContext = editedHistory.slice(0, lastUserPartIndex);
        executeChoice(promptText, historyContext);
      }
  };

  const changeModel = (newModel: 'gemini-2.5-flash' | 'gemini-2.5-pro') => {
      setModel(newModel);
      setPendingSetupUpdate(prev => ({ ...prev!, model: newModel }));
  };

  const updateGameSetup = (newSetup: GameSetup) => {
      setPendingSetupUpdate(newSetup);
  };
  
  const getCurrentSummary = useCallback((): string => {
    // Search from the end to find the most recent summary
    for (let i = storyHistory.length - 1; i >= 0; i--) {
        const content = storyHistory[i];
        if (content.role === 'user' && content.parts[0].text.startsWith("This is a summary of the story so far:")) {
            return content.parts[0].text.replace("This is a summary of the story so far:\n", "");
        }
    }
    return t('noSummary', lang);
  }, [storyHistory, lang]);

  const customSetCurrentPage = (page: number) => {
    if (page !== currentPage) {
      setIsTyping(true);
    }
    setCurrentPage(page);
  };

  const saveGame = () => {
    if (gameState !== GameState.Playing || isNavigating) {
        alert(t('saveOnlyDuringPlay', lang));
        return;
    }
    try {
        const stateToSave = {
            gameState, playerState, currentChoices, dialogueHistory, storyHistory,
            currentPage, gameSetup, model, lang
        };
        localStorage.setItem('ai-adventure-save', JSON.stringify(stateToSave));
        return true;
    } catch (error) {
        console.error("Failed to save game:", error);
        alert(t('saveFailed', lang));
        return false;
    }
  };

  const loadGame = () => {
    try {
        const savedData = localStorage.getItem('ai-adventure-save');
        if (!savedData) {
            alert(t('noSaveFile', lang));
            return;
        }
        const saved = JSON.parse(savedData);
        
        const finalApiKey = saved.gameSetup.apiKey || process.env.API_KEY;
        if (!finalApiKey) {
            alert(t('loadFailedNoApiKey', saved.lang || 'en'));
            return;
        }
        
        const newAi = new GoogleGenAI({ apiKey: finalApiKey });
        setAi(newAi);
        
        setGameState(saved.gameState);
        setPlayerState(saved.playerState);
        setCurrentChoices(saved.currentChoices);
        setDialogueHistory(saved.dialogueHistory);
        setStoryHistory(saved.storyHistory);
        setCurrentPage(saved.currentPage);
        setGameSetup(saved.gameSetup);
        setModel(saved.model);
        setLang(saved.lang || 'ko');
        setIsTyping(true); // Start typing the loaded page
    } catch (error) {
        console.error("Failed to load game:", error);
        alert(t('loadFailedCorrupt', lang));
        localStorage.removeItem('ai-adventure-save');
    }
  };
  
  const showChoices = !isTyping && !isNavigating && currentChoices.length > 0 && (pages.length === 0 || currentPage === pages.length - 1);

  return {
    gameState,
    playerState,
    pages,
    currentPage,
    setCurrentPage: customSetCurrentPage,
    currentChoices: showChoices ? currentChoices : [],
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
    cancelDebug: () => setIsDebugging(false),
    gameSetup,
    model,
    changeModel,
    updateGameSetup,
    setStoryDirection,
    getCurrentSummary,
    saveGame,
    loadGame,
    storyHistory,
    lang, // Expose lang
    setLang, // Expose setLang for setup screen
  };
};

export default useGameEngine;