import {
  CLICK_NEXT_PAGE, CLICK_PREVIOUS_PAGE, CLICK_TO_PAGE, CLICK_GROUP, CLICK_GROUPS_NEXT_PAGE, CLICK_GROUPS_PREVIOUS_PAGE, CLICK_GROUPS_TO_PAGE,
  JUMP_TO_URL
} from './choosePlayerActions';

const initialState = {
  inGroup: null,
  groupName: null,
  pageNo: 0,
  groupPageNo: 0,
  next: {},
  toUrl: null
};

export const choosePlayer = (state = initialState, action) => {
  switch (action.type) {

    case CLICK_NEXT_PAGE:
      return {
        ...state,
        pageNo: state.pageNo+1
      };
      break;

    case CLICK_PREVIOUS_PAGE:
      return {
        ...state,
        pageNo: state.pageNo-1
      };
      break;

    case CLICK_TO_PAGE:
      return {
        ...state,
        pageNo: action.payload.pageNo
      };
      break;

    case CLICK_GROUP:
      return {
        ...state,
        inGroup: action.payload.id,
        groupName: action.payload.name,
        pageNo: 0
      };
      break;

    case CLICK_GROUPS_NEXT_PAGE:
      return {
        ...state,
        groupPageNo: state.groupPageNo+1
      };
      break;

    case CLICK_GROUPS_PREVIOUS_PAGE:
      return {
        ...state,
        groupPageNo: state.groupPageNo-1
      };
      break;

    case CLICK_GROUPS_TO_PAGE:
      return {
        ...state,
        groupPageNo: action.payload.pageNo
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
      }
      break;

    default:
      return state;
  }
};