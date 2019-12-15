import { CLICK_LOGOUT } from './navbarActions';

const initialState = {

};

export const navbar = (state = initialState, action) => {
  switch (action.type) {

    case CLICK_LOGOUT:
      return state;
      break;

    default:
      return state;
  }
};