import React from 'react';
import { player as playerReducer } from "./playerReducer";
import { actions as gameActions } from '../../modules/game/gameActions';
import { actions as userActions } from "../user/userActions";
import { actions as playerActions } from "./playerActions";
import { actions as loadingActions } from '../../modules/loading/loadingActions';
import { push } from 'connected-react-router';
import { bindActionCreators } from "redux";

import API from '../../helpers/api.js'
import { promiseTimeout } from '../../helpers/promises';
import * as URL from '../../helpers/url';



class Player {

  constructor() {
    this.store = null;
    this.actions = {};

    this.sequence = null;

    this.classroomConnection = false;
    this.classroomInterval = null;
    // this.getSequence();

    this.fetchSequencePromise = null;
    this.fetchingSequence = false;

    // this.fetchChallengesPromise = null;
    // this.fetchNextChallengeItemPromise = null;
  }

  /**
   * Give access to the redux store. Then bind any actions needed by User class.
   * @param {[object]} store the redux store
   */
  setStore(store) {
    this.store = store;
    this.actions.game = { ...bindActionCreators( gameActions, store.dispatch) };
    this.actions.router = { ...bindActionCreators( {push}, store.dispatch) };
    this.actions.player = { ...bindActionCreators( playerActions, store.dispatch) };
    this.actions.loadingActions = { ...bindActionCreators( loadingActions, store.dispatch) };
  }

  /**
   * get all the course and the structure
   */
  getSequence(forceUpdate = false){
    var self = this;

    let promise = this.fetchSequencePromise;
    if(!promise) {
      if (self.sequence === null || forceUpdate) {
        promise = API.getSequence().then(resp => {
          let url = URL.mapToObject();

          return new Promise((resolve, reject) => {
            self.sequence = resp.subjects;

            if(url.singlePlay) {
              self.getSingleExerciseMetainfo(url.game).then( resp2 => {
                if(resp2.exercise) {
                  self.actions.player.setSingleExercise(resp2.exercise);

                  self.fetchSequencePromise = null;
                  resolve(self.sequence);
                }
              });
            } else {
              self.fetchSequencePromise = null;
              resolve(self.sequence);
            }
          })
        });
      } else {
        promise = new Promise((resolve, reject) => {
          let url = URL.mapToObject();

          if(url.singlePlay) {
            self.getSingleExerciseMetainfo(url.game).then( resp2 => {
              if(resp2.exercise) {
                self.actions.player.setSingleExercise(resp2.exercise);

                self.fetchSequencePromise = null;
                resolve(self.sequence);
              }
            });
          } else {
            self.fetchSequencePromise = null;
            resolve(self.sequence);
          }
        });
      }
      self.fetchSequencePromise = promise;
    }

    return promise;
  }

  getSingleExerciseMetainfo(gameId){
    return API.getSingleExerciseMetainfo(gameId);
  }

  fetchExercise(gameId, sessionId, assignmentId) {
    var self = this;
    let state = this.store.getState();
    let playerId = state.player.currentPlayerId;
    API.getExerciseContent(playerId, gameId, sessionId, assignmentId).then(resp => {

      self.actions.game.setGameData(resp);
      if(window.kidframe){

          if(window.kidframe.memberType === "basic") {
              try {
                  document.dispatchEvent(new CustomEvent('getPaywallCredit', {detail: resp.creditsRemaining}));
              } catch(e) {}
          }

        if(window.kidframe.playCount){
          window.kidframe.playCount = parseInt(window.kidframe.playCount)+1;
        } else {
          window.kidframe.playCount = 1;
        }
      }
    }).catch(resp => {
      if(resp === 'Paywall limit reached'){
        self.actions.game.hitPaywall(true);
      }
      // API call failed, go to previous game state
      // todo: maybe pop an error modal, or re-fetch?
      self.actions.game.unsetGame();
    });
  }

  getGiftByPlayer(childId) {
    return API.getGiftByPlayer(childId)
  }

  updateGiftToSeen(childId) {
    return API.updateGiftToSeen(childId)
  }


  addChild(data) {
    let addChildErrorMessage = "";

    this.actions.loadingActions.loadingChildStarted({loadingText: "Loading", });
    this.actions.player.addingPlayer();
    API.addChild(data).then((resp) => {
      this.actions.loadingActions.loadingChildFinished();

      if (resp.status) {
        if (resp.avatar.internal_name) {
          resp.avatar.internalName = resp.avatar.internal_name;
        }
        let player = {
          PlayerId: resp.PlayerId,
          PlayerName: resp.PlayerName,
          PlayerGrade: resp.PlayerGrade,
          avatar: resp.avatar
        };
        this.actions.player.addPlayer(player);
      } else {
          if (resp.error.message) {
            addChildErrorMessage = resp.error.message;
          } else if (resp.error.request) {
            resp.error.message = 'There was an error with your request and we were unable to add your child.';
          } else {
            resp.error = {};
            resp.error.message = 'An error happened and we were unable to add your child.';
          }

        this.actions.player.setPlayerError({isError:true, error:resp.error});
      }
    });
  }


  getPlayerProgress(id){
    if(id===null || id===undefined || id==="") return;
    return this.getPlayerProgressAndAssignments(id);
  }
  getPlayerProgressAndAssignments(id){
    if(id===null || id===undefined || id==="") return;
    let sequencePromise = this.getSequence();
    return sequencePromise.then((resp)=>{
      API.activateToken();
      let promises = [
        API.getProgress(id, resp),
        API.getAssignments(id)
      ];
      return Promise.all(promises).then(resps => {
        return new Promise((resolve,reject)=>{
          let progress = resps[0];
          let assignments = resps[1];
          progress['assignments'] = assignments.assignments;
          for(var assignmentKey in progress['assignments']){
            let assignment = progress['assignments'][assignmentKey];
            let assignmentProgress = assignment['progress'] ? assignment['progress'] : null;
            if(!assignmentProgress){
              assignmentProgress = {
                items:[],
                completion: 0
              };
              assignment['progress'] = assignmentProgress;
            }
            let reformattedProgress = [];
            let progressDef = {
              completion: 0,
              earned: 0,
              possible: 3,
              score: 0
            };
            for(let i=0; i<assignment.items.length; i++){
              let baseExercise = assignment.items[i];
              reformattedProgress[i] = {
                ...progressDef,
                internalName: baseExercise.internalName,
                possible: baseExercise.pointsPossible
              };
              // find the item in fetched progress.items[]
              for(let p=0; p<assignmentProgress.items.length; p++){
                let progItem = assignmentProgress.items[p];
                if(progItem.internalName===baseExercise.internalName){
                  reformattedProgress[i] = {
                    ...reformattedProgress[i],
                    ...progItem
                  };
                }
              }
              assignment.items[i].progress = reformattedProgress[i];
            }
            assignment.progress.items = reformattedProgress; //todo: this is a weird duplication. necessary?
          }
          resolve(progress);
        });
      });
    });
  }
  getPlayersAndGroups(){
    return API.getPlayersAndGroups();
  }

  /**
   * Get a single player by id. Only used when other players should not be fetched (ex: student access code)
   * @param {string} id - a.k.a. childId
   */
  getPlayer(id){
    return API.getPlayer(id);
  }

  getExerciseContent(childId, internalName, sessionId, assignmentId) {
    return API.getExerciseContent(childId, internalName, sessionId, assignmentId);
  }

  getAssignments(childId, sorted = true) {
    return API.getAssignments(childId, sorted);
  }

  getChallenges(childId) {
    return API.getChallenges(childId);
    // let promise = this.fetchChallengesPromise;
    // console.log('getChallenges', promise)
    // if(!promise) {
    //   this.fetchChallengesPromise = API.getChallenges(childId);
    // }
    // return this.fetchChallengesPromise;
  }

  getNextChallengeItem(data) {
    return this.fetchNextChallengeItemPromise = API.getNextChallengeItem(data);

    // let promise = this.fetchNextChallengeItemPromise;
    // if(!promise) {
    //   this.fetchNextChallengeItemPromise = API.getNextChallengeItem(data);
    // }
    // return this.fetchNextChallengeItemPromise;
  }

  getSkillMap() {
    return API.getSkillMap();
  }

  /**
   * fetching the information about the player needed for each screen
   * @param  {object} action  current dispatched action
   * @param  {object} state   current state of the app
   * @param  {object} actions list of actions that can be dispatched
   * @return {promise}        promise with all the player data
   */
  checkAndFetchPlayers(action, state, actions) {
    let playerId = null;
    if('search' in action.payload.location){
      let search = new URLSearchParams(action.payload.location.search);
      playerId = search.get('childId');
    }

    let promise = new Promise((resolve, reject) => {
      // Make sure a playerId is present. (can't shortcut check, as -1 is valid for guests)
      if(state.user.userType!=='studentCode') {
        if (playerId === null || playerId === '' || playerId === 0) {
          if ((action.type === "@@router/LOCATION_CHANGE" && (action.payload.location.hash === '#choosePlayer' || action.payload.location.hash === '#chooseQuest'))) {
            reject({status: null, action: action});
          }
        }
      }

      // do we already have this playerId?
      if ('noGroups' in state.player.players && (playerId in state.player.players.noGroups.children)) {
        let currentPlayerProgress = null;
        if (playerId && state.player.progress[playerId]) {
          currentPlayerProgress = state.player.progress[playerId];
        }
        // do we not have progress for this playerId?
        if (playerId !== null && currentPlayerProgress === null) {
          this.getPlayerProgressAndAssignments(playerId).then(playerProgressResp => {
            let progress = {};
            progress[playerId] = playerProgressResp;
            actions.player.setProgress(progress);
            actions.player.setCurrentPlayer({id: playerId});
            resolve({status: 1, progress: progress[playerId]});
          }).catch(resp => {
            reject({status: 0});
          });
        } else {
          // we have progress already for this playerId
          resolve({status: 1, progress: currentPlayerProgress});
        }
      } else {
        actions.player.fetchPlayers();

        // temp carveout to limit the number of calls:
        window.limitPlayersAndGroups = window.limitPlayersAndGroups ? parseInt(window.limitPlayersAndGroups) : 1;
        window.limitPlayersAndGroups++;
        if (window.limitPlayersAndGroups >= 10) {
          return false;
        }
        this.getPlayersAndGroups().then(playersResp => {
          let playersPayload = {
            noGroups: {
              children: {},
              numChildren: 0
            },
            groups: {},
            premiumType: playersResp.premiumType
          };
          // build groups of children
          var i = 0;
          for (var groupId in playersResp.groups) {
            let group = {...playersResp.groups[groupId]};
            let children = {};
            for (i = 0; i < group.children.length; i++) {
              let childId = group.children[i];
              if (childId in playersResp.children) {
                children[childId] = playersResp.children[childId];
              }
            }
            // Only include groups with children in it
            if (Object.keys(children).length) {
              group.children = children;
              group.numChildren = i;
              playersPayload.groups[groupId] = group;
            }
          }
          // generate list of all children
          let children = {};
          let firstChildId = null;  // keep track of this for auto-assigning playerId on student code
          i = 0;
          for (var childId in playersResp.children) {
            if(i===0) {
              firstChildId = childId;
            }
            let child = playersResp.children[childId];
            if (!child.PlayerGrade) {
              child.PlayerGrade = 'preschool';
            }
            children[childId] = playersResp.children[childId];
            i++;
          }
          playersPayload.noGroups = {
            children: children,
            numChildren: i
          };

          actions.player.setPlayers(playersPayload);

          // carveout to auto-assign playerId if reloading page and using a student code:
          if(!playerId && firstChildId && state.user.userType==='studentCode'){
            playerId = firstChildId;
          }
          // carveout for playerId not matching studentCode {
          if(playerId !== firstChildId && state.user.userType==='studentCode') {
            API.unsetToken();
            window.location.reload();
          }


          let currentPlayerProgress = null;
          if (playerId && state.player.progress[playerId]) {
            currentPlayerProgress = state.player.progress[playerId];
          }

          if (playerId !== null && currentPlayerProgress === null) {
            this.getPlayerProgressAndAssignments(playerId).then(playerProgressResp => {
              let url = URL.mapToObject();

              let progress = {};
              progress[playerId] = playerProgressResp;
              actions.player.setProgress(progress);
              actions.player.setCurrentPlayer({id: playerId});
              if(firstChildId){
                player.inferAndSetGrade(playerId, url);
              }
              if(!location.search || (location.search && location.search.childId!=playerId)){
                this.actions.router.push('?childId='+playerId+(location.hash));
              }
              resolve({status: 1, progress: progress[playerId]});

              if(state.user.userType==='studentCode') {
                if(url.screen==='choosePlayer') {
                  this.actions.router.push('?childId='+playerId + '#chooseQuest');
                }
              }

            }).catch(resp => {
              reject({status: 0});
            });
          } else {
            resolve({status: 1, 'progress': state.player.progress[playerId]});
          }
        }).catch(resp => {
          reject({status: 0});
        });
      }
    });

    return promise;
  }


  inferAndSetGrade(playerId, urlData) {
    let state = this.store.getState();
    if(!state.player.players.noGroups.children) return;
    let currentPlayer = state.player.players.noGroups.children[state.player.currentPlayerId];

    let gradesPayload = null;

    if ('PlayerGrade' in currentPlayer) {
      gradesPayload = {
        ela: {
          grade: currentPlayer.PlayerGrade,
          internalName: 'ela-' + currentPlayer.PlayerGrade
        },
        math: {
          grade: currentPlayer.PlayerGrade,
          internalName: 'math-' + currentPlayer.PlayerGrade
        }
      };
    }

    // if ('progress' in resp && 'lastPlayed' in resp.progress) {
    //   let lp = resp.progress.lastPlayed;
    //   if ('ela' in lp && 'path' in lp.ela && lp.ela.path.length >= 2 && lp.ela.path[1]) {
    //     gradesPayload['ela'] = {
    //       grade: lp.ela.path[1].replace('ela-', ''),
    //       internalName: lp.ela.path[1]
    //     };
    //   }
    //   if ('math' in lp && 'path' in lp.math && lp.math.path.length >= 2 && lp.math.path[1]) {
    //     gradesPayload['math'] = {
    //       grade: lp.math.path[1].replace('math-', ''),
    //       internalName: lp.math.path[1]
    //     };
    //   }
    // }

    // Came from a page that can override the playerProgress last played grades
    if (urlData.subject && urlData.grade) {
      let grade = urlData.grade.replace(urlData.subject + '-', '');
      gradesPayload[urlData.subject] = {grade: grade, internalName: urlData.grade};
    }

    // Always overwrite this with any gradesSelected information:
    if ('gradesSelected' in state.player) {
      if ('ela' in state.player.gradesSelected && state.player.gradesSelected.ela) {
        gradesPayload = {
          ...gradesPayload,
          ela: {...state.player.gradesSelected.ela}
        };
      }
      if ('math' in state.player.gradesSelected && state.player.gradesSelected.math) {
        gradesPayload = {
          ...gradesPayload,
          math: {...state.player.gradesSelected.math}
        };
      }
    }

    // Grade lock will take priority over all reroutes if account type matches where lock was set
    if ((currentPlayer.classroomLockedGrade && state.user.userType === 'classroom') || currentPlayer.lockedGrade) {
      if (currentPlayer.classroomLockedGrade) {
        gradesPayload = {
          ela: {grade: currentPlayer.classroomLockedGrade, internalName: 'ela-'+currentPlayer.classroomLockedGrade},
          math: {grade: currentPlayer.classroomLockedGrade, internalName: 'math-'+currentPlayer.classroomLockedGrade}
        };
      } else if (currentPlayer.lockedGrade) {
        gradesPayload = {
          ela: {grade: currentPlayer.PlayerGrade, internalName: 'ela-'+currentPlayer.PlayerGrade},
          math: {grade: currentPlayer.PlayerGrade, internalName: 'math-'+currentPlayer.PlayerGrade}
        };
      }

      // Prevents kid from changing url while grade is locked
      if (!!urlData.grade && urlData.grade !== 'typing' &&
        !((urlData.grade === gradesPayload.ela.internalName) || (urlData.grade === gradesPayload.math.internalName))) {
        if (urlData.grade.includes('ela-')) {
          this.actions.router.push(location.search + '#ela,' + gradesPayload.ela.internalName);
        } else if(urlData.grade.includes('math-')) {
          this.actions.router.push(location.search + '#math,' + gradesPayload.math.internalName);
        }
      }
    }

    if(gradesPayload!==null) {
      this.actions.player.setGrade(gradesPayload);
    } else {
      // actions.player.setGrade({ela: {grade: 'kindergarten', internalName: 'ela-kindergarten'}, math: {grade: 'kindergarten', internalName: 'math-kindergarten'}});
    }
  }


  startClassroomConnection() {
    if(!this.classroomConnection && !this.classroomInterval) {
      this.classroomConnection = true;
      this.classroomInterval = setInterval(()=>{
        this.classroomPing();
      }, 5000);
    }
  }
  stopClassroomConnection() {
    this.classroomConnection = false;
    API.deactivateToken();
    clearInterval(this.classroomInterval);
    this.classroomInterval = null;
  }

  classroomPing() {
    // if(this.failed_pings > 3) return;
    var self = this;

    API.getTokenState().then(resp => {
      if(resp.status==1) {
        let screen = URL.getScreen();

        // Token no longer active, go back to player selection screen
        if(resp.state === "idle") {
          if(screen!=='login' && screen!=='choosePlayer'){
            this.actions.router.push('#choosePlayer');
          }
        }
        else if(resp.state === 'assign') {
          // the teacher is assigning them to a specific game:
          // get the assigned game and update the token back to 'playing' call this more than once:
          API.getAssignment().then(info => {
            var assignment = info['assignment'];
            // at this point assignment is an array:
            if(assignment.length < 4) {
              // less than 4, invalid
            } else if(assignment.length > 5) {
              // greater than 5, invalid
            } else {
              if(screen!=='game') {
                this.actions.router.push(location.search + '#' + assignment.join(','));
                this.actions.game.autostartGame(true);
              }
            }

          });
        }
      }
    });
  }

}

let player = new Player();
export default player;
