export const SET_USER = "user/setUser";
export const SET_USER_TYPE = "user/setUserType";
export const SET_USER_ID = "user/setUserId";
export const SET_ACCOUNT_INFO = "user/setAccountInfo";

export const SET_EMBED_MODE = "user/setEmbedMode";
export const SET_MEMBER_TYPE = "user/setMemberType";

export const SET_EXPERIMENT_VARIATION = "user/setExperimentVariation";

export const actions = {

  setUser: (payload) => {
    return {
      type: SET_USER,
      payload: payload
    };
  },

  setUserType: (payload) => {
    return {
      type: SET_USER_TYPE,
      payload: payload
    };
  },

  setUserId: (payload) => {
    return {
      type: SET_USER_ID,
      payload: payload
    };
  },

  setAccountInfo: (payload) => {
    return {
      type: SET_ACCOUNT_INFO,
      payload: payload
    };
  },

  setEmbedMode: (payload) => {
    return {
      type: SET_EMBED_MODE,
      payload: payload
    };
  },
  setMemberType: (payload) => {
    return {
      type: SET_MEMBER_TYPE,
      payload: payload
    };
  },

  setExperimentVariation: (payload) => {
    return {
      type: SET_EXPERIMENT_VARIATION,
      payload: payload
    };
  }
};
