import React from 'react';
import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { ConnectedRouter, connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { Howl, Howler } from 'howler';


import App from './App';
import ErrorBoundary from './ErrorBoundary';
import { reducers as moduleReducers } from './modules';
import { serviceReducers } from './services';
import { playerMiddleware } from './middleware/playerMiddleware';
import { gameMiddleware } from './middleware/gameMiddleware';
import { sequenceMiddleware } from './middleware/sequenceMiddleware';
import API from "./helpers/api";


const initialState = {};

const history = createBrowserHistory();

// Create the store
const store = createStore(
  combineReducers({
    router: connectRouter(history),
    ...moduleReducers,
    ...serviceReducers
  }),
  initialState,
  compose(applyMiddleware(
    routerMiddleware(history),
    playerMiddleware,
    gameMiddleware,
    sequenceMiddleware
  ))
);

API.setStore(store);

// See if we have a token in our localStorage, and resume it if so. not for detail pages...
if(window.kidframe && window.kidframe.embedMode && window.kidframe.embedMode==='detail') {
  // do not set token
} else {
  var token = window.localStorage['token'];
  var tokenType = window.localStorage['tokenType'];
  if (token) {
    API.setToken(token, tokenType);
  }
}

// Configure audio, extend the play method to share a global audioContext with components & games
Howler.autoSuspend = false;
if( !(navigator.appName == 'Microsoft Internet Explorer' || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) ) ) {
  (() => {
    let play = Howl.prototype.play;
    Howl.prototype.play = function () {
      window.audio_context = window.audio_context ? window.audio_context : Howler.ctx;
      return play.apply(this, arguments);
    }
  })();
}
window.audio_volume = Howler.volume();

function KidFrame() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <ConnectedRouter history={history}>
          <App store={store} />
        </ConnectedRouter>
      </ErrorBoundary>
    </Provider>
  );
}

export default KidFrame;
