import { bindActionCreators } from 'redux';
import { replace, push } from 'connected-react-router';
import { actions as playerActions } from '../services/player/playerActions';
import { actions as loginActions } from '../modules/login/loginActions';
import { actions as choosePlayerActions } from '../modules/choosePlayer/choosePlayerActions';
import { actions as playerNavbarActions } from '../modules/playerNavbar/playerNavbarActions';
import player from '../services/player';
import user from '../services/user';
import * as URL from '../helpers/url';
import Tracking from "../helpers/tracking";
let hasEnteredKidframe = false;
export const playerMiddleware = store => next => action => {
  console.debug(store.getState(), action);

  const actions = {
    player: {...bindActionCreators(playerActions, store.dispatch)},
    login: {...bindActionCreators(loginActions, store.dispatch)},
    choosePlayer: {...bindActionCreators(choosePlayerActions, store.dispatch)},
    playerNavbar: {...bindActionCreators(playerNavbarActions, store.dispatch)},
    router: { ...bindActionCreators( {push}, store.dispatch) }
  };

  let state = store.getState();

  // Hacky check -- Saga might fix this?
  if(state.user.user && hasEnteredKidframe === false && state.login.hasEnteredKidframe === false) {
    hasEnteredKidframe = true;
    actions.login.hasEnteredKidframe(true);
    Tracking.track('Kidframe Entrypoint');
  }

  if(action.type === "@@router/LOCATION_CHANGE" && action.payload.action==="POP" && action.payload.isFirstRendering===false) {
    if (window.parent) {
      window.parent.history.back();
    }

  } else if(action.type === "@@router/LOCATION_CHANGE"){
    actions.playerNavbar.setMenuActive(false);
    if(action.payload.location.hash === '' || action.payload.location.hash === '#'){

      let search = new URLSearchParams(window.location.search);
      let pageType = search.get('pageType') || null;
      if(state.user.embedMode!=='detail' && pageType!=='detail') {
        if(state.user.userType!=='studentCode') {
          actions.router.push('#choosePlayer');
        } else {
          actions.router.push('#chooseQuest');
        }
      }
    } else {
      let urlData = URL.mapToObject(undefined, action.payload.location.hash);
      switch(urlData.screen) {
        case 'login':
          next(action);
          break;
        case 'subject': //not implemented
          actions.router.push(location.search + '#chooseQuest');
          break;
        case 'choosePlayer':
          // todo: verify that this works for student code users:
          if('userType' in state.user && state.user.userType==='studentCode') {
            actions.router.push(location.search + '#chooseQuest');
          } else {
            next(action);
          }

        case 'map':
        case 'lesson':
        case 'game':
        case 'assignment':
        case 'assignments':
        case 'challenge':
        case 'chooseQuest':

          if(urlData.screen === 'chooseQuest' || urlData.screen === 'map' || urlData.screen === 'game' || urlData.screen === 'lesson' || urlData.screen === 'assignment') {
            if (state.player !== undefined && state.player.giftLoaded === false) {
              player.getGiftByPlayer(state.player.currentPlayerId).then(resp => {
                if (resp && resp.result) {
                  let gift = resp.result;
                  gift.giftLoaded = true;
                  actions.player.setGift(gift);
                }
              });
            }
          }

          // block guests from accessing certain pages:
          if(state.player.currentPlayerId==-1 && ['assignment', 'assignments', 'challenge'].includes(urlData.screen)){
            actions.router.push(location.search + '#chooseQuest');
            return;
          }

          player.checkAndFetchPlayers(action, state, actions).then(resp => {
            state = store.getState();
            if (!resp || !resp.progress) {

              if (urlData.screen === 'choosePlayer') {
                next(action);
              } else {
                if ('user' in state.user && state.user.userType === 'studentCode') {
                  return;
                } else {
                  if(state.user.embedMode!=='detail') {
                    actions.router.push('#choosePlayer');
                    actions.choosePlayer.jumpToUrl(action.payload.location.hash);
                  } else {
                    next(action);
                  }
                }
              }

              return;
            }

            let mandatoryAssignment = false;
            // Set the last played grades based on playerProgress
            if ('progress' in resp && 'assignments' in resp.progress) {
              for (var assignmentKey in resp.progress.assignments) {
                let assignment = resp.progress.assignments[assignmentKey];
                // make sure that the assignment is completed or there is no mandatory assignment
                if ((assignment.progress === null || assignment.progress.completion < 1) && assignment.mandatory === true) {
                  mandatoryAssignment = true;
                }
              }
            }

            // mandatory assignment blocker (on specific pages only):
            if (
              state.user.embedMode!=='detail' &&
              mandatoryAssignment && (['map', 'lesson', 'game', 'challenge'].includes(urlData.screen)) && urlData.subject !== 'assignment'
            ) {
              actions.router.push(location.search + '#chooseQuest');

            } else {
              // no mandatory assignment. continue...

              // let state = player.store.getState();
              player.inferAndSetGrade(state.player.currentPlayerId, urlData);
              next(action);
            }
          }).catch(resp => {
            if (resp.status === null) {
              // null = no playerId provided
              if (urlData.screen === 'choosePlayer') {
                next(action);
              } else {
                if ('user' in state.user && state.user.userType === 'studentCode') {
                  return;
                } else {
                  if(state.user.embedMode!=='detail') {
                    actions.router.push('#choosePlayer');
                    actions.choosePlayer.jumpToUrl(action.payload.location.hash);
                  } else {
                    next(action);
                  }
                }
              }
              // next(action);
            } else if(resp.status === 0 ) {
              if(state.user.embedMode!=='detail') {
                // 0 = failed on getPlayersAndGroups, probably due to auth issue
                let query = (action.payload.search ? action.payload.location.search : "");
                actions.login.jumpToUrl(query + action.payload.location.hash);
              } else {
                next(action);
              }

            } else {
              next(action);
            }
          });

          break;

        case 'subject':
          break;
        case 'login':
          next(action);
          break;
        default:
          actions.router.push(location.search + '#chooseQuest');
          break;
          // next(action);
      }
    }
  } else {
    next(action);
  }
};

// todo: why is this here? move to player class?
const fetchAssignments = function(action, state, actions) {
  return new Promise((resolve, reject) => {
    let playerId = ('childId' in action.payload.query) ? action.payload.query.childId : null;
    if(playerId) {
      actions.player.fetchAssignments();
      player.getAssignments(playerId).then((resp) => {
        actions.player.setAssignments({playerId: playerId, assignments: resp.assignments});
        resolve({status:1});
      });
    } else {
      reject('no childid');
    }
  });
};
