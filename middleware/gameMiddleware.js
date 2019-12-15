import { bindActionCreators } from 'redux';
import { replace, push } from 'connected-react-router';
import { actions as gameActions } from '../modules/game/gameActions';
import * as URL from '../helpers/url';

export const gameMiddleware = store => next => action => {
  const actionList = {
    ...gameActions
  };
  const actions = {
    ...bindActionCreators(actionList, store.dispatch),
    router: { ...bindActionCreators( {push}, store.dispatch) }
  };

  let state = store.getState();

  if(action.type === "@@router/LOCATION_CHANGE") {

    let url = URL.mapToObject(undefined, action.payload.location.hash);

    switch (url.screen) {

      case 'game':
        // if the game is a landing page, then set it and go back to lesson/assignment
        if(action.payload.firstLoad){
          if(url.assignment && 'id'in url.assignment){
            actions.router.push(location.search + '#assignment-'+url.assignment.id);
          } else {
            actions.router.push(location.search + '#'+url.subject+','+url.grade+','+url.lesson);
          }
          next(action);
        } else {

          // set the game on direct url changes
          if (state.game.currentGame && state.game.currentGame.internalName !== url.game) {
            actions.selectGame({
              game: {internalName: url.game}
            });
            actions.setGame({
              game: {internalName: url.game}
            });
          }
          next(action);
        }
        break;

      default:
        actions.unsetGame();
        next(action);
    }

  } else if(action.type === "game/setGame") {
    if(!action.payload){
      next(action);
    }

    let url = URL.mapToObject();
    if(action.payload.game && ('internalName' in action.payload.game) && url.game!==action.payload.game.internalName){

      if(url.lesson) {
        let newUrlGame = location.search+'#'
          + url.subject+','
          + url.grade+','
          + url.lesson+','
          + action.payload.game.internalName;
        actions.router.push(newUrlGame);

      } else if(url.assignment) {
        let newUrlAssignmentGame = location.search+'#'
          + 'assignment-'
          + url.assignment.id+','
          + action.payload.game.internalName;
        actions.router.push(newUrlAssignmentGame);
      }

      next(action);

      // todo: if 'data' is missing: instead of calling next, fetch any missing data and re-send the setGame action with both 'game' and 'data' in payload
    } else {

      next(action);
    }

  } else {

    next(action);
  }
};
