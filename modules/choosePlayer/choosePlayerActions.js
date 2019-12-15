export const CLICK_NEXT_PAGE = "choosePlayer/clickNextPage";
export const CLICK_PREVIOUS_PAGE = "choosePlayer/clickPreviousPage";
export const CLICK_TO_PAGE = "choosePlayer/clickToPage";
export const CLICK_GROUP = "choosePlayer/clickGroup";
export const CLICK_GROUPS_NEXT_PAGE = "choosePlayer/clickGroupsNextPage";
export const CLICK_GROUPS_PREVIOUS_PAGE = "choosePlayer/clickGroupsPreviousPage";
export const CLICK_GROUPS_TO_PAGE = "choosePlayer/clickGroupsToPage";
export const CLASS_THEN = "choosePlayer/classThen";
export const JUMP_TO_URL = "choosePlayer/jumpToUrl";

export const actions = {
  clickNextPage: (payload) => {
    return {
      type: CLICK_NEXT_PAGE,
      payload: payload
    };
  },

  clickPreviousPage: (payload) => {
    return {
      type: CLICK_PREVIOUS_PAGE,
      payload: payload
    };
  },

  clickToPage: (payload) => {
    return {
      type: CLICK_TO_PAGE,
      payload: payload
    };
  },

  clickGroup: (payload) => {
    return {
      type: CLICK_GROUP,
      payload: payload
    };
  },

  clickGroupsNextPage: (payload) => {
    return {
      type: CLICK_GROUPS_NEXT_PAGE,
      payload: payload
    };
  },

  clickGroupsPreviousPage: (payload) => {
    return {
      type: CLICK_GROUPS_PREVIOUS_PAGE,
      payload: payload
    };
  },

  clickGroupsToPage: (payload) => {
    return {
      type: CLICK_GROUPS_TO_PAGE,
      payload: payload
    };
  },

  jumpToUrl: (payload) => {
    return {
      type: JUMP_TO_URL,
      payload: payload
    }
  }

}