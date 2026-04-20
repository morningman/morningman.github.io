// JSON War — Game State (simplified — battle animation is local to BattleScene)
;(() => {

const { createContext, useContext, useReducer, useCallback, useEffect } = React;
const GameContext = createContext(null);

function defaultState() {
  return {
    screen: 'opening',      // opening | boss-intro | battle | settlement | deepdive
    level: 1,
    showVictory: false,     // triggers VictoryModal overlay
    unlockedSkills: [],
    deepDiveScreen: 0,
    deepDiveOrigin: 'settlement', // screen to return to from deepdive
    replayNonce: 0,         // bumped on REPLAY_LEVEL to force BattleScene remount
  };
}

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const saved = JSON.parse(raw);
    const lvl = Math.min(saved.highestLevel || 1, 5);
    const s = defaultState();
    s.level = lvl;
    s.unlockedSkills = saved.unlockedSkills || [];
    if (lvl > 1) s.screen = 'boss-intro';
    return s;
  } catch (e) { return defaultState(); }
}

function saveProgress(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      highestLevel: state.level,
      unlockedSkills: state.unlockedSkills,
    }));
  } catch (e) {}
}

function reducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return { ...state, screen: 'boss-intro' };

    case 'ENTER_BATTLE':
      return { ...state, screen: 'battle', showVictory: false };

    case 'UPGRADE_DONE': {
      const skill = LEVELS[state.level - 1].skill.name;
      return {
        ...state,
        unlockedSkills: state.unlockedSkills.includes(skill)
          ? state.unlockedSkills
          : [...state.unlockedSkills, skill],
      };
    }

    case 'BOSS_DEFEATED':
      return { ...state, showVictory: true };

    case 'NEXT_LEVEL': {
      if (state.level >= 5) return { ...state, screen: 'settlement', showVictory: false };
      return { ...state, screen: 'boss-intro', level: state.level + 1, showVictory: false };
    }

    case 'REPLAY_LEVEL':
      return { ...state, screen: 'boss-intro', showVictory: false, replayNonce: (state.replayNonce || 0) + 1 };

    case 'GOTO_LEVEL':
      return { ...state, screen: 'boss-intro', level: action.level, showVictory: false, replayNonce: (state.replayNonce || 0) + 1 };

    case 'SHOW_DEEPDIVE':
      return {
        ...state,
        screen: 'deepdive',
        deepDiveScreen: action.screen ?? 0,
        deepDiveOrigin: action.from || state.screen,
      };

    case 'CLOSE_DEEPDIVE':
      return { ...state, screen: state.deepDiveOrigin || 'settlement' };

    case 'DEEPDIVE_NAV':
      return { ...state, deepDiveScreen: Math.max(0, Math.min(4, state.deepDiveScreen + action.dir)) };

    case 'PLAY_AGAIN': {
      try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
      return defaultState();
    }

    default:
      return state;
  }
}

function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);
  useEffect(() => saveProgress(state), [state.level, state.unlockedSkills]);
  return React.createElement(GameContext.Provider, { value: { state, dispatch } }, children);
}

function useGame() { return useContext(GameContext); }

Object.assign(window, { GameProvider, useGame });
})();
