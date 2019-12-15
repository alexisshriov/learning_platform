/*
 * This is the list of all Ducks interfaces for the modules.
 * It aggregates each component's actions and reducers.
 *
 * For now, it must be manually curated.
 * Future project(?): explore Babel wildcard imports https://github.com/vihanb/babel-plugin-wildcard
 */

import * as login from './login';
import * as navbar from './navbar';
import * as playerNavbar from './playerNavbar';
import * as choosePlayer from './choosePlayer';
import * as modal from './modal';
import * as map from './map';
import * as lesson from './lesson';
import * as challenge from './challenge';
import * as game from './game';
import * as loading from './loading';
// todo: remove player? It's already in services/index.js
import {player as playerReducer} from '../services/player/playerReducer';
import {actions as playerActions} from '../services/player/playerActions';
import {user as userReducer} from '../services/user/userReducer';
import {actions as userActions} from '../services/user/userActions';


export const reducers = {
  login: login.reducer,
  navbar: navbar.reducer,
  playerNavbar: playerNavbar.reducer,
  choosePlayer: choosePlayer.reducer,
  // chooseQuest             // todo: fix this, because it erroneously uses the navbar reducers & actions
  modal: modal.reducer,
  map: map.reducer,
  lesson: lesson.reducer,
  challenge: challenge.reducer,
  game: game.reducer,
  loading: loading.reducer,
  player: playerReducer,    // todo: remove?
  user: userReducer
};

export const actions = {
  ...login.actions,
  ...navbar.actions,
  ...playerNavbar.actions,
  ...choosePlayer.actions,
  ...loading.actions,
  // chooseQuest
  ...modal.actions,
  ...map.actions,
  ...lesson.actions,
  ...challenge.actions,
  ...game.actions,
  ...playerActions,         // todo: remove?
  ...userActions
};

// export const routes = {
//   login: login.routes,
//   navbar: navbar.routes,
//   choosePlayer: choosePlayer.routes,
//   modal: modal.routes,
//   map: map.routes,
// }
//
// export const runRoute(state, actions) {
//   let status = {}
//     for (var routeKey in route) {
//       if (routes.hasOwnProperty(routeKey)) {
//         status[routeKey] = routes[routeKey](state, actions);
//       }
//     }
// }
