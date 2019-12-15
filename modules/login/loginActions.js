export const CLICK_TO_PAGE = "login/clickToPage";
export const LOGIN_STUDENT_ACCESS_CODE = "login/loginStudentAccessCode";
export const LOGGED_IN_STUDENT_ACCESS_CODE = "login/loggedInStudentAccessCode";
export const LOGIN_CLASSROOM_ACCESS_CODE = "login/loginClassroomAccessCode";
export const LOGGED_IN_CLASSROOM_ACCESS_CODE = "login/loggedInClassroomAccessCode";
export const LOGIN_USING_EMAIL = "login/loginUsingEmail";
export const LOGGED_IN_USING_EMAIL = "login/loggedInUsingEmail";
export const JUMP_TO_URL = "login/jumpToUrl";
export const HAS_ENTERED_KIDFRAME = "login/hasEnteredKidframe";

export const actions = {
  clickToPage: (payload) => {
    return {
      type: CLICK_TO_PAGE,
      payload: payload
    };
  },

  loginStudentAccessCode: (payload) => {
    return {
      type: LOGIN_STUDENT_ACCESS_CODE,
      payload: payload
    };
  },

  loggedInStudentAccessCode: (payload) => {
    return {
      type: LOGGED_IN_STUDENT_ACCESS_CODE,
      payload: payload
    };
  },

  loginClassroomAccessCode: (payload) => {
    return {
      type: LOGIN_CLASSROOM_ACCESS_CODE,
      payload: payload
    };
  },

  loggedInClassroomAccessCode: (payload) => {
    return {
      type: LOGGED_IN_CLASSROOM_ACCESS_CODE,
      payload: payload
    };
  },

  loginUsingEmail: (payload) => {
    return {
      type: LOGIN_USING_EMAIL,
      payload: payload
    };
  },

  loggedInUsingEmail: (payload) => {
    return {
      type: LOGGED_IN_USING_EMAIL,
      payload: payload
    };
  },

  jumpToUrl: (payload) => {
    return {
      type: JUMP_TO_URL,
      payload: payload
    };
  },

  hasEnteredKidframe: (payload) => {
    return {
      type: HAS_ENTERED_KIDFRAME,
      payload: payload
    };
  }
};