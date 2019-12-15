import { bindActionCreators } from 'redux';
import { replace, push } from 'connected-react-router';
import { actions as playerActions } from '../services/player/playerActions';
import { actions as gameActions } from '../modules/game/gameActions';
import * as URL from '../helpers/url';
import {actions as choosePlayerActions} from "../modules/choosePlayer/choosePlayerActions";

import Player from '../services/player';


export const sequenceMiddleware = store => next => action => {
  const actions = {
    player: {...bindActionCreators(playerActions, store.dispatch)},
    game: {...bindActionCreators(gameActions, store.dispatch)},
    router: { ...bindActionCreators( {push}, store.dispatch) }
  };

  let state = store.getState();

  if(action.type === "@@router/LOCATION_CHANGE") {
    let urlData = URL.mapToObject(undefined, action.payload.location.hash);

    if(urlData.screen==='challenge'){
      next(action);
      return;
    }

    if(urlData.assignment){
      let playerId = state.player.currentPlayerId;
      let progress = playerId? state.player.progress[playerId]: null;
      let foundAssignment = false;

      for (var assignmentKey in progress.assignments) {
        if(progress.assignments[assignmentKey].id === urlData.assignment.id) {
          foundAssignment = true;
          // transforming the assignment to the same format as the lessons
          let assignment = {
            ...progress.assignments[assignmentKey],
            exercises: Object.values(progress.assignments[assignmentKey].items)
          };
          delete assignment.items;

          let exercisesList = assignment.exercises;
          // need to set the default values to incomplete
          for(let currentListKey in exercisesList) {
            exercisesList[currentListKey].progress ={}
            exercisesList[currentListKey].progress.possible = 1;
            exercisesList[currentListKey].progress.earned = 0;
          }
          // checking to see if there is progress made on the assignment and overide the default value;
          if(assignment.progress){
            for(let progressItemKey in assignment.progress.items) {
              for(let currentListKey in exercisesList) {
                if(assignment.progress.items[progressItemKey].internalName === exercisesList[currentListKey].internalName){
                  exercisesList[currentListKey].progress = assignment.progress.items[progressItemKey];
                  exercisesList[currentListKey].progress.possible = 1;
                  exercisesList[currentListKey].progress.earned = exercisesList[currentListKey].progress.score;
                  break;
                }
                if('game' in urlData){
                  for(var e=0; e<assignment.exercises.length; e++){
                    if(urlData.game===assignment.exercises[e].internalName){
                      let game = assignment.exercises[e];
                      // actions.game.setCurrentGame(game);
                      actions.game.selectGame({game: game});
                      break;
                    }
                  }
                }
              }
            }
          }
          next(action);
          actions.player.setCurrentPlaylist(assignment);

          break;
        }
      }

      if(!foundAssignment){
        actions.router.push(location.search + '#assignments');
      }

    } else {

      if(!urlData.singlePlay) {

        // build the player's playlist (lesson sequence)
        let setCurrentPlaylistSuccess = false;
        let setCurrentGameSuccess = false;

        if (urlData.subject) {
          if (urlData.grade) {
            let playerId = state.player.currentPlayerId;
            let progress = playerId ? state.player.progress[playerId] : null;
            if(!progress) {
              return;
            }
            let playerSequence = progress.playerSequence;
            let subject = playerSequence[urlData.subject];

            // check whether the subject and grade are valid
            let subjectValid = playerSequence[urlData.subject] ? true : false;
            let gradeValid = false;
            if (subjectValid) {
              for (var c = 0; c < subject.courses.length; c++) {
                if (urlData.grade === subject.courses[c].internalName) {
                  gradeValid = true;
                  break;
                }
              }
            }
            if (!subjectValid || !gradeValid) {
              actions.router.push(location.search + "#chooseQuest");
            }

          } else {
            // missing grade from "subject,grade" path
            actions.router.push(location.search + "#chooseQuest");
          }
        }

        if (urlData.lesson) {

          let playerId = state.player.currentPlayerId;
          let progress = playerId ? state.player.progress[playerId] : null;

          let playerSequence = progress.playerSequence;
          let subject = playerSequence[urlData.subject];

          let validLesson = false;

          for (var c = 0; c < subject.courses.length; c++) {
            if (urlData.grade === subject.courses[c].internalName) {
              let course = subject.courses[c];
              for (var l = 0; l < course.lessons.length; l++) {
                if (urlData.lesson === course.lessons[l].internalName) {
                  validLesson = true;
                  let lesson = course.lessons[l];
                  next(action);
                  actions.player.setCurrentPlaylist(lesson);
                  setCurrentPlaylistSuccess = true;
                  // build the player's current game, if available
                  if (urlData.game) {
                    for (var e = 0; e < lesson.exercises.length; e++) {
                      if (urlData.game === lesson.exercises[e].internalName) {
                        let game = lesson.exercises[e];
                        setCurrentGameSuccess = true;
                        actions.game.selectGame({game: game});

                        break;
                      }
                    }
                  }
                  break;
                }
              }
            }
          }

          if (!validLesson) {
            actions.router.push(location.search + "#" + urlData.subject + "," + urlData.grade);
          }
        }
        if (!setCurrentPlaylistSuccess) {
          actions.player.setCurrentPlaylist(null);
        }
        if (!setCurrentGameSuccess) {
          actions.game.unsetGame();
          // actions.game.selectGame(null);
        }

      }
    }

    next(action);

  } else {

    next(action);
  }
};
