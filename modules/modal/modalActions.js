export const SHOW_GENERAL_MODAL = "modal/showGeneralModal";
export const SHOW_BLANK_MODAL = "modal/showBlankModal";
export const SHOW_ERROR = "modal/showError";
export const EXIT_MODAL = "modal/exitModal";

export const SHOW_LOGOUT = "modal/showLogOut";
export const SHOW_ENDGAME = "modal/showEndGame";
export const SHOW_EXITGAME = "modal/showExitGame";
export const SHOW_BADGES = "modal/showBadges";
export const SHOW_CHOOSE_AVATAR_MODAL = "modal/showChooseAvatarModal";

export const BADGE_NEXT_PAGE = "modal/badgeNextPage";
export const BADGE_PREVIOUS_PAGE = "modal/badgePreviousPage";
export const BADGE_TO_PAGE = "modal/badgeToPage";
export const BADGE_RESET_PAGE = "modal/badgeResetPage";

export const actions = {
    showGeneralModal: (payload) => {
      return {
        type: SHOW_GENERAL_MODAL,
        payload: payload
      };
    },
    exitModal: (payload) => {
        return {
            type: EXIT_MODAL,
            payload: payload
        };
    },
    showBlankModal: (payload) => {
        return {
            type: SHOW_BLANK_MODAL,
            payload: payload
        };
    },
    showLogOutModal: (payload) => {
        return {
            type: SHOW_LOGOUT,
            payload: payload
        };
    },
    showChooseAvatarModal: (payload) => {
        return {
            type: SHOW_CHOOSE_AVATAR_MODAL,
            payload: payload
        };
    },
    showErrorModal: (payload) => {
        return {
            type: SHOW_ERROR,
            payload: payload
        };
    },
    showEndGameModal: (payload) => {
        return {
            type: SHOW_ENDGAME,
            payload: payload
        };
    },
    showExitGameModal: (payload) => {
        return {
            type: SHOW_EXITGAME,
            payload: payload
        };
    },
    showBadgesModal: (payload) => {
        return {
            type: SHOW_BADGES,
            payload: payload
        };
    },
    badgeNextPage: (payload) => {
        return {
            type: BADGE_NEXT_PAGE,
            payload: payload
        };
    },
    badgePreviousPage: (payload) => {
        return {
            type: BADGE_PREVIOUS_PAGE,
            payload: payload
        };
    },
    badgeToPage: (payload) => {
        return {
            type: BADGE_TO_PAGE,
            payload: payload
        };
    },
    badgeResetPage: (payload) => {
        return {
            type: BADGE_RESET_PAGE,
            payload: payload
        };
    }
};
