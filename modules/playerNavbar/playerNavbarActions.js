export const CLICK_POINTS = "playerNavbar/clickPoints";
export const CLICK_BADGES = "playerNavbar/clickBadges";
export const SET_MENU_ACTIVE = "playerNavbar/setMenuActive";

export const actions = {
  clickPoints: (payload) => {
    return {
      type: CLICK_POINTS,
      payload: payload
    };
  },

  clickBadges: (payload) => {
    return {
      type: CLICK_BADGES,
      payload: payload
    };
  },

  setMenuActive: (payload) => {
    return {
      type: SET_MENU_ACTIVE,
      payload: payload
    }
  }
}