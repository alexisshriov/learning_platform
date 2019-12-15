export const SELECT_GAME = "game/selectGame";
export const SET_GAME = "game/setGame";
export const UNSET_GAME = "game/unsetGame";
export const CLICK_START_GAME = "game/clickStartGame";
export const FETCH_GAME_DATA = "game/fetchGameData";
export const HIT_PAYWALL = "game/hitPaywall";
export const SET_GAME_DATA = "game/setGameData";
export const START_GAME = "game/startGame";
export const PAUSE_GAME = "game/pauseGame";
export const RESUME_GAME = "game/resumeGame";
export const RESTART_GAME = "game/restartGame";
export const AUTOSTART_GAME = "game/autostartGame";
export const SET_NEW_BADGES_ENDGAME = "game/setNewBadgesEndGame";
export const USE_DETAIL_PAGE_ONBOARDING_VIEW = "game/useDetailPageOnboardingView";
export const SET_NEW_SKILL_MASTERY_ENDGAME = "game/setNewSkillMastery";

export const actions = {

  selectGame: (payload) => {
    return {
      type: SELECT_GAME,
      payload: payload
    };
  },

  setGame: (payload) => {
    return {
      type: SET_GAME,
      payload: payload
    };
  },

  unsetGame: () => {
    return {
      type: UNSET_GAME
    };
  },

  clickStartGame: () => {
    return {
      type: CLICK_START_GAME
    };
  },

  fetchGameData: () => {
    return {
      type: FETCH_GAME_DATA
    };
  },

  hitPaywall: (payload) => {
    return {
      type: HIT_PAYWALL
    };
  },

  setGameData: (payload) => {
    return {
      type: SET_GAME_DATA,
      payload: payload
    };
  },

  startGame: () => {
    return {
      type: START_GAME
    };
  },
  pauseGame: () => {
    return {
      type: PAUSE_GAME
    };
  },
  resumeGame: () => {
    return {
      type: RESUME_GAME
    };
  },
  restartGame: () => {
    return {
      type: RESTART_GAME
    };
  },
  autostartGame: (payload) => {
    return {
      type: AUTOSTART_GAME,
      payload: payload
    }
  },

  setNewBadgesEndGame: (payload) => {
    return {
      type: SET_NEW_BADGES_ENDGAME,
      payload: payload
    }
  },

  useDetailPageOnboardingView: (payload) => {
    return {
      type: USE_DETAIL_PAGE_ONBOARDING_VIEW,
      payload: payload
    };
  },

  setNewSkillMasteryEndGame: (payload) => {
    return {
      type: SET_NEW_SKILL_MASTERY_ENDGAME,
      payload: payload
    };
  }
};
