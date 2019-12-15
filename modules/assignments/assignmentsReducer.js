import { CLICK_JUMP_TO_GAME } from './assignmentsActions';

const initialState = {
  
};

export const navbar = (state = initialState, action) => {
  switch (action.type) {

    case CLICK_JUMP_TO_GAME:
      return {
        ...state
      };
      break;

    default:
      return state;
  }
};