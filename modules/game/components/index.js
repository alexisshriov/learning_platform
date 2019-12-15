import React, { Fragment } from 'react';
import ReactTimeout from 'react-timeout';
import { CSSTransitionGroup } from 'react-transition-group';
import { Howl, Howler } from 'howler';
import SelectPlayer from '../../../widgets/selectPlayer';

import Controls from './controls';

import API from '../../../helpers/api.js';
import player from '../../../services/player';
import * as URL from '../../../helpers/url';
import Tracking from '../../../helpers/tracking';
import Gift from '../../../widgets/gift.js';

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      exercise: null,  // This holds a reference to the exercise. Same as `iframe.contentWindow`
      hintState: null,
      suggestingHintState: false,
      lockPlayButton: false,
      playedFirstGame: this.props.playedFirstGame,
    };

    this.currentPlaylist = null;
    this.gameObj = null;

    this.focusInterval = null;

    this.THREE_STAR_THRESHOLD = 0.85;
    this.TWO_STAR_THRESHOLD = 0.5;

      this.audio = {};
    this.audio.start = new Howl({src: [prefixCDN('/assets/kidframe/audio/button_start.ogg'), prefixCDN('/assets/kidframe/audio/button_start.mp3')]});

    this.generateGlobalUI = this.generateGlobalUI.bind(this);
    this.clickStartGame = this.clickStartGame.bind(this);
    this.drawGameFrame = this.drawGameFrame.bind(this);
    this.finishExercise = this.finishExercise.bind(this);
    this.setSuggestingHintState = this.setSuggestingHintState.bind(this);

    this.clickPlayListener = this.clickPlayListener.bind(this);


    // globalUI hooks:
    this.globalUI = {};
    this.generateGlobalUI();

    document.addEventListener('clickPlay', this.clickPlayListener);
  }

  clickPlayListener(e) {
    if( !this.props.gameLoadState || this.props.gameLoadState === 'set') {
      this.clickStartGame();
    }
  }

  setSuggestingHintState(state){
    this.setState({suggestingHintState: !!state});
  }


  generateGlobalUI() {
    let url = URL.mapToObject();

    this.globalUI = {
      type: "kidframe-v2",
      deltaPoints: 0,
      deltaBadges: [],
      exerciseFinished: false,

      // legacy stuff that is still necessary:
      current_exercise: null,
      assignment: url.assignment ? url.assignment : { id: null },
      current_play_id: this.props.currentGameData.playId ? this.props.currentGameData.playId : null,
      childid: this.props.player.currentPlayerId ? this.props.player.currentPlayerId : null,
      token: API.options.token ? API.options.token : null,

      next_game_overlay: {
        hide: ()=>{
          console.debug('hide');
        }
      },
      destroyCurrentGame: ()=>{
        console.debug('destroy current game');
      },
      enablePauseButton: ()=>{
        console.debug('enable pause button (unneeded, but we should remove pause from learnosity)');
      },
      enableRepeatQuestion: ()=>{
        this.setState({hintState: true});
        console.debug('enable hint button (legacy)');
      },
      disableRepeatQuestion: ()=>{
        this.setState({hintState: false});
        this.setSuggestingHintState(false);
        console.debug('disable hint button (legacy)');
      },
      enableHintButton: ()=>{
        this.setState({hintState: true});
        console.debug('enable hint button');
      },
      disableHintButton: ()=>{
        this.setState({hintState: false});
        this.setSuggestingHintState(false);
        console.debug('disable hint button');
      },
      suggestHint: ()=>{
        this.setSuggestingHintState(true);
        console.debug('suggest hint');
      },
      showHint: (data)=>{
        console.debug('show hint', data);
      },
      hideHint: ()=>{
        console.debug('hide hint');
      },
      showNoticeOverlay: (header, text, class_name)=>{
        this.props.modalActions.showGeneralModal({
          title: header,
          text: text,
          dangerouslySetText: true
        });
      },
      callback: ()=>{
        this.props.startGame();
      },
      finishExercise: ()=> {
        this.finishExercise.bind(this);
      },
      logEvent: (data)=>{
        if ('singlePlayToken' in window.kidframe && window.kidframe.singlePlayToken) {
            return;
        }

        var self = this;

        var type = data.type;
        if(!type) return;

        data.childId = data.childId || this.props.player.currentPlayerId;
        data.playId = data.playId || this.props.currentGameData.playId;
        data.sessionId = data.sessionId || this.sessionId || null;
        data.token = API.options.token;

        if(this.assignment) {
          // data.assignmentId = this.assignment.id;
        }

        if(data.rewardPoints) {
          this.globalUI.deltaPoints += data.rewardPoints;
        }

        API.trackEvent(data).then((resp)=>{
          if(resp.badges && resp.badges.length) {
            self.globalUI.deltaBadges = [
              ...self.globalUI.deltaBadges,
              ...resp.badges
            ];

            // stripped badge data for tracking
            let strippedBadges = self.globalUI.deltaBadges.map((badge)=>{
              let newBadge = {...badge};
              delete newBadge['imagePath'];
              return newBadge;
            });

            Tracking.track('Badges Earned', {badges: strippedBadges, amount:strippedBadges.length});
          }

          if(self.globalUI.exerciseFinished) {
            self.globalUI.exerciseFinished = false;

            if(resp.skillMastery && resp.skillMastery.length) {
              self.props.setNewSkillMasteryEndGame(resp.skillMastery);
            }

            if(self.globalUI.deltaBadges && self.globalUI.deltaBadges.length) {
              self.props.setNewBadgesEndGame(self.globalUI.deltaBadges);
              self.globalUI.deltaBadges = [];
            } else {
              // sets flag to enable end game modal CTAs
              self.props.setNewBadgesEndGame('seen');
            }
          }

          if (data.onEndGameCallback && typeof data.onEndGameCallback === "function") {
            // data.onEndGameCallback();
          }

          if(!resp.status) {
            if(resp.data && resp.data.status===204) return;
            console.log('error',resp);
          }
        });

      }
    };
    window.globalui = this.globalUI;
  }


  clickStartGame() {
    if(this.state.lockPlayButton) return;
    if(!this.gameObj) return;
    let progress = player.getPlayerProgress(this.props.player.currentPlayerId);
    progress.then((resp)=>{
      let payload = {};
      payload[this.props.player.currentPlayerId] = {...resp};
      this.props.playerActions.setProgress(payload);
    });
    this.state.lockPlayButton = true;
    this.props.setTimeout(()=>{
      this.state.lockPlayButton = false;  // do not use setState
    }, 1000);
    this.audio.start.play();
    this.props.playerNavbarActions.setMenuActive(false);

    let url = URL.mapToObject();

    let gameId = null;
    if('internalName' in this.props.selectedGame){
      gameId = this.props.selectedGame.internalName;
      if(this.props.selectedGame.type === 'worksheet') {
        gameId = 'interactive-worksheet-'+gameId;
      } else if (this.props.selectedGame.type === 'worksheet-generator') {
        gameId = 'worksheet-generator-'+gameId;
      }
    }
    let assignmentId = null;
    // check and make sure that there is a gameid and check for assignment id
    if(url.assignment) assignmentId = url.assignment.id;
    let sessionId = null;
    // let assignmentId = null;

    this.props.setGame({
      game: this.props.selectedGame,
      data: this.props.selectedGameData
    });

    if(window.kidframe && window.kidframe.clickedPlay) {
      if (window.kidframe.clickedPlay()) {
        return;
      }
    }

    this.props.clickStartGame();
    this.props.fetchGameData();
    player.fetchExercise(gameId, sessionId, assignmentId);
  }


  finishExercise(data) {
    var self = this;
    var tracking_data = self.globalUI.current_exercise._tracking_data;
    var isTyping = !!this.props.currentGame.typing;
    var numStars = 0;
    var score = 0;

    if(this.props.detailPageOnboardingView){
      if ('singlePlayToken' in window.kidframe && window.kidframe.singlePlayToken) {
        // keep detail onboarding view mode enabled to prevent freeplay
      } else {
        this.props.useDetailPageOnboardingView(false);
      }
    }

    let exerciseSrc = this.globalUI.current_exercise;
    if ('stars' in exerciseSrc){
      numStars = this.globalUI.current_exercise.stars;
    } else {
      if (exerciseSrc.is_scored) {
        if (tracking_data.trackingInfo && (tracking_data.trackingInfo.numCorrect > 0 || tracking_data.trackingInfo.numIncorrect > 0)) {
          score = tracking_data.trackingInfo.numCorrect / (tracking_data.trackingInfo.numCorrect + tracking_data.trackingInfo.numIncorrect);
          if (score >= this.THREE_STAR_THRESHOLD) {
            numStars = 3;
          } else if (score >= this.TWO_STAR_THRESHOLD) {
            numStars = 2;
          } else {
            numStars = 1;
          }
        }
      } else {
        numStars = 1;
        score = 1;
      }
    }

    let goingTo = "";
    let nextUrl = null;
    let returnUrl = null;
    let nextExercise = null;
    let currentLesson = this.props.player.currentPlaylist;
    let nextLesson = null;
    let url = URL.mapToObject();

    let completedLesson = false;  // used for both lessons and assignments
    let completedGrade = false;
    if(this.props.player.currentPlaylist && this.props.player.currentPlaylist.exercises) {
      let i = 0;
      for (i = 0; i < this.props.player.currentPlaylist.exercises.length; i++) {
        if(this.props.player.currentPlaylist.exercises[i].internalName === this.props.currentGame.internalName){
          if(i<this.props.player.currentPlaylist.exercises.length-1){
            let gameUrl = this.props.player.currentPlaylist.exercises[i+1].internalName;
            if(url.lesson) {
              nextUrl = location.search + '#' + url.subject + ',' + url.grade + ',' + url.lesson;
              goingTo = "next exercise, same lesson";
            } else if(url.assignment) {
              nextUrl = location.search + '#assignment-' + url.assignment.id;
              goingTo = "next exercise, same assignment";
            }
            nextExercise = this.props.player.currentPlaylist.exercises[i+1];
          } else {
            completedLesson = true;
          }
          break;
        }
      }
    }
    if(completedLesson) {
      if (url.lesson) {
        // regular lesson sequences:
        let subject = url.subject;
        let grade = this.props.player.gradesSelected[subject];
        if(subject==='typing'){
          grade = {internalName: "typing"};
        }
        let playerId = this.props.player.currentPlayerId;
        let currentPlayerProgress = this.props.player.progress[playerId];
        let playerSequence = currentPlayerProgress.playerSequence[subject];

        for (var c = 0; c < playerSequence.courses.length; c++) {
          let course = playerSequence.courses[c];
          if (course.internalName === grade.internalName) {
            // we found our course
            for (var l = 0; l < course.lessons.length; l++) {
              let lesson = course.lessons[l];
              if (lesson.internalName === url.lesson) {
                if (l < course.lessons.length - 1) {
                  nextLesson = course.lessons[l + 1];
                  nextExercise = nextLesson.exercises[0];
                  nextUrl = location.search + '#' + url.subject + ',' + url.grade + ',' + nextLesson;
                  goingTo = "next lesson";
                } else {
                  completedGrade = true;
                  goingTo = "end of grade";
                }
              }
            }
            break;
          }
        }
      } else {
        // assignments:
        goingTo = "assignments";
        returnUrl = location.search + '#assignments';
        nextUrl = null;
        let currentAssignmentId = this.props.player.currentPlaylist.id;
        let playerId = this.props.player.currentPlayerId;
        let assignments = this.props.player.progress[playerId].assignments;
        for (var a = 0; a < assignments.length; a++){
          let assignment = assignments[a];
          if(assignment.id === currentAssignmentId) continue;
          if(assignment.progress && assignment.progress.completion && assignment.progress.completion==1) continue;
          nextExercise = assignment.items[0];
          nextUrl = location.search + '#assignment-'+assignment.id;
          goingTo = "next assignment";
        }
      }
    }

    if(url.challenge){
      goingTo = "next challenge exercise";

      // update the challenge with progress:
      let challenges = (this.props.player.challenges && this.props.player.challenges[this.props.player.currentPlayerId]) ? this.props.player.challenges[this.props.player.currentPlayerId] : null;
      let challengeId = this.props.player.currentChallengeId;
      let challenge = (challenges && challenges[challengeId]) ? challenges[challengeId] : null;
      let position = (this.props.player.currentPlayerId in this.props.player.challengePositions && this.props.player.challengePositions[this.props.player.currentPlayerId][challengeId]) >= 0 ? this.props.player.challengePositions[this.props.player.currentPlayerId][challengeId] : null;
      let exercise = (challenge && challenge.exercises) ? challenge.exercises[position] : null;
      exercise = {
        ...exercise,
        is_scored: exerciseSrc.is_scored,
        pointsPossible: (exerciseSrc.is_scored ? 3 : 1),
        progress: {
          earned: numStars,
          possible: (exerciseSrc.is_scored ? 3 : 1)
        }
      };
      challenge.exercises[position] = exercise;
      this.props.playerActions.updateChallenge({
        playerId: this.props.player.currentPlayerId,
        challengeId,
        challenge
      });
    }

    this.props.modalActions.showEndGameModal({
      tracking_data: tracking_data,
      isScored: exerciseSrc.is_scored,
      isTyping: isTyping,
      numStars: numStars,
      exercise: exerciseSrc,
      nextExercise: nextExercise,
      currentLesson: currentLesson,
      nextLesson: nextLesson,
      completedLesson: completedLesson,
      completedGrade: completedGrade,
      nextUrl: nextUrl,
      returnUrl: returnUrl,
      goingTo: goingTo,
      deltaPoints: this.globalUI.deltaPoints,
      deltaBadges: this.globalUI.deltaBadges
    });


    // transform the data to match the event model:
    var postData = {'value': tracking_data};
    if(data && data.payload) {
      if(data.payload.score) {
        postData.score = data.payload.score;
      }
      if(data.payload.otherData) {
        postData.otherData = data.payload.otherData;
      }
    }
    postData.type = 'end'; // <- this must match the string in Event.model.php
    postData.pointsEarned = numStars;

    this.props.playerActions.updateExerciseProgress({
      playerId: this.props.player.currentPlayerId,
      sequenceType: url.lesson ? 'lesson' : 'assignment',
      assignmentId: url.assignment ? url.assignment.id : null,
      subject: url.subject ? url.subject : null,
      grade: url.grade ? url.grade : null,
      lesson: url.lesson ? url.lesson : null,
      exercise: this.props.currentGame.internalName,
      progress: {
        earned: url.assignment? numStars/3 : numStars,
        score: score
      },
      deltaPoints: this.globalUI.deltaPoints,
      deltaBadges: this.globalUI.deltaBadges
    });

    this.globalUI.exerciseFinished = true;

    self.globalUI.current_exercise.trigger('log', postData);
    Tracking.track('Finished Exercise', {internalName: this.props.currentGame.internalName, score: score, earned: numStars});
  }

  drawGameFrame() {
    let url = URL.mapToObject();
    this.currentPlaylist = this.currentPlaylist ? this.currentPlaylist : this.props.player.currentPlaylist;
    if(!this.currentPlaylist && !url.singlePlay && !url.challenge){
      return null;
    }
    if(url.singlePlay && !this.props.player.singleExercise) {
      return null;
    }
    let lessonObj = this.currentPlaylist;

    let gameObj = this.gameObj;
    let img = "/assets/globalui/sequences/generic.jpg";
    let gameRef = this.props.selectedGame;
    if(this.props.gameLoadState){
      gameRef = this.props.currentGame;
    }

    if(url.singlePlay) {
      if (gameRef && gameRef.internalName) {
        gameObj = {
          name: (gameRef.name || null),
          mainImage: [(gameRef.mainImage || null)],
          thumbnail: gameRef.thumbnail || null
        };
        this.gameObj = gameObj;
      }

    } else if(url.challenge) {
      if(!gameRef || (gameRef && gameRef.type && gameRef.type==='hidden')){
        if(this.gameObj!==null) {
          this.gameObj = null;
          this.forceUpdate();
        }

      } else {
        if (gameRef && gameRef.internalName) {
          gameObj = {
            name: (gameRef.title || null),
            mainImage: [(gameRef.mainImage || null)],
            thumbnail: gameRef.thumbnail || null
          };
          this.gameObj = gameObj;
        }
      }

    } else {
      if (gameRef && gameRef.internalName && this.currentPlaylist && this.currentPlaylist.exercises) {
        for (var e = 0; e < this.currentPlaylist.exercises.length; e++) {
          let g = this.currentPlaylist.exercises[e];
          if (g.internalName === gameRef.internalName) {
            gameObj = g;
            this.gameObj = gameObj;
            break;
          }
        }
      }
    }
    if (gameObj && gameObj.mainImage && gameObj.mainImage.length) {
      img = (gameObj.mainImage[0]==='/'?'':'/') + gameObj.mainImage;
    }

    if(gameObj===null){
      img = null;
    }


    let startInfo = null;
    let startInfoArray = [];
    let loadingButton = null;
    let playButton = (<div className={`play_button ${this.props.gameLoadState}`} key="play_button" onClick={this.clickStartGame}><i className="play"/></div>);

    if( !this.props.gameLoadState || this.props.gameLoadState === 'set'){
      if(lessonObj && lessonObj.name){
        let url = URL.mapToObject();
        let lessonType = url.assignment ? 'assignment' : 'lesson';
        startInfoArray.push((<h1 key="lessonTitle" className="lessonTitle"><span className={lessonType}>{lessonType}</span> {lessonObj.name}</h1>));
      }
      if(gameObj && gameObj.name) {
        let type = 'game';
        if(gameObj.type==='skill-builders') {
          type = 'exercise';
        } else if(gameObj.type==='worksheet') {
          type = 'worksheet';
        } else if(gameObj.template==='video') {
          type = 'song';
        } else if(gameObj.template==='story' || gameObj.template==='bookbuilder') {
          type = 'story';
        }
        startInfoArray.push((<h1 key="gameTitle" className="gameTitle"><span className={type}>{type}</span> {gameObj.name}</h1>));
      }
    }

    if(
      this.props.gameLoadState==='willFetch' ||
      this.props.gameLoadState==='fetching' ||
      this.props.gameLoadState==='willLoadTemplate' ||
      this.props.gameLoadState==='playing-loadTemplate' ||
      this.props.gameLoadState==='restart'
    ){
      playButton = null;
      loadingButton = (
        <div className="loading_button">
          <div className="loadingDots">
            <div className="dot1"/><div className="dot2"/><div className="dot3"/>
          </div>
        </div>
      );
    }

    let iframe = null;
    let gameControls = (<Controls/>);
    let data = null;
    let src = null;

    if (
      this.props.gameLoadState === 'willLoadTemplate' ||
      this.props.gameLoadState === 'playing-loadTemplate' ||
      this.props.gameLoadState === 'playing' ||
      this.props.gameLoadState === 'restart'
    ) {
      playButton = null;
      if(this.props.gameLoadState!=='playing-loadTemplate') {
        loadingButton = null;
      }
      let controlsProps = {
        paused: this.props.paused,
        exercise: this.state.exercise,
        current_exercise: this.globalUI.current_exercise,
        pauseGame: this.props.pauseGame,
        resumeGame: this.props.resumeGame,
        hintState: this.state.hintState,
        suggestingHintState: this.state.suggestingHintState,
        setSuggestingHintState: this.setSuggestingHintState
      };
      gameControls = (<Controls {...controlsProps} />);
      data = this.props.currentGameData;
      src = data.type === 'skill-builders' ? '/games/learnosity-exercise/' : '/games/brainzy-exercise/';
      iframe = (<iframe id="gameWindow" src={src} allow="autoplay fullscreen" key="gameWindow"/>);
    }

    if(this.gameObj===null) {
      playButton = null;
    }

    let challenges = (this.props.player.challenges && this.props.player.challenges[this.props.player.currentPlayerId]) ? this.props.player.challenges[this.props.player.currentPlayerId] : null;
    let challengeId = this.props.player.currentChallengeId;
    let challenge = (challenges && challengeId in challenges) ? challenges[challengeId] : null;
    let challengePosition = (this.props.player.currentPlayerId in this.props.player.challengePositions && challengeId in this.props.player.challengePositions[this.props.player.currentPlayerId]) ? this.props.player.challengePositions[this.props.player.currentPlayerId][challengeId] : null;
    let challengeLength = (challenge && 'total' in challenge) ? challenge.total : null;

    if( !this.props.gameLoadState || this.props.gameLoadState === 'set') {
      if (challenges && challengePosition === 0) {
        let childName = this.props.player.players.noGroups.children[this.props.player.currentPlayerId].PlayerName;
        startInfoArray.push((
            <h1 key="challengeIntro" className="challengeIntro">{`This challenge is made for ${childName}.
            Start with the first game. We’ll pick the next games as you go, to help sharpen your skills.`}</h1>));
      }
    }

    if(startInfoArray.length){
        startInfo = (
            <div key="startInfo" className="startInfo">
                {startInfoArray}
            </div>
        );
    }

    return (
      <div>
        <div className="gameBlur" style={{
          backgroundImage: 'url('+prefixCDN(img)+')',
          backgroundSize: 'cover',
          backgroundPosition: '50% 50%'
        }}/>
        {(url.challenge && gameObj===null) ? (
          (challengePosition && challengePosition >= challengeLength) ? (
            <div className="gameFrame complete" key="gameFrame">
              <h2>
                <span>Challenge Complete!</span>
              </h2>
              <div className="flag"/>
            </div>
          ) : (
            <div className="gameFrame pending" key="gameFrame">
              <h2>
                <span>Loading next game</span>
                <div className="loadingDots">
                  <div className="dot1"/><div className="dot2"/><div className="dot3"/>
                </div>
              </h2>
            </div>
          )
        ) : (
          <div className="gameFrame" key="gameFrame" style={{
            backgroundImage: 'url('+prefixCDN(img)+')',
            backgroundSize: 'cover',
            backgroundPosition: '50% 50%'
          }}>
            <div className="static"/>
            {iframe}
          </div>
        ) }
        {startInfo}
        <CSSTransitionGroup transitionName="gameControls" component="div" transitionEnterTimeout={0} transitionLeaveTimeout={500}>
          {loadingButton}
          {playButton}
        </CSSTransitionGroup>
        {gameControls}
      </div>
    );

  }


  render() {
    let props = {
      game: this.props,
      players: this.props.player.players,
      setCurrentPlayer: this.props.playerActions.setCurrentPlayer,
      addPlayer: this.props.playerActions.addPlayer,
      setGrade: this.props.playerActions.setGrade,
      loadingChildStarted: this.props.loadingActions.loadingChildStarted,
      loadingChildFinished: this.props.loadingActions.loadingChildFinished,
    };

    let giftProps = null;

    if (this.props.player.players.noGroups !== undefined) {
      giftProps = {
        currentPlayer: this.props.player.players.noGroups.children[this.props.player.currentPlayerId],
        gift: this.props.player.gift,
        giftLoaded: this.props.player.giftLoaded,
        modalActions: this.props.modalActions
      };
    }


    let gift = giftProps !== null && this.props.player.giftLoaded && this.props.player.gift && (this.props.gameLoadState === null || this.props.gameLoadState === 'set') ? <Gift {...giftProps} /> : null;

    let selectPlayer = !this.props.playedFirstGame && this.props.detailPageOnboardingView? (<SelectPlayer key="selectPlayers" {...props} />) : null;
    return (
      <Fragment>
        {gift}
        <section className={`game-container ${this.props.gameLoadState ? this.props.gameLoadState : 'noGame'} ${this.props.paused ? 'paused' : ''} ${this.props.detailPageOnboardingView ? 'detailPageOnboardingView' : ''} ${this.props.user.embedMode}`}>
          {this.drawGameFrame()}
        </section>
        {selectPlayer}
      </Fragment>
    );
  }

  componentDidMount(){
    this.props.loadingActions.loadingFinished();

  }

  componentDidUpdate() {
    var self = this;

    if (this.props.autostart) {
      this.clickStartGame();
      this.props.autostartGame(false);
    }

    if (this.props.gameLoadState === 'restart') {
      let data = {...this.props.currentGameData};
      let game = {...this.props.currentGame};
      this.generateGlobalUI();
      this.props.setGame({
        game: game
      });
      this.clickStartGame();
    }

    if (this.props.gameLoadState === 'willLoadTemplate') {
      if (!this.props.paywallHit) {

        let data = this.props.currentGameData;
        let iframe = document.querySelector("#gameWindow");
        iframe.contentWindow.exercise = iframe.contentWindow.exercise || [];

        if (data.type === 'skill-builders') {
          if ("currentGame" in this.props) {
            iframe.contentWindow.exercise.push({
              parentui: self.globalUI,
              childid: self.props.player.currentPlayerId,
              playId: data.playId,      // todo: get this from somewhere
              // sessionId: data.sessionId,  // todo: needed??
              internalName: this.props.currentGame.internalName,    // todo: no idea where this comes from
              data: data,
              callback: () => {
                self.globalUI.current_exercise.addEvent('finish', self.finishExercise);
                // this is super hacky but it removes the end screen from learnosity
                self.globalUI.current_exercise.displayFinishScreen = function () {
                };
              }
            });
          }
          self.globalUI.enableRepeatQuestion();

        } else {
          iframe.contentWindow.exercise.push({    // "push" is a function in brainzy-exercise.php that starts the game. It is NOT an array proto method.
            globalui: self.globalUI,
            content: data.content,
            options: data.options,
            template: data.template,
            skills: data.skills,
            callback: () => {
              self.globalUI.current_exercise.addEvent('finish', self.finishExercise);
            }
          });
        }

        this.props.clearInterval(this.focusInterval);
        this.focusInterval = this.props.setInterval(() => {
          if (iframe && iframe.contentWindow && iframe.contentWindow.focus && !this.props.paused) {
            iframe.contentWindow.focus();
            // this.props.clearInterval(this.focusInterval);
          }
        }, 100);

        this.props.startGame();
        this.setState({exercise: iframe.contentWindow});
        Tracking.track('Started Exercise', {internalName: data.internalName});
      } else {
        // hit paywall

      }
    }
  }

  componentWillUnmount(){
    if(this.props.detailPageOnboardingView){
      this.props.useDetailPageOnboardingView(false);
    }

    document.removeEventListener('clickPlay', this.clickPlayListener);
  }
}

export default ReactTimeout(Game);
