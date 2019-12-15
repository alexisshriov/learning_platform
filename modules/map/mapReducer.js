import { SET_CHARACTER_POSITION, JUMP_TO_LESSON } from './mapActions';

const initialState = {
  map: {
    character: {
      position: {
        x: 0,
        y: 0
      },
    }
  },
  toLesson: null
};

export const map = (state = initialState, action) => {
  switch (action.type) {

    case SET_CHARACTER_POSITION:
      return {
        ...state,
        map: {
          ...state.map,
          character: {
            ...state.character,
            position: {
              x: action.payload.x,
              y: action.payload.y
            }
          }
        }
      };
      break;

    case JUMP_TO_LESSON:
      return {
        ...state,
        toLesson: action.payload
      };

    default:
      return state;
  }
};
