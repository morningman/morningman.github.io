// game/state.js — React game state (plain JS, no JSX)

const { createContext, useContext, useReducer, useEffect, useMemo, useCallback } = React;

const INITIAL_STATE = {
  stage: 'intro',
  city: undefined,
  checkIn: undefined,
  budget: undefined,
  level2Triggered: false,
  level3Fused: false,
  hasWon: false,
  deepDiveScreen: 1,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CITY':
      return { ...state, city: action.city, level2Triggered: false, level3Fused: false, hasWon: false };
    case 'SET_CHECKIN':
      return { ...state, checkIn: action.checkIn, level2Triggered: false, level3Fused: false, hasWon: false };
    case 'SET_BUDGET':
      return { ...state, budget: action.budget, level2Triggered: false, level3Fused: false, hasWon: false };
    case 'GO_TO_STAGE':
      return { ...state, stage: action.stage };
    case 'TRIGGER_LEVEL2':
      return { ...state, level2Triggered: true };
    case 'FUSE_LEVEL3':
      return { ...state, level3Fused: true };
    case 'WIN':
      return { ...state, hasWon: true, stage: 'finish' };
    case 'OPEN_DEEP_DIVE':
      return { ...state, stage: 'deepdive', deepDiveScreen: 1 };
    case 'SET_DEEP_DIVE_SCREEN':
      return { ...state, deepDiveScreen: Math.max(1, Math.min(5, action.screen)) };
    case 'RETURN_TO_FINISH':
      return { ...state, stage: 'finish' };
    case 'REPLAY':
      return { ...INITIAL_STATE };
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}

function computeConfidence(s) {
  const picks = [s.city, s.checkIn, s.budget].filter(Boolean).length;
  let v = picks * 16;
  if (picks === 3) v = 50;
  if (s.level2Triggered) v = 72;
  if (s.level3Fused || s.hasWon) v = 100;
  return v;
}

const STORAGE_KEY = 'doris-hybrid-search-v2';

const GameContext = createContext(null);

function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Hydrate from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: 'HYDRATE', state: JSON.parse(raw) });
    } catch {}
  }, []);

  // Persist on every change
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const confidence = useMemo(() => computeConfidence(state), [state]);
  const value = useMemo(() => ({ state, dispatch, confidence }), [state, confidence]);

  return React.createElement(GameContext.Provider, { value }, children);
}

function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame outside GameProvider');
  return ctx;
}

function useGameActions() {
  const { dispatch } = useGame();
  return useMemo(() => ({
    setCity:          city    => dispatch({ type: 'SET_CITY', city }),
    setCheckIn:       checkIn => dispatch({ type: 'SET_CHECKIN', checkIn }),
    setBudget:        budget  => dispatch({ type: 'SET_BUDGET', budget }),
    goToStage:        stage   => dispatch({ type: 'GO_TO_STAGE', stage }),
    triggerLevel2:    ()      => dispatch({ type: 'TRIGGER_LEVEL2' }),
    fuseLevel3:       ()      => dispatch({ type: 'FUSE_LEVEL3' }),
    win:              ()      => dispatch({ type: 'WIN' }),
    openDeepDive:     ()      => dispatch({ type: 'OPEN_DEEP_DIVE' }),
    setDeepDiveScreen: screen => dispatch({ type: 'SET_DEEP_DIVE_SCREEN', screen }),
    returnToFinish:   ()      => dispatch({ type: 'RETURN_TO_FINISH' }),
    replay:           ()      => dispatch({ type: 'REPLAY' }),
  }), [dispatch]);
}

function scrollToStage(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = el.getBoundingClientRect().top + window.pageYOffset - 56;
  window.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
}

Object.assign(window, { GameContext, GameProvider, useGame, useGameActions, computeConfidence, scrollToStage });
