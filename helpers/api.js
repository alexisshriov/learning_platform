import { promiseTimeout } from './promises';
import { bindActionCreators } from 'redux';
import { replace, push } from 'connected-react-router';
import cloneDeep from 'lodash/cloneDeep';

import user from '../services/user';
import { actions as userActions } from '../services/user/userActions';
import { actions as modalActions } from '../modules/modal/modalActions';
import { actions as gameActions } from '../modules/game/gameActions';
import { actions as choosePlayerActions } from '../modules/choosePlayer/choosePlayerActions';
import * as URL from './url';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import Tracking from "./tracking";


class API {

  constructor() {
    axiosRetry(axios, { retries: 3, retryDelay: (retryCount) => {
        return retryCount * 1000;
      } });

    this.options = {
      useCache: false,
      token: null,
      tokenType: null
    };

    this.store = null;
    this.actions = {};
  }

  /**
   * Give access to the redux store. Then bind any actions needed by API class.
   * @param {[object]} store the redux store
   */
  setStore(store){
    this.store = store;
    this.actions.router = { ...bindActionCreators( {replace, push}, store.dispatch) };
    this.actions.user = { ...bindActionCreators( userActions, store.dispatch) };
    this.actions.modal = { ...bindActionCreators( modalActions, store.dispatch) };
    this.actions.game = { ...bindActionCreators( gameActions, store.dispatch) };
    this.actions.choosePlayer = { ...bindActionCreators( choosePlayerActions, store.dispatch) };
  }

  /*
    *  401 means not logged in (no auth, or token invalid)
    *  403 means tried to access data that doesn't belong to them
    *  426 means basic member trying to access premium-only feature
    *  404 for not found
    *  400 for all other errors
    *
    *  special:
    *  3   connection error (axios)
   */
  applyMiddleware(resp, code, resolve, reject, options={}){
    options = {
      skipAuth: false,
      crashOnFail: true,
      ...options
    };
    // next or reject with reroute
    switch(code){
      case 200:
        resolve(resp);
        if('accountInfo' in resp){
          resp.accountInfo = true === resp.accountInfo ? {}: resp.accountInfo;
          this.actions.user.setAccountInfo(resp.accountInfo);
        }
        if('memberId' in resp){
          this.actions.user.setUserId(resp.memberId);
        }
        if(!options.skipAuth) {
          this.actions.user.setUser(true);
        }
        break;
      case 401:
        reject(resp);
        if(!options.skipAuth) {
          user.logout();
        }
        break;
      case 403:
        reject(resp);
        if(this.store===null || this.options.tokenType==='studentCode') {
          this.actions.router.replace('#login');
        } else {
          if(options.goToFail){
            this.actions.router.replace(options.goToFail);
          } else {
            this.actions.choosePlayer.jumpToUrl(location.hash);
            this.actions.router.replace('#choosePlayer');
          }
        }
        break;
      case 0:
        reject(resp);
        if(this.store===null || this.options.tokenType==='studentCode' || this.options.tokenType==='classroom') {
          this.actions.router.replace('#login');
        } else {
          if(options.goToFail){
            this.actions.router.replace(options.goToFail);
          } else {
            this.actions.choosePlayer.jumpToUrl(location.hash);
            this.actions.router.replace('#choosePlayer');
          }
        }
        break;
      case 426:
        reject(resp);
        if(!window.parent || (window.parent && window.location.href === window.parent.location.href)){
          this.actions.modal.showGeneralModal({
            title: "Upgrade Your Account",
            text: `<div>
              <p>Guided Lessons and progress tracking are only available for Education.com Premium members.</p>
              <p>Please consider upgrading to a paid account.</p>
            </div>`,
            dangerouslySetText: true
          });

        } else {
          if(window.parent.showPaywallModal) {
            window.parent.showPaywallModal();
          }
        }

        var url = URL.mapToObject();
        if(url.subject && url.grade && url.lesson) {
          this.actions.router.push(location.search + '#'+ url.subject+','+url.grade+','+url.lesson);
        }
        break;
      default:
        resolve(resp);
        if(options.crashOnFail){
          this.actions.modal.showErrorModal({message: 'There was a connection problem.'});
        }
        break;
    }
  }

  setToken(token, type){
    this.options.token = token;
    this.options.tokenType = type;
    // todo: check if in detail page first
    window.localStorage['token'] = token;
    window.localStorage['tokenType'] = type;
    if (type==='studentCode') {
      this.actions.user.setUserType('studentCode');
    } else if (type==='classroom') {
      this.actions.user.setUserType('classroom');
    }
  }
  unsetToken(){
    this.options.token = null;
    this.options.tokenType = null;
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('tokenType');
    this.actions.user.setUserType('standard');

  }

  /**
   * a wrapper around an ajax get.
   * @param  {[type]} url
   * @param  {[type]} data
   * @return {promise}
   */
  get(url, data={}, middlewareOptions={}, config={}) {
    var self = this;
    return new Promise((resolve, reject) => {
      if(this.options.token) data.token = this.options.token;
      axios.get(url, {params:{...data}, ...config}).then((response) => {
        var resp = response && response.data ? response.data : {data: response, status: 0};
        var code = response && response.status ? response.status : null;
        if('status' in resp && resp.status!=1) {
          code = resp.status;
        }
        self.applyMiddleware(resp, code, resolve, reject, middlewareOptions);
      }).catch(function(error) {
        var resp = error.response && error.response.data ? error.response.data : {data: error.response, status: 0};
        var code = error.response && error.response.status ? error.response.status : null;
        self.applyMiddleware(resp, code, resolve, reject, middlewareOptions);
      });
    });
  }

  post(url, data={}, middlewareOptions={}, options={}, config={}) {
    var self = this;
    return new Promise((resolve, reject) => {
      if(this.options.token) data.token = this.options.token;
      data.csrfToken = window.csrfToken;
      if(options.qs){
        data = self.jsonToQueryString(data);
      }
      axios.post(url, data, config).then((response) =>{
        var resp = response && response.data ? response.data : {data: response, status: 0};
        var code = response && response.status ? response.status : null;
        self.applyMiddleware(resp, code, resolve, reject, middlewareOptions);
      }).catch(function(error) {
        var resp = error.response && error.response.data ? error.response.data : {data: error.response, status: 0};
        var code = error.response && error.response.data ? error.response.data.code : null;
        self.applyMiddleware(resp, code, resolve, reject, middlewareOptions);
      });
    });
  }

  jsonToQueryString(json) {
    return Object.keys(json).map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
    }).join('&');
  }

  loginStudentAccessCode(code) {
    return this.get('/api/tokens/generateStudentCode/'+code, undefined, {skipAuth: true, crashOnFail: false, goToFail: '#login'});
  }
  loginClassroomAccessCode(code) {
    return this.get('/api/tokens/generateClassroom/'+code, undefined, {skipAuth: true, crashOnFail: false, goToFail: '#login'});
  }
  loginWithEmail(data) {
    this.unsetToken();
    return this.post('/', data, {skipAuth: true, crashOnFail: false, goToFail: '#login'}, {qs:1});
  }
  updateChild(data){
    switch(this.options.tokenType) {
      case "classroom":
        return this.post(' /api/children/update/classroom/'+data.id, {avatar: data.avatar} , {});
        break;
      case "studentCode":
        return this.post(' /api/children/update/student/'+data.id, {avatar: data.avatar} , {});
        break;
      default:
        return this.post(' /api/children/update/session/'+data.id, {avatar: data.avatar} , {});
        break;
    }
  }
  logout() {
    if(!this.options.token) {
      this.get('/?__logout', {}, {crashOnFail: false});
    } else {
      this.deactivateToken();
    }
    this.unsetToken();
  }
  // getProgressByChildAndAssignment(childId, assignmentId, exerciseInternalName, callback) {
  //   if(exerciseInternalName) {
  //     this.get('/api/assignment/progress/'+childId + '/' + assignmentId + '/' + exerciseInternalName,{},callback,callback);
  //   } else {
  //     this.get('/api/assignment/progress/'+childId + '/' + assignmentId,{},callback,callback);
  //   }
  // },
  getPlayersAndGroups() {
    let ret = {
      accountInfo: [],
      children: {
        "-1": {
          PlayerAvatarId: "-1",
          PlayerGrade: "preschool",
          PlayerId: "-1",
          PlayerName: "Guest",
          avatar: {id: "-1", internal_name: "guest"},
          id: "-1",
          internal_name: "guest"
        }
      },
      groups: {},
      premiumType: null
    };

    if ('singlePlayToken' in window.kidframe && window.kidframe.singlePlayToken) {
      return new Promise((resolve, reject) => {
        resolve(ret);
      });
    } else {
      let userStore = this.store.getState().user;
      if(userStore && userStore.embedMode==='detail') {
        if(userStore.memberType==='anonymous') {
          return new Promise((resolve, reject) => {
            resolve(ret);
          });
        } else if(window.kidframe && window.kidframe.childrenAndGroups) {
          return new Promise((resolve, reject) => {
            resolve(window.kidframe.childrenAndGroups);
          });
        }
      }
      switch(this.options.tokenType) {
        case "classroom":
          return this.get('/api/children/childrenGroupsByClassroomToken', {}, {crashOnFail: false});
          break;
        case "studentCode":
          // todo: currently we are not hitting this endpoint for student tokens. ok or refactor?
          return this.get('/api/children/childrenGroupsByStudentToken', {}, {crashOnFail: false});
          break;
        default:
          return this.get('/api/children/childrenGroupsBySession', {}, {crashOnFail: false});
          break;
      }
    }
  }

  getAssignments(childId, sorted=true) {
    if(!childId || childId<=0) {
      return {"status":true,"assignments":[]};
    }

    let data = {};
    if(sorted){
      data = {"sortBy" : "dueDate"};
    }

    return this.get('/api/assignments/child/'+childId, data, {skipAuth: true});
  }

  getChallenges(childId) {
    let data = {};
    if(childId){
      data['childId'] = childId;
    }
    return this.get('/api/challenges/getChallenges/', data, {skipAuth: true});
  }

  getNextChallengeItem(data={}) {
    return this.get('/api/challenges/getNext/', data, {skipAuth: true});
  }

  getSingleExerciseMetainfo(gameId) {
    if(window.kidframe && window.kidframe.singleGame) {
      return new Promise( (resolve, reject)=>{
        resolve(window.kidframe.singleGame);
      });
    } else {
      return this.get('/api/sequences/custom', {gameId}, {skipAuth: true, crashOnFail: false});
    }
  }

  getPlayer(childId) {
    return this.get('/api/children/child/'+childId, {}, {skipAuth: true});
  }

  getGiftByPlayer(childId) {
    return this.get('/api/childRewards/get_gift_by_child/'+childId, {}, {skipAuth: true});
  }

  updateGiftToSeen(childId) {
    return this.post('/api/childRewards/update_gift_to_seen/'+childId, {}, {skipAuth: true});
  }

  // getExerciseContent: function(childId, internalName, sessionId, assignmentId, callback) {
  //Api.setLastExercisePlayed(childId,internalName);

  // var run = function(value) {
  //   if(false && value) {
  //     // TODO: fetch from actual api instead of cache if user is online
  //     callback(value);
  //   }
  //   else {
  //     Api.get('/api/sequences/exercise_content',{
  //         childId: childId,
  //         internalName: internalName,
  //         sessionId: sessionId,
  //         assignmentId: assignmentId,
  //         hostName: location.hostname
  //     },function(response) {
  //         if(Api.options.useCache) Cache.storeExerciseContent(childId, internalName, response);
  //         callback(response);
  //     },callback);
  //   }
  // };
//
  //   if(Api.options.useCache) Cache.retrieveExerciseContent(childId, internalName, run);
  //   else run();
  // },
  trackEvent(data) {
    if ('singlePlayToken' in window.kidframe && window.kidframe.singlePlayToken) {
      return;
    }

    return this.post('/api/track/event', {data: data}, {crashOnFail: false});
  }

  getExperimentId(experimentId) {
    return this.get('/api/brainzy/experiment/'+experimentId, undefined, {skipAuth: true});
  }

  // generateClassroomToken: function(classroomCode, callback) {
  //   Api.get('/api/tokens/generateClassroom/'+classroomCode, {}, callback, callback);
  // },
  // generateStudentCodeToken: function(studentCode, callback) {
  //     Api.get('/api/tokens/generateStudentCode/'+studentCode, {}, callback, callback);
  // },
  deactivateToken() {
    if(!this.options.token) return;
    return this.get('/api/tokens/deactivate/'+this.options.token, undefined, {skipAuth: true, crashOnFail: false});
  }
  activateToken() {
    if(!this.options.token) return;
    var self = this;
    window.onbeforeunload = function(){
      self.deactivateToken();
    };
    return this.get('/api/tokens/activate', undefined, {skipAuth: true, crashOnFail: false});
  }
  getTokenState() {
    if(!this.options.token) return;
    return this.get('/api/tokens/state', undefined, {skipAuth: true, crashOnFail: false}, {headers: {'X-classroom-access-ping': '1'}});
  }

  getSequence() {
    if(window.kidframe && window.kidframe.sequence) {
      return new Promise( (resolve, reject)=>{
        resolve(window.kidframe.sequence);
      });
    } else {
      return this.get('/api/sequences/list', undefined, {skipAuth: true, crashOnFail: false});
    }
  }

  getSkillMap() {
    if(window.kidframe && window.kidframe.skills) {
      return new Promise( (resolve, reject)=>{
        resolve(window.kidframe.skills);
      });
    } else {
      return this.get('/api/skills', undefined, {skipAuth: true, crashOnFail: false});
    }
  }

  getExerciseContent(childId, internalName, sessionId, assignmentId, guestMode) {
    let data = {
      childId: childId,
      internalName: internalName,
      sessionId: sessionId,
      assignmentId: assignmentId,
      hostName: location.hostname,
      singlePlayToken: ('singlePlayToken' in window.kidframe && window.kidframe.singlePlayToken) ? window.kidframe.singlePlayToken : false
    };
    let userStore = this.store.getState().user;
    if(userStore.embedMode === 'detail'){
      data.embedMode = 'detail';
    }

    return this.get('/api/sequences/exercise_content', data);
  }

  getProgress(childId, sequence) {
    // Make player's progress object based on sequence
    var playerSequence = cloneDeep(sequence);
    let exerciseMap = {};
    let pathMap = {};

    // create a clone `playerSequence` of the sequence, adding `progress` object containing 'possible' and 0-set 'earned'.
    for (var s in playerSequence) {
      let subject = playerSequence[s];
      for (var c in subject.courses) {
        var course = subject.courses[c];
        for (var l in course.lessons) {
          var lesson = course.lessons[l];
          for (var e in lesson.exercises) {
            var exercise = lesson.exercises[e];
            exercise['progress'] = {
              possible: 1*exercise.pointsPossible,
              earned: 0
            };
            exerciseMap[exercise.internalName] = [subject.internalName, course.internalName, lesson.internalName, exercise.internalName];
            pathMap[subject.internalName+','+course.internalName+','+lesson.internalName+','+exercise.internalName] = exercise.progress;
          }
        }
      }
    }

    if(childId!=-1) {
      return this.get('/api/guided_lessons/progress/' + childId, {}).then((resp) => {
        return new Promise((resolve, reject) => {
          let skillMastery = {};
          var list = [];
          for (var lessonKey in resp.lessons) {
            let lesson = resp.lessons[lessonKey];
            for (var id in lesson.exercises) {
              let exercise = lesson.exercises[id];

              for (let id in exercise.proficiency) {
                let skill = exercise.proficiency[id];

                if(skill.proficiency > 0) {
                  let skillName = skill.skill.split(':').pop();
                  if (skill.count >= 5) {
                    skillMastery[skillName] = skill.proficiency;
                  } else {
                    //@TODO: Delete this 'over 5' once kidframe skill mastery and progress tracker are aligned
                    skillMastery[skillName] = skill.proficiency * (skill.count / 5);
                  }
                }
              }
              var path = exerciseMap[id];
              if (path) {
                let joinedPath = path.join(',');
                list.push({
                  date: exercise.dateStarted,
                  full: joinedPath,
                  path: path,
                });
                pathMap[joinedPath].earned = exercise.pointsEarned; // todo: if differing denominators, scale earned by sequence's pointsPossible
              }
            }
          }
          list.sort(function (a, b) {
            return b.date - a.date;
          });

          var getPathDate = function (prefix) {
            var reg = new RegExp('^' + prefix + ',');
            for (var i = 0; i < list.length; i++) {
              if (reg.test(list[i].full)) {
                return {
                  path: list[i].path,
                  date: list[i].date
                };
              }
            }
            return {path: [], date: 0};
          };

          var lastPlayed = {
            path: list.length ? list[0].path : [],
            date: list.length ? list[0].date : 0
          };

          for (var s in sequence) {
            var subject = sequence[s];
            lastPlayed[subject.internalName] = getPathDate(subject.internalName);
            for (var i = 0; i < subject.courses.length; i++) {
              var course = subject.courses[i];
              lastPlayed[subject.internalName][course.internalName] = getPathDate(subject.internalName + ',' + course.internalName);
              for (var l = 0; l < course.lessons.length; l++) {
                var lesson = course.lessons[l];
                lastPlayed[subject.internalName][course.internalName][lesson.internalName] = getPathDate(subject.internalName + ',' + course.internalName + ',' + lesson.internalName);
              }
            }
          }
          let ret = {
            status: 1,
            memberId: resp.memberId,
            playerSequence: playerSequence,
            lastPlayed: lastPlayed,
            badges: resp.badges,
            badgesCount: resp.badgesCount * 1 || 0,
            pointsCount: resp.pointsCount * 1 || 0,
            skillMastery: skillMastery,
          };
          resolve(ret);
        });
      });

    } else {
      // Guest
      return new Promise((resolve, reject) => {
        let ret = {
          status: 1,
          playerSequence: playerSequence,
          badges: {
            allBadges : {},
            badgesRecentNum: 0,
            totalBadges: 0
          },
          badgesCount: 0,
          pointsCount: 0
        };
        resolve(ret);
      });

    }
  }

  addChild(data) {
    return this.post('/api/child', data, {skipAuth: true, crashOnFail: false}, {});
    // return axios.post('/api/child', data, {})
  }

  // addChild: function(name, gender, avatar, callback) {
  //   var success = function(resp) {
  //     if(resp && resp.memberId) {
  //       // Invalidate local storage cache
  //       var key = 'educ-api.getStudents.v1.'+resp.memberId;
  //       window.localStorage.removeItem(key);
  //     }
  //     callback(resp);
  //   };
  //
  //   Api.post('/api/child',{
  //     childName: name,
  //     childDOB: '0000-00',
  //     childGender: gender,
  //     childAvatar: avatar
  //   },success,callback);
  // },
  // getLastExercisePlayed: function(childId,lastPlayed,filter, callback) {
  //   var s = filter.subject;
  //   var c = filter.course;
  //   var l = filter.lesson;
  //   var e = filter.exercise;
  //
  //   //var path = lastPlayed.path;
  //   var path = [];
  //   if (s) {
  //     path.push(s);
  //     if (c) {
  //       path.push(c);
  //       if (l) {
  //         path.push(l);
  //         if (e) {
  //           path.push(e);
  //         }
  //         else if (lastPlayed[s] && lastPlayed[s][c] && lastPlayed[s][c][l] && lastPlayed[s][c][l].path && lastPlayed[s][c][l].path.length) {
  //           path = lastPlayed[s][c][l].path;
  //         }
  //       }
  //       else if (lastPlayed[s] && lastPlayed[s][c] && lastPlayed[s][c].path && lastPlayed[s][c].path.length){
  //         path = lastPlayed[s][c].path;
  //       }
  //     }
  //     else if (lastPlayed[s] && lastPlayed[s].path && lastPlayed[s].path.length){
  //       path = lastPlayed[s].path;
  //     }
  //   }
  //   else if (lastPlayed.path && lastPlayed.path.length) {
  //     path = lastPlayed.path;
  //   }
  //
  //   callback({
  //     status: 1,
  //     path: path
  //   });
  //
  // }
  //

  // Gets pushed down playlist from classroom mode. Not the same as an official assignment.
  getAssignment() {
    return this.get('/games/request/token/getassignment', undefined, {skipAuth: true});
  }

}
let Api = new API();
export default Api;
