import {
  SHOW_GENERAL_MODAL, SHOW_ERROR, SHOW_BLANK_MODAL, SHOW_LOGOUT,
  SHOW_EXITGAME, SHOW_CHOOSE_AVATAR_MODAL, SHOW_ENDGAME,
  SHOW_BADGES, BADGE_NEXT_PAGE, BADGE_PREVIOUS_PAGE, BADGE_TO_PAGE, BADGE_RESET_PAGE,
  EXIT_MODAL
} from './modalActions';

const initialState = {
  visible: true,
  general: {
    visible: false,
    data: {}
  },
  error: {
    visible: false,
    text: '',
    subtext: ''
  },
  blank: {
    visible: false,
    children: {}
  },
  logOut: {
    visible: false
  },
  endgame: {
    visible: false,
    data: {},
    newBadges: 'pending'
  },
  chooseAvatar: {
    visible: false,
    data: {}
  },
  exitgame: {
    visible: false,
    text: '',
    route: '',
    game: null
  },
  badges: {
    visible: false,
    text: '',
    pageNo: 0
  }
};

export const modal = (state = initialState, action) => {
  switch (action.type) {
    case EXIT_MODAL:
      // eventually want to refresh page instead of close error modal
      if ('error' === action.payload) {
        return {
          ...state,
          visible: true,
          error: {
            visible: false
          }
        }
      } else if ('exitgame' === action.payload) {
        return {
          ...state,
          visible: true,
          exitgame: {
            visible: false
          }
        }
      } else if ('endgame' === action.payload) {
        return {
          ...state,
          visible: true,
          endgame: {
            visible: false
          }
        }
      } else if ('badges' === action.payload) {
        return {
          ...state,
          visible: true,
          badges: {
            visible: false,
            pageNo: 0
          }
        }
      } else if ('general' === action.payload) {
        return {
          ...state,
          visible: true,
          general: {
            visible: false
          }
        }
      } else if ('chooseavatar' === action.payload) {
        return {
          ...state,
          visible: true,
          chooseAvatar: {
            visible: false
          }
        }
      } else if ('logout' === action.payload) {
        return {
          ...state,
          visible: true,
          logOut: {
            visible: false
          }
        }
      } else if ('blank' === action.payload) {
        return {
        ...state,
        visible: true,
        blank: {
          visible: false
        }
      }
  }

      return {
        ...state,
        visible: true
      };
      break;

    case SHOW_GENERAL_MODAL:
      return {
        ...state,
        visible: true,
        general: {
          visible: true,
          data: (action.payload ? {...action.payload} : {})
        }
      };

    case SHOW_ERROR:
      return {
        ...state,
        visible: true,
        error: {
          visible: true,
          message: action.payload && action.payload.message ? action.payload.message : '',
          url: action.payload && action.payload.url ? action.payload.url : '',
        }
      };
      break;

    case SHOW_BLANK_MODAL:
      return {
        ...state,
        visible: true,
        blank: {
          visible: true,
          children: action.payload.children,
          className: action.payload.className
        }
      };

    case SHOW_LOGOUT:
      return {
        ...state,
        visible: true,
        logOut: {
          visible: true
        }
      };
      break;

    case SHOW_CHOOSE_AVATAR_MODAL:
      return {
        ...state,
        visible: true,
        chooseAvatar: {
            ...state.chooseAvatar,
            visible: true,
            data: (action.payload ? {...action.payload} : {})
        }

      };
      break;

    case SHOW_ENDGAME:
      return {
        ...state,
        visible: true,
        endgame: {
          ...state.endgame,
          visible: true,
          data: (action.payload ? {...action.payload} : {})
        }
      };
      break;

    case SHOW_EXITGAME:
      return {
        ...state,
        visible: true,
        exitgame: {
          ...state.exitgame,
          visible: true,
          text: ('text' in action.payload ? action.payload.text : ''),
          route: ('route' in action.payload ? action.payload.route : ''),
          game: ('game' in action.payload ? action.payload.game : null)
        }
      };
      break;

    case SHOW_BADGES:
      return {
        ...state,
        visible: true,
        badges: {
          ...state.badges,
          visible: true,
          text: 'badges'
        }
      };
      break;

    case BADGE_NEXT_PAGE:
      return {
        ...state,
        badges: {
          ...state.badges,
          pageNo: state.badges.pageNo+1
        }
      };
      break;

    case BADGE_PREVIOUS_PAGE:
      return {
        ...state,
        badges: {
          ...state.badges,
          pageNo: state.badges.pageNo-1
        }
      };
      break;

    case BADGE_TO_PAGE:
      return {
        ...state,
        badges: {
          ...state.badges,
          pageNo: action.payload.pageNo
        }
      };
      break;

    case BADGE_RESET_PAGE:
      return {
        ...state,
        badges: {
          ...state.badges,
          pageNo: 0
        }
      };
      break;

    default:
      return state;
  }
};
