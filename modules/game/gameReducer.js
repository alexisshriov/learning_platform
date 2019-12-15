import {
  SELECT_GAME, SET_GAME, UNSET_GAME, CLICK_START_GAME, FETCH_GAME_DATA, SET_GAME_DATA, HIT_PAYWALL,
  START_GAME, PAUSE_GAME, RESUME_GAME, RESTART_GAME,
  AUTOSTART_GAME,
  USE_DETAIL_PAGE_ONBOARDING_VIEW,
  SET_NEW_BADGES_ENDGAME, SET_NEW_SKILL_MASTERY_ENDGAME
} from './gameActions';

const initialState = {
  selectedGame: null,
  selectedGameData: {},
  currentGame: null,
  currentGameData: {},
  gameLoadState: null,
  playedFirstGame:false,
  paused: false,
  paywallHit: true,
  autostart: false,
  detailPageOnboardingView: (window.kidframe && window.kidframe.embedMode && window.kidframe.embedMode==='detail') ? true : false,
    // true for first game played when kidframe is embedded on detail pages
  newBadges: 'pending',
  newSkillMastery: null
};

export const game = (state = initialState, action) => {
  switch (action.type) {

    case SELECT_GAME:
      return {
        ...state,
        selectedGame: (action.payload && ('game' in action.payload) ? action.payload.game : initialState.selectedGame),
        selectedGameData: (action.payload && ('data' in action.payload) ? action.payload.data : {}),
      };
      break;

    case SET_GAME:
      return {
        ...state,
        currentGame: (action.payload && ('game' in action.payload) ? action.payload.game : state.currentGame),
        currentGameData: (action.payload && ('data' in action.payload) ? action.payload.data : {}),
        gameLoadState: 'set'
      };
      break;

    case UNSET_GAME:
      return {
        ...state,
        currentGame: initialState.currentGame,
        currentGameData: initialState.currentGameData,
        gameLoadState: initialState.gameLoadState,
        paused: false
      };
      break;

    case CLICK_START_GAME:
      return {
        ...state,
        gameLoadState: (state.gameLoadState==='set' ? 'willFetch' : state.gameLoadState),
        paused: false
      };
      break;

    case FETCH_GAME_DATA:
      return {
        ...state,
        gameLoadState: (state.gameLoadState==='set' || state.gameLoadState==='willFetch' ? 'fetching' : state.gameLoadState),
        paused: false
      };
      break;

    case SET_GAME_DATA:
      return {
        ...state,
        paywallHit: false,
        currentGameData: action.payload,
        gameLoadState: 'willLoadTemplate',
        paused: false
      };
      break;

    case HIT_PAYWALL:
      return {
        ...state,
        paywallHit: action.payload
      };

    case START_GAME:
      return {
        ...state,
        playedFirstGame: true,
        gameLoadState: (state.gameLoadState==='playing-loadTemplate' || state.gameLoadState==='playing') ? 'playing' : 'playing-loadTemplate',
        paused: false
      };
      break;

    case PAUSE_GAME:
      return {
        ...state,
        paused: true
      };
      break;

    case RESUME_GAME:
      return {
        ...state,
        paused: false
      };
      break;

    case RESTART_GAME:
      return {
        ...state,
        gameLoadState: 'restart'
      };
      break;

    case AUTOSTART_GAME:
      return {
        ...state,
        autostart: action.payload
      };

    case SET_NEW_BADGES_ENDGAME:
      return {
        ...state,
        newBadges: action.payload
      };
      break;

    case USE_DETAIL_PAGE_ONBOARDING_VIEW:
      return {
        ...state,
        detailPageOnboardingView: action.payload
      };
      break;

    case SET_NEW_SKILL_MASTERY_ENDGAME:
      return {
        ...state,
        newSkillMastery: action.payload
      };
      break;

    default:
      return state;
  }
};
