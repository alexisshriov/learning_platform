import {
  FETCH_PLAYERS,
  ADD_PLAYER,
  ADDING_PLAYER,
  SET_PLAYERS,
  SET_PROGRESS,
  UPDATE_EXERCISE_PROGRESS,
  SET_CURRENT_PLAYER,
  UNSET_PLAYERS_AND_PROGRESS,
  SET_SEQUENCES,
  FETCH_SEQUENCES,
  SET_CURRENT_PLAYLIST,
  SET_SINGLE_EXERCISE,
  REFRESHED_CURRENT_PLAYLIST_VIEW,
  SET_GRADE,
  SET_AVATAR,
  FETCH_ASSIGNMENTS,
  SET_ASSIGNMENTS,
  FETCH_CHALLENGES,
  SET_CHALLENGES,
  UPDATE_CHALLENGE,
  SET_CHALLENGE_POSITION,
  SET_CURRENT_CHALLENGE_POSITION,
  SET_CURRENT_CHALLENGE_ID,
  SET_SKILLMAP,
  UPDATE_SKILL,
  SET_GIFT,
  ADD_PLAYER_ERROR,
} from './playerActions';

const initialState = {
  players: {},
  progress: {},
  addPlayerError: {
     error: false
  },
  gradesSelected: {},
  currentPlayerId: null,
  sequences: {},
  assignments: {},
  challenges: {},
  challengePositions: {},
  currentChallengeId: null,
  assignmentsLoaded: false,
  playersLoaded: false,
  progressLoaded: false,
  sequenceLoaded: false,
  refreshCurrentPlaylistView: false,
  currentPlayerSet: false,
  currentPlaylist: null,
  singleExercise: null,
  skillMap: null,
  gift: null,
  giftLoaded: false,
};


export const player = (state = initialState, action) => {

  switch (action.type) {
    case FETCH_PLAYERS:
      return {
        ...state,
        playersLoaded: false
      };
      break;
    case ADDING_PLAYER:
      return {
        ...state,
        addingPlayer: true
      };
      break;
    case ADD_PLAYER:
      let newPlayer = {...state.players};
      newPlayer.noGroups.children[action.payload.PlayerId] = action.payload;
      return {
        ...state,
        addingPlayer: false,
        players:{
          ...newPlayer
        },
        addPlayerError: {
          error: false
        }
      };
      break;
    case ADD_PLAYER_ERROR:
      let playerError = {...action.payload.error};
      return {
        ...state,
        addPlayerError:{
          error: action.payload.isError,
          ...playerError
        }
      };
      break;

    case SET_PLAYERS:
      return {
        ...state,
        players: {
          ...state.players,
          ...action.payload
        },
        playersLoaded: true
      };
      break;

    case SET_PROGRESS:
      return {
        ...state,
        progress: {
          ...state.progress,
          ...action.payload
        },
        progressLoaded: true
      };
      break;

    case UPDATE_EXERCISE_PROGRESS:
      let playerId = action.payload.playerId;
      let sequenceType = action.payload.sequenceType; // assignment, lesson
      let assignmentId = action.payload.assignmentId ? action.payload.assignmentId : null;
      let subject = action.payload.subject ? action.payload.subject : null;
      let grade = action.payload.grade ? action.payload.grade : null;
      let lesson = action.payload.lesson ? action.payload.lesson : null;
      let exercise = action.payload.exercise ? action.payload.exercise : null;
      let progress = action.payload.progress; // assume that payload.progress is formatted per sequenceType requirements
      let deltaPoints = action.payload.deltaPoints ? action.payload.deltaPoints : 0; // todo: update overall player stats
      let deltaBadges = action.payload.deltaBadges ? action.payload.deltaBadges : []; // todo: update overall player stats

      let updatedProgress = {...state.progress};
      let updatedCurrentPlaylist = {};
      if(updatedProgress[playerId]){
        if(sequenceType==='assignment'){
          for(let a=0; a<updatedProgress[playerId].assignments.length; a++){
            if(updatedProgress[playerId].assignments[a].id===assignmentId){
              // get base exercise info:
              let baseExercise = null;
              let overallScore = 0;
              let assignmentCompleted = 1;
              for(let be=0; be<updatedProgress[playerId].assignments[a].items.length; be++) {
                let assignmentItem = updatedProgress[playerId].assignments[a].items[be];
                if(assignmentItem.internalName===exercise) {
                  baseExercise = assignmentItem;
                  if(progress.earned >= assignmentItem.score || isNaN(assignmentItem.score)){
                    overallScore += progress.earned;
                  } else {
                    overallScore += assignmentItem.score;
                  }
                } else {
                  if(assignmentItem.completion === 0) {
                    assignmentCompleted = 0;
                  }
                  if(!isNaN(assignmentItem.score)) {
                    overallScore += assignmentItem.score;
                  }
                }
              }
              if(overallScore > 0){
                overallScore /= updatedProgress[playerId].assignments[a].items.length;
              }

              // todo?: this is terrible. progress should always be set, and should be merged with the playlist
              if(!updatedProgress[playerId].assignments[a].progress || (updatedProgress[playerId].assignments[a].progress && !updatedProgress[playerId].assignments[a].progress.items)){
                updatedProgress[playerId].assignments[a].progress = {
                  items: [],
                  completion: 0
                };
              }
              let existsInProgress = false;
              // create hacky progress object
              let progressDef = {
                internalName: baseExercise.internalName,
                completion: 1,
                earned: Math.round(progress.earned*3),
                possible: baseExercise.pointsPossible,
                score: 0
              };
              if(baseExercise.is_scored) {
                progressDef.score = progress.score ? progress.score : (progressDef.possible ? progressDef.earned/progressDef.possible : 0);
              }
              if(progress.metrics){
                progressDef.metrics = progress.metrics;
              }
              // if there was one already, append the hacky progress object to existing object
              for(let e=0; e<updatedProgress[playerId].assignments[a].progress.items.length; e++){
                if(updatedProgress[playerId].assignments[a].progress.items[e].internalName === exercise){
                  existsInProgress = true;
                  let exerciseProgress = updatedProgress[playerId].assignments[a].progress.items[e];
                  // only update if the score was at least as good as last time
                  if(exerciseProgress.score <= progressDef.score || !exerciseProgress.completion) {
                    updatedProgress[playerId].assignments[a].progress.items[e] = {
                      ...exerciseProgress,
                      ...progressDef
                    };
                  }
                  break;
                }
              }

              // otherwise, push the progress object into assignment's progress.
              if(!existsInProgress){  // todo: this should never be happening since we backfill the assignment structure in the API handler. check?
                updatedProgress[playerId].assignments[a].progress.items.push(progressDef);
              }
              updatedProgress[playerId].assignments[a].progress.score = overallScore;
              updatedProgress[playerId].assignments[a].progress.completion = assignmentCompleted;

              // perform a complete hack duplicating assignment.progress[...] in assignment.items.progress. Yes, this sucks:
              for(let i=0; i<updatedProgress[playerId].assignments[a].progress.items.length; i++){
                let item = updatedProgress[playerId].assignments[a].items[i];
                if(item) {
                  updatedProgress[playerId].assignments[a].items[i].progress = {...updatedProgress[playerId].assignments[a].progress.items[i].progress};
                } else {
                  updatedProgress[playerId].assignments[a].items.push( {...updatedProgress[playerId].assignments[a].progress.items[i].progress} );
                }
              }

              // Update the current playlist
              updatedCurrentPlaylist = updatedProgress[playerId].assignments[a];
              for(let e=0; e<updatedCurrentPlaylist.progress.items.length; e++){
                let exerciseProgress = updatedCurrentPlaylist.progress.items[e];
                if(updatedCurrentPlaylist.items[e]){
                  updatedCurrentPlaylist.items[e]['progress'] = exerciseProgress;
                }
              }
              updatedCurrentPlaylist['exercises'] = updatedCurrentPlaylist.items;

              break;
            }
          }


        } else if(sequenceType==='lesson'){

          if(updatedProgress[playerId].playerSequence[subject]) {
            for (let c=0; c<updatedProgress[playerId].playerSequence[subject].courses.length; c++) {
              if(updatedProgress[playerId].playerSequence[subject].courses[c].internalName===grade){
                for (let l=0; l<updatedProgress[playerId].playerSequence[subject].courses[c].lessons.length; l++) {
                  if(updatedProgress[playerId].playerSequence[subject].courses[c].lessons[l].internalName===lesson) {
                    for(let e=0; e<updatedProgress[playerId].playerSequence[subject].courses[c].lessons[l].exercises.length; e++){
                      if(updatedProgress[playerId].playerSequence[subject].courses[c].lessons[l].exercises[e].internalName===exercise){
                        let progressDef = {
                          earned: progress.earned
                        };
                        if(progress.metrics){
                          progressDef.metrics = progress.metrics;
                        }
                        let baseProgress = updatedProgress[playerId].playerSequence[subject].courses[c].lessons[l].exercises[e].progress;
                        // only update if the score was at least as good as last time
                        if(baseProgress.earned <= progressDef.earned) {
                          updatedProgress[playerId].playerSequence[subject].courses[c].lessons[l].exercises[e].progress = {
                            ...baseProgress,
                            ...progressDef
                          };
                        }
                        break;
                      }
                    }
                    // Update the current playlist
                    updatedCurrentPlaylist = updatedProgress[playerId].playerSequence[subject].courses[c].lessons[l];
                    break;
                  }
                }
                break;
              }
            }
          }
        }
      }
      updatedProgress[playerId].pointsCount += deltaPoints;
      updatedProgress[playerId].badgesCount += deltaBadges.length;
      if('badges' in updatedProgress && 'totalBadges' in updatedPlayerProgress.badges) {
        updatedProgress[playerId].badges.totalBadges += deltaBadges.length;
      }
      if('badges' in updatedProgress && 'badgesRecentNum' in updatedPlayerProgress.badges) {
        updatedProgress[playerId].badges.badgesRecentNum += deltaBadges.length;
      }

      return {
        ...state,
        progress: {
          ...state.progress,
          ...updatedProgress
        },
        currentPlaylist: updatedCurrentPlaylist,
        refreshCurrentPlaylistView: true
      };
      break;

    case SET_GRADE:
      let newState = {
        ...state
      };
      if('math' in action.payload) {
        newState = {
          ...newState,
          gradesSelected: {
            ...newState.gradesSelected,
            math: {...action.payload.math}
          }
        }
      }
      if('ela' in action.payload) {
        newState = {
          ...newState,
          gradesSelected: {
            ...newState.gradesSelected,
            ela: {...action.payload.ela}
          }
        }
      }
      return newState;
      break;
    case SET_AVATAR:
        let currentState = state;
        currentState.players.noGroups.children[action.payload.id].avatar = action.payload.avatar;
        currentState.players.noGroups.children[action.payload.id].PlayerAvatarId = action.payload.avatar.id;
        if(currentState.players.noGroups.children[action.payload.id].groups.length > 0){
            for (var groupId in currentState.players.noGroups.children[action.payload.id].groups) {
                if (groupId in currentState.players.groups) {
                    currentState.players.groups[groupId].children[action.payload.id].avatar = action.payload.avatar;
                    currentState.players.groups[groupId].children[action.payload.id].PlayerAvatarId = action.payload.avatar.id;
                }
            }
        }
        return {
            ...currentState
        };
        break;
    case SET_CURRENT_PLAYER:
      // all children appear in 'noGroups', even if they are in in a group
      if('noGroups' in state.players && state.players.noGroups.children[action.payload.id]){
        return {
          ...state,
          currentPlayerSet: true,
          currentPlayerId: action.payload.id,
          gradesSelected: {...initialState.gradesSelected},
          currentChallengeId: null
        }
      } else {
        return state;
      }
      break;

    case UNSET_PLAYERS_AND_PROGRESS:
      return {
        ...state,

        players: {...initialState.players},
        progress: {...initialState.progress},
        currentPlayerId: initialState.currentPlayerId,
        currentPlayerSet: initialState.currentPlayerSet,
        gradesSelected: {...initialState.gradesSelected},
        playersLoaded: initialState.playersLoaded,
        currentChallengeId: null
      };
      break;

    case FETCH_SEQUENCES:
      return {
        ...state,
        sequenceLoaded: false
      };
      break;

    case SET_SEQUENCES:
      return {
        ...state,
        sequenceLoaded: true,
        sequences: {...action.payload}
      };
      break;

    case FETCH_ASSIGNMENTS:
      return {
        ...state,
        assignmentsLoaded: false
      };
      break;

    case SET_ASSIGNMENTS:
      let updatedPlayerProgress = {...state.progress[action.payload.playerId]};
      updatedPlayerProgress.assignments = [...action.payload.assignments];
      let newProgress = {
        ...state.progress
      };
      newProgress[action.payload.playerId] = updatedPlayerProgress;
      return {
        ...state,
        assignmentsLoaded: true,
        progress: newProgress
      };
      break;

    case FETCH_CHALLENGES:
      return {
        ...state,
        challengesLoaded: false
      };
      break;

    case SET_CHALLENGES:
      return {
        ...state,
        challengesLoaded: true,
        challenges: {
          ...state.challenges,
          [action.payload.playerId]: {...action.payload.challenges}
        },
        challengePositions: {
          ...state.challengePositions,
          [action.payload.playerId]: {...action.payload.positions}
        }
      };
      break;

    case UPDATE_CHALLENGE:
      return {
        ...state,
        challenges: {
          ...state.challenges,
          [action.payload.playerId]: {
            ...state.challenges[action.payload.playerId],
            [action.payload.challengeId]: action.payload.challenge
          }
        }
      };
      break;

    case SET_CHALLENGE_POSITION:
      return {
        ...state,
        challengePositions: {
          ...state.challengePositions,
          [action.payload.playerId]: {
            ...state.challengePositions[action.payload.playerId],
            [action.payload.challengeId]: action.payload.position
          }
        }
      };
      break;

    case SET_CURRENT_CHALLENGE_ID:
      return {
        ...state,
        currentChallengeId: action.payload
      };
      break;

    case SET_CURRENT_PLAYLIST:
      return {
        ...state,
        currentPlaylist: action.payload ? {...action.payload} : null,
        refreshCurrentPlaylistView: action.payload ? true : false
      };
      break;

    case SET_SINGLE_EXERCISE:
      return {
        ...state,
        singleExercise: action.payload ? {...action.payload} : null
      };
      break;

    case REFRESHED_CURRENT_PLAYLIST_VIEW:
      return {
        ...state,
        refreshCurrentPlaylistView: false
      };
      break;

    case SET_SKILLMAP:
      return {
        ...state,
        skillMap: action.payload
      };
    break;

    case UPDATE_SKILL:
      let currentPlayerId = action.payload.playerId;
      return {
        ...state,
        progress: {
          ...state.progress,
          [currentPlayerId]: {
            ...state.progress[currentPlayerId],
            skillMastery: {
              ...state.progress[currentPlayerId].skillMastery,
              [action.payload.skill]: action.payload.proficiency
            }
          }
        }
      };

    case SET_GIFT:
      if(action.payload !== null) {
        return {
          ...state,
          gift: {
            message: action.payload.message,
            from: action.payload.from,
            sticker: action.payload.sticker,
          },
          giftLoaded: action.payload.giftLoaded
        };
      } else {
        return {
          ...state,
          gift: null,
          giftLoaded: false,
        }
      }

    default:
      return state;
  }
};
