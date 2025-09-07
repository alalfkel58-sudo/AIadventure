export type Language = 'ko' | 'en' | 'jp';

const translations: Record<string, Record<Language, string>> = {
  // Common
  'close': { ko: '닫기', en: 'Close', jp: '閉じる' },
  'saveChanges': { ko: '변경사항 저장', en: 'Save Changes', jp: '変更を保存' },
  'cancel': { ko: '취소', en: 'Cancel', jp: 'キャンセル' },
  'send': { ko: '전송', en: 'Send', jp: '送信' },
  'retry': { ko: '재시도', en: 'Retry', jp: '再試行' },
  'day': { ko: '일차', en: 'Day', jp: '日目' },
  'succeeded': { ko: '성공', en: 'succeeded', jp: '成功' },
  'failed': { ko: '실패', en: 'failed', jp: '失敗' },
  'unspecifiedSkill': { ko: '미지정 기술', en: 'Unspecified Skill', jp: '未指定のスキル' },
  'n/a': { ko: '해당 없음', en: 'N/A', jp: '該当なし' },

  // AppHeader
  'appTitle': { ko: 'AI 어드벤처', en: 'AI Adventure', jp: 'AI アドベンチャー' },
  'viewStatus': { ko: '상태 보기', en: 'View Status', jp: 'ステータス表示' },
  'status': { ko: '상태', en: 'Status', jp: 'ステータス' },
  
  // SetupScreen
  'startStory': { ko: '이야기 시작하기', en: 'Start Story', jp: '物語を始める' },
  'setupIntro': { ko: '당신만의 세계를 설정하고 AI와 함께 모험을 떠나보세요.', en: 'Create your own world and embark on an adventure with AI.', jp: '自分だけの世界を設定し、AIと共に冒険に出かけましょう。' },
  'continueAdventure': { ko: '모험 계속하기', en: 'Continue Adventure', jp: '冒険を続ける' },
  'startNewAdventure': { ko: '새로운 모험 시작', en: 'Start New Adventure', jp: '新しい冒険を始める' },
  'geminiApiKeyOptional': { ko: 'Gemini API 키 (선택 사항)', en: 'Gemini API Key (Optional)', jp: 'Gemini APIキー（任意）' },
  'geminiApiKeyDesc': { ko: '환경 변수에 키가 없는 경우 여기에 입력하세요. 개인적인 용도로만 사용됩니다.', en: 'If you don\'t have a key in your environment variables, enter it here. Used for personal purposes only.', jp: '環境変数にキーがない場合は、ここに入力してください。個人利用のみを目的としています。' },
  'geminiApiKeyPlaceholder': { ko: 'API 키를 여기에 붙여넣으세요', en: 'Paste your API key here', jp: 'APIキーをここに貼り付けてください' },
  'chooseModel': { ko: 'AI 모델 선택', en: 'Choose AI Model', jp: 'AIモデルを選択' },
  'modelDesc': { ko: 'Pro는 더 강력하지만 비용이 더 많이 듭니다.', en: 'Pro is more powerful, but costs more.', jp: 'Proはより強力ですが、コストがかかります。' },
  'storyGenre': { ko: '이야기 장르', en: 'Story Genre', jp: '物語のジャンル' },
  'genrePlaceholder': { ko: '예: SF, 판타지, 좀비 아포칼립스', en: 'e.g., Sci-Fi, Fantasy, Zombie Apocalypse', jp: '例：SF、ファンタジー、ゾンビアポカリプス' },
  'playerPersona': { ko: '플레이어 설정 (페르소나)', en: 'Player Setup (Persona)', jp: 'プレイヤー設定（ペルソナ）' },
  'personaPlaceholder': { ko: '예: 기억을 잃은 전직 특수요원', en: 'e.g., An amnesiac former special agent', jp: '例：記憶を失った元特殊工作員' },
  'worldBackground': { ko: '이야기의 배경 정보 (세계관)', en: 'Story Background (Worldview)', jp: '物語の背景情報（世界観）' },
  'backgroundPlaceholder': { ko: '예: 2077년, 거대 기업이 지배하는 디스토피아', en: 'e.g., The year 2077, a dystopia ruled by mega-corporations', jp: '例：2077年、巨大企業が支配するディストピア' },
  'storyIntro': { ko: '이야기의 시작 (인트로)', en: 'Story Start (Intro)', jp: '物語の始まり（イントロ）' },
  'introPlaceholder': { ko: '예: 낯선 행성에서 눈을 뜬다', en: 'e.g., Waking up on a strange planet', jp: '例：見知らぬ惑星で目を覚ます' },
  'numChars': { ko: '주요 등장인물 수 (플레이어 제외)', en: 'Number of Main Characters (excluding player)', jp: '主な登場人物の数（プレイヤーを除く）' },
  'charNameLabel': { ko: '등장인물 {index} 이름', en: 'Character {index} Name', jp: '登場人物{index}の名前' },
  'charNamePlaceholder': { ko: '예: 제이크, 엘라라', en: 'e.g., Jake, Elara', jp: '例：ジェイク、エララ' },
  'charDescLabel': { ko: '등장인물 {index} 설정', en: 'Character {index} Setup', jp: '登場人物{index}の設定' },
  'charDescPlaceholder': { ko: '예: 냉소적이지만 실력 있는 용병. 과거에 플레이어와 악연이 있다.', en: 'e.g., A cynical but skilled mercenary. Has a bad history with the player.', jp: '例：冷笑的だが腕利きの傭兵。過去にプレイヤーと因縁がある。' },
  'startAdventure': { ko: '모험 시작', en: 'Start Adventure', jp: '冒険を開始' },
  'fillAllFieldsError': { ko: '모든 항목을 입력해주세요.', en: 'Please fill in all fields.', jp: 'すべての項目を入力してください。' },
  'language': { ko: '언어', en: 'Language', jp: '言語' },
  'customSystemPrompt': { ko: '커스텀 시스템 프롬프트', en: 'Custom System Prompt', jp: 'カスタムシステムプロンプト' },
  'customSystemPromptPlaceholder': { ko: 'AI의 행동을 제어하기 위한 특별 지침을 여기에 입력하세요...', en: 'Enter special instructions to control AI behavior here...', jp: 'AIの行動を制御するための特別な指示をここに入力してください...' },


  // GameScreen
  'generatingStory': { ko: '이야기를 생성하는 중...', en: 'Generating story...', jp: '物語を生成中...' },
  'customChoicePlaceholder': { ko: '원하는 행동을 직접 입력하세요...', en: 'Enter your custom action...', jp: '希望の行動を直接入力してください...' },
  'writeChoice': { ko: '직접 선택지를 작성...', en: 'Write a custom choice...', jp: '選択肢を直接作成...' },
  'prevPage': { ko: '← 이전', en: '← Prev', jp: '← 前へ' },
  'nextPage': { ko: '다음 →', en: 'Next →', jp: '次へ →' },
  'typing': { ko: '진행 중...', en: 'Typing...', jp: '進行中...' },
  'storyEnd': { ko: '이야기 끝', en: 'Story End', jp: '物語の終わり' },
  'clickForNext': { ko: '다음 페이지로...', en: 'Click for next page...', jp: '次のページへ...' },

  // StatPanel
  'playerStatus': { ko: '플레이어 상태', en: 'Player Status', jp: 'プレイヤーステータス' },
  'stats': { ko: '능력치', en: 'Stats', jp: '能力値' },
  'inventory': { ko: '소지품', en: 'Inventory', jp: '所持品' },
  'viewDescription': { ko: '설명 보기', en: 'View description', jp: '説明を見る' },
  'emptyInventory': { ko: '주머니가 비어있습니다.', en: 'Your pockets are empty.', jp: 'ポケットは空です。' },

  // End Screen
  'theEnd': { ko: 'The End', en: 'The End', jp: '終' },
  'downloadLog': { ko: '이야기 로그 다운로드', en: 'Download Story Log', jp: '物語ログをダウンロード' },
  'startNewStory': { ko: '새로운 이야기 시작하기', en: 'Start a New Story', jp: '新しい物語を始める' },
  
  // Settings Modal
  'settings': { ko: '설정', en: 'Settings', jp: '設定' },
  'gameManagement': { ko: '게임 관리', en: 'Game Management', jp: 'ゲーム管理' },
  'saveStory': { ko: '이야기 저장하기', en: 'Save Story', jp: '物語を保存' },
  'gameSaved': { ko: '게임이 현재 상태로 브라우저에 저장되었습니다. 앱을 닫았다가 다시 열면 "모험 계속하기"로 이어서 할 수 있습니다.', en: 'Game saved to browser. You can continue from this point by clicking "Continue Adventure" after reopening the app.', jp: 'ゲームがブラウザに保存されました。アプリを再起動後、「冒険を続ける」で続きからプレイできます。' },
  'debug': { ko: '디버그', en: 'Debug', jp: 'デバッグ' },
  'debugMode': { ko: '디버그 모드 활성화', en: 'Enable Debug Mode', jp: 'デバッグモードを有効化' },
  'enabled': { ko: '활성화됨', en: 'Enabled', jp: '有効' },
  'disabled': { ko: '비활성화됨', en: 'Disabled', jp: '無効' },
  'aiModel': { ko: 'AI 모델', en: 'AI Model', jp: 'AIモデル' },
  'storyControl': { ko: '이야기 제어', en: 'Story Control', jp: '物語の制御' },
  'viewCurrentSummary': { ko: '현재 요약 보기', en: 'View Current Summary', jp: '現在の要約を表示' },
  'noSummary': { ko: '아직 생성된 요약이 없습니다. 이야기가 충분히 길어지면 자동으로 생성됩니다.', en: 'No summary has been generated yet. It will be created automatically once the story is long enough.', jp: 'まだ要約は生成されていません。物語が十分に長くなると自動的に生成されます。' },
  'nextStoryDirection': { ko: '다음 이야기 방향성', en: 'Next Story Direction', jp: '次の物語の方向性' },
  'directionPlaceholder': { ko: 'AI에게 다음 장면에 대한 구체적인 지시를 내릴 수 있습니다.', en: 'You can give the AI specific instructions for the next scene.', jp: 'AIに次のシーンに関する具体的な指示を与えることができます。' },
  'storySettings': { ko: '이야기 설정', en: 'Story Settings', jp: '物語の設定' },
  'saveAndApply': { ko: '변경사항 저장 및 적용', en: 'Save and Apply Changes', jp: '変更を保存して適用' },

  // Debug Modal
  'debugPrompt': { ko: 'Debug Prompt', en: 'Debug Prompt', jp: 'デバッグプロンプト' },
  'contextReadOnly': { ko: 'Context (Read-only)', en: 'Context (Read-only)', jp: 'コンテキスト（読み取り専用）' },
  'finalPromptEditable': { ko: 'Final User Prompt (Editable)', en: 'Final User Prompt (Editable)', jp: '最終ユーザープロンプト（編集可能）' },
  'fullPromptEditable': { ko: '전체 프롬프트 (편집 가능)', en: 'Full Prompt (Editable)', jp: '完全なプロンプト（編集可能）' },

  // useGameEngine alerts/errors
  'saveOnlyDuringPlay': { ko: '게임 중에만 저장할 수 있습니다.', en: 'You can only save while playing.', jp: 'ゲーム中にのみ保存できます。' },
  'saveFailed': { ko: '게임 저장에 실패했습니다.', en: 'Failed to save game.', jp: 'ゲームの保存に失敗しました。' },
  'noSaveFile': { ko: '저장된 게임이 없습니다.', en: 'No saved game found.', jp: '保存されたゲームがありません。' },
  'loadFailedNoApiKey': { ko: 'API 키를 찾을 수 없어 게임을 로드할 수 없습니다.', en: 'Cannot load game because the API key was not found.', jp: 'APIキーが見つからないため、ゲームをロードできません。' },
  'loadFailedCorrupt': { ko: '게임 로딩에 실패했습니다. 저장 파일이 손상되었을 수 있습니다.', en: 'Failed to load game. The save file may be corrupted.', jp: 'ゲームの読み込みに失敗しました。セーブファイルが破損している可能性があります。' },
  'apiKeyNotSet': { ko: 'Gemini API 키가 설정되지 않았습니다. UI에 입력하거나 환경 변수를 설정해주세요.', en: 'Gemini API key is not set. Please enter it in the UI or set the environment variable.', jp: 'Gemini APIキーが設定されていません。UIで入力するか、環境変数を設定してください。' },
};

export const t = (key: string, lang: Language, options?: { [key: string]: string | number }): string => {
  let text = translations[key]?.[lang] || key;
  if (options) {
    Object.keys(options).forEach(optKey => {
      text = text.replace(`{${optKey}}`, String(options[optKey]));
    });
  }
  return text;
};