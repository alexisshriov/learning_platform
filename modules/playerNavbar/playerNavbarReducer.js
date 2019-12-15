import { CLICK_POINTS, CLICK_BADGES, SET_MENU_ACTIVE } from './playerNavbarActions';

const initialState = {
  playerNavbar: {
    menuActive: false
  }
};

export const playerNavbar = (state = initialState, action) => {
  switch (action.type) {

    case CLICK_POINTS:
      return state;
      break;

    case CLICK_BADGES:
      return state;
      break;

    case SET_MENU_ACTIVE:
      return {
        ...state,
        menuActive: action.payload
      }
      break;

    default:
      return state;
  }
};