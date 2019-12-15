import React from 'react';
import API from '../../helpers/api.js'

import player from "../player";
import { actions as playerActions } from '../player/playerActions';
import { actions as userActions } from './userActions';
import { actions as gameActions } from '../../modules/game/gameActions';
import { push } from 'connected-react-router';
import * as URL from '../../helpers/url';

import { promiseTimeout } from '../../helpers/promises';

import { bindActionCreators } from "redux";
import { actions } from "../../modules";


class User {

  constructor() {
    this.store = null;
    this.actions = {};
  }

  /**
   * Give access to the redux store. Then bind any actions needed by User class.
   * @param {[object]} store the redux store
   */
  setStore(store){
    this.store = store;
    this.actions.user = { ...bindActionCreators( userActions, store.dispatch) };
    this.actions.player = { ...bindActionCreators( playerActions, store.dispatch) };
    this.actions.game = { ...bindActionCreators( gameActions, store.dispatch) };
    this.actions.router = { ...bindActionCreators( {push}, store.dispatch) };
  }

  loginStudentAccessCode(code) {
    var self = this;
    return API.loginStudentAccessCode(code).then(resp => {
      return new promiseTimeout(undefined, (resolve, reject)=>{
        if(resp.status==0){
          reject(resp);
        }
        if('token' in resp){
          // Keep token in API
          API.setToken(resp.token, 'studentCode');
          // Remove other players and their progress
          self.actions.player.unsetPlayersAndProgress();
          // Set store's user type to 'studentCode'
          self.actions.user.setUserType('studentCode');
        }
        if('childId' in resp){
          var childId = resp.childId;

          // 1. re-fetch the sequence in case we have typing or account-specific changes
          player.getSequence(true).then((resp2) => {
            this.store.dispatch(actions.setSequences({...resp2}));

            // 2. Set store's player id
            // 3. Fetch that player info
            player.getPlayer(childId)
              .then((resp) => {
                let noGroups = {
                  children: {}
                };
                noGroups.children[childId] = resp;
                self.actions.player.setPlayers({noGroups: noGroups});

                // todo: put player info into studentAccessCode api response?? would eliminate above call

                // 4. Fetch the player's progress

                player.getPlayerProgress(childId)
                  .then((resp) => {
                    let payload = {};
                    payload[childId] = {...resp};
                    self.actions.user.setUser('student');
                    self.actions.player.setProgress(payload);
                    self.actions.player.setCurrentPlayer({id: childId});

                    let gradesPayload = {};
                    if ('lastPlayed' in resp) {
                      let lp = resp.lastPlayed;
                      if ('ela' in lp && 'path' in lp.ela && lp.ela.path.length >= 2 && lp.ela.path[1]) {
                        gradesPayload['ela'] = {
                          grade: lp.ela.path[1].replace('ela-', ''),
                          internalName: lp.ela.path[1]
                        };
                      }
                      if ('math' in lp && 'path' in lp.math && lp.math.path.length >= 2 && lp.math.path[1]) {
                        gradesPayload['math'] = {
                          grade: lp.math.path[1].replace('math-', ''),
                          internalName: lp.math.path[1]
                        };
                      }
                    }
                    self.actions.player.setGrade(gradesPayload);

                    resolve({
                      'status': 1,
                      'childId': childId
                    });

                  });

              });

          });
        }
      });
    }).catch((resp)=>{
      return({
        'status': 0,
        'message': resp.message ? resp.message : ''
      });
    });
  }

  loginClassroomAccessCode(code) {
    var self = this;
    return API.loginClassroomAccessCode(code).then(resp => {
      return new promiseTimeout(undefined, (resolve, reject)=>{
        if('token' in resp){
          API.setToken(resp.token, 'classroom');
          self.actions.user.setUser('classroom');
          player.startClassroomConnection();
        }
        player.getSequence(true).then((resp2) => {
          this.store.dispatch(actions.setSequences({...resp2}));
          resolve(resp);
        });
      });
    });
  }

  loginWithEmail(data) {
    var self = this;
    data = {
      ...data,
      __json: "Modal_Login",
      jsfinished: 1,
      remember: 1
    };

    return API.loginWithEmail(data).then(resp => {
      return player.getSequence(true).then((resp2) => {
        this.store.dispatch(actions.setSequences({...resp2}));
        return new promiseTimeout(undefined, (resolve, reject) => {
          self.actions.user.setUser('normal');
          resolve(resp);
        });
      });
    });
  }

  setUserId(id) {
    this.actions.user.setUserId(id);
  }

  logout() {
    var self = this;
    self.actions.user.setUser(false);
    self.actions.player.unsetPlayersAndProgress();
    player.stopClassroomConnection();
    API.logout();
    if(URL.getScreen()!=='login') {
      self.actions.router.push('#login');
    }
  }


  // Force a context and process it, such as loading on a detail page
  ingestContext(k) {
    if(k.embedMode && k.embedMode==='detail') {
      this.actions.user.setEmbedMode('detail');
      this.actions.game.useDetailPageOnboardingView(true);
    }
    if(k.memberType) {
      this.actions.user.setMemberType(k.memberType);
    }

    if(k.startPath && Array.isArray(k.startPath)){
      if(k.startPath.length===1){
        // single game
      } else {
        // this.actions.player.setCurrentPlayer({id:-1});
        this.actions.router.push('?childId=-1#'+k.startPath.join(','));
      }
    }
  }

  getExperimentInfo(experimentId) {
    return API.getExperimentId(experimentId);
  }
}

let user = new User();
export default user;
