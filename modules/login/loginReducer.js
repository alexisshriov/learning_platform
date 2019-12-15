import { CLICK_TO_PAGE, LOGIN_STUDENT_ACCESS_CODE, LOGGED_IN_STUDENT_ACCESS_CODE, LOGIN_CLASSROOM_ACCESS_CODE, LOGGED_IN_CLASSROOM_ACCESS_CODE, LOGIN_USING_EMAIL, LOGGED_IN_USING_EMAIL, JUMP_TO_URL, HAS_ENTERED_KIDFRAME } from './loginActions';

const initialState = {
  page: 'main',
  loading: false,
  toUrl: null,
  hasEnteredKidframe: false
};

export const login = (state = initialState, action) => {
  switch (action.type) {

    case CLICK_TO_PAGE:
      return {
        ...state,
        page: action.payload.page
      };
      break;

    case LOGIN_STUDENT_ACCESS_CODE:
    case LOGIN_CLASSROOM_ACCESS_CODE:
    case LOGIN_USING_EMAIL:
      return {
        ...state,
        loading: true
      };
      break;

    case LOGGED_IN_STUDENT_ACCESS_CODE:
    case LOGGED_IN_CLASSROOM_ACCESS_CODE:
    case LOGGED_IN_USING_EMAIL:
      return {
        ...state,
        loading: false
      };
      break;

    case JUMP_TO_URL:
      let toUrl = action.payload;
      if(toUrl!==null && state.toUrl!==null){
        toUrl = state.toUrl;
      }
      return {
        ...state,
        toUrl: toUrl
      };
      break;

    case HAS_ENTERED_KIDFRAME:
      return {
        ...state,
        hasEnteredKidframe: true
      };
      break;

    default:
      return state;
  }
};