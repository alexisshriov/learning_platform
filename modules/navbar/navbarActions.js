export const CLICK_LOGOUT = "navbar/clickLogout";

export const actions = {
  clickLogout: (payload) => {
    return {
      type: CLICK_LOGOUT,
      payload: payload
    };
  }
}