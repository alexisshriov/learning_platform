import {
  SET_USER, SET_USER_TYPE, SET_USER_ID, SET_ACCOUNT_INFO,
  SET_EMBED_MODE, SET_MEMBER_TYPE,
  SET_EXPERIMENT_VARIATION
} from './userActions';

const initialState = {
  user: null,
  userId: null,
  userType: 'standard',
  accountInfo: {},

  embedMode: (window.kidframe && window.kidframe.embedMode) ? window.kidframe.embedMode : null,
  memberType: null,

  experiment: {}
};


export const user = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      let u = action.payload;
      let id = state.userId;
      if(u===true) {
        if(state.user!==null) {
          u = state.user;
        } else {
          u = "normal";
        }
      } else if(u===false) {
        u = null;
        id = null;
      }
      return {
        ...state,
        user: u,
        userId: id
      };
      break;

    case SET_USER_TYPE:
      return {
        ...state,
        userType: action.payload
      };
      break;

    case SET_USER_ID:
      return {
        ...state,
        userId: action.payload
      };
      break;

    case SET_ACCOUNT_INFO:
      return {
        ...state,
        accountInfo: action.payload
      };
      break;


    case SET_EMBED_MODE:
      return {
        ...state,
        embedMode: action.payload
      };
      break;

    case SET_MEMBER_TYPE:
      return {
        ...state,
        memberType: action.payload
      };

    case SET_EXPERIMENT_VARIATION:
      return {
        ...state,
        experiment: {
          ...state.experiment,
          [action.payload.info.experimentId]: action.payload
        }
      };

    default:
      return state;
  }
};
