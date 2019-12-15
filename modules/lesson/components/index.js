import React from 'react';
import ReactTimeout from "react-timeout";

import LoadingTreadmill from '../../../widgets/loadingTreadmill';
import player from '../../../services/player';
import * as URL from '../../../helpers/url';

import { Howl, Howler } from 'howler';

class Lesson extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentExercise: 0,
      nextExercise: 0,
      scrollPosition: 0,
      sequenceLoaded: false,
      navClass: '',
      nextButton: {
        disabled: false,
        state: 'ready'
      },
      previousButton: {
        disabled: false,
        state: 'ready'
      }
    };

    this.audio = {};
    this.audio.click = new Howl({src: [prefixCDN('/assets/kidframe/audio/select_general.ogg'), prefixCDN('/assets/kidframe/audio/select_general.mp3')]});
    this.audio.pop = new Howl({src: [prefixCDN('/assets/kidframe/audio/pop.ogg'), prefixCDN('/assets/kidframe/audio/pop.mp3')]});

    this.sequence = null;
    this.path = null;

    this.ICON_WIDTH = 170;
    this.ICONS_PER_PAGE = 6;

    this.getCurrentExercise = this.getCurrentExercise.bind(this);
    this.clickExercise = this.clickExercise.bind(this);
    this.getPageScrollPosition = this.getPageScrollPosition.bind(this);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.clickTryGL = this.clickTryGL.bind(this);
  }

  clickExercise(i, exerciseObj){
    this.state.currentExercise = i;
    this.state.scrollPosition = i;

    if (this.props.game.paused) {
      this.props.modalActions.showExitGameModal({
        game: exerciseObj
      });
    } else {
      this.audio.click.play();
      this.props.gameActions.selectGame({game: exerciseObj});
      this.forceUpdate();
    }
  }

  next(max) {
    if(!this.state.nextButton.disabled) {
      this.audio.pop.play();
      this.state.nextButton.state = 'clicked';
      this.props.setTimeout(()=>{
        this.state.nextButton.state = 'ready';
        this.forceUpdate();
      }, 200);
      this.state.scrollPosition = Math.min(max, this.state.scrollPosition+6);
      this.forceUpdate();
    }
  }

  previous() {
    if(!this.state.previousButton.disabled) {
      this.audio.pop.play();
      this.state.previousButton.state = 'clicked';
      this.props.setTimeout(() => {
        this.state.previousButton.state = 'ready';
        this.forceUpdate();
      }, 200);
      this.state.scrollPosition = Math.max(0, this.state.scrollPosition-6);
      this.forceUpdate();
    }
  }

  getCurrentExercise(lessonSequence){
    if(!lessonSequence) return null;

    // let path = this.props.player.path;
    let url = URL.mapToObject();
    if(url.game !== this.path.game){
      this.path.game = url.game;
      this.state.sequenceLoaded = false;
    }
    if(!this.path.singlePlay && ( !url.subject && !url.grade && !(url.lesson || url.assignment) )){
      return null;
    }

    if(!this.path.singlePlay && this.state.sequenceLoaded){
      return null;
    }

    let playerId = this.props.player.currentPlayerId;
    let currentPlayerProgress = null;
    if(playerId && this.props.player.progress[playerId]){
      currentPlayerProgress = this.props.player.progress[playerId];
    }
    // this.state.sequenceLoaded = true;
    let currentExercise = this.state.currentExercise;

    let exerciseObj = {};

    if(!this.path.singlePlay) {
      // get currentExercise from url's exercise if set:
      if (this.path.game) {
        for (var i = 0; i < lessonSequence.exercises.length; i++) {
          let e = lessonSequence.exercises[i];
          if (e.internalName === this.path.game) {
            currentExercise = i;
            exerciseObj = e;

            this.state.currentExercise = currentExercise;
            this.state.nextExercise = currentExercise;
            this.state.scrollPosition = currentExercise;
            return exerciseObj;
          }
        }
      } else {
        exerciseObj = lessonSequence.exercises[0];
      }

      // get position from pre-selected game, if any
      if (this.props.game.selectedGame && this.props.game.selectedGame.internalName) {
        // get currentExercise
        for (var i = 0; i < lessonSequence.exercises.length; i++) {
          let e = lessonSequence.exercises[i];
          if (e.internalName === this.props.game.selectedGame.internalName) {
            currentExercise = i;
            exerciseObj = e;
            this.state.currentExercise = currentExercise;
            this.state.nextExercise = currentExercise;
            this.state.scrollPosition = currentExercise;
            return exerciseObj;
          }
        }
      }

      // otherwise, get position from player progress
      let tempPath = this.path;
      if ('lastPlayed' in currentPlayerProgress) {
        // get currentExercise from player progress last played, if set:
        // TODO: need to make this work with assignments
        let progress = currentPlayerProgress.lastPlayed;
        if (this.path.assignment) {
          tempPath = {
            subject: progress.path[0] || null,
            grade: progress.path[1] || null,
            lesson: progress.path[2] || null,
            game: progress.path[3] || null
          };
        }
        if (tempPath.subject in progress) {
          let subject = progress[tempPath.subject];
          if (tempPath.grade in subject) {
            let grade = subject[tempPath.grade];
            if (tempPath.lesson in grade) {
              let lesson = grade[tempPath.lesson];
              if ('path' in lesson && lesson.path.length >= 4) {
                let exercise = lesson.path[3];

                for (var i = 0; i < lessonSequence.exercises.length; i++) {
                  let e = lessonSequence.exercises[i];
                  if (e.internalName === exercise) {
                    currentExercise = i;
                    exerciseObj = e;
                    if (lessonSequence.exercises[i + 1]) {
                      e = lessonSequence.exercises[i + 1];
                      currentExercise++;
                      exerciseObj = e;
                    }
                    this.state.currentExercise = currentExercise;
                    this.state.nextExercise = currentExercise;
                    this.state.scrollPosition = currentExercise;

                    return exerciseObj;
                  }
                }

              }
            }
          }
        }
      }

    } else {
      // single play:
      exerciseObj = this.props.player.singleExercise;
    }

    return exerciseObj;
  }

  getPageScrollPosition(min, max){
    let x = (this.state.scrollPosition - 2);
    if(max===0 || this.sequence.exercises.length <= this.ICONS_PER_PAGE){
      this.state.nextButton.state = 'hidden';
      this.state.previousButton.state = 'hidden';
    } else if(x<=0){
      this.state.previousButton.disabled = true;
    } else {
      this.state.previousButton.disabled = false;
    }
    if(x >= max - this.ICONS_PER_PAGE){
      this.state.nextButton.disabled = true;
    } else {
      this.state.nextButton.disabled = false;
    }
    x = Math.min(x, max-this.ICONS_PER_PAGE);
    x = Math.max(min, x);
    x *= this.ICON_WIDTH;
    return -x + 30;
  }

  clickTryGL() {
    let url = URL.mapToObject();
    let buttonURL = "#chooseQuest";

    let grade = url.grade || "";
    grade = grade.replace('math-','').replace('ela-','');
    if(['math', 'ela'].includes(url.subject) && ['preschool', 'kindergarten', 'first', 'second', 'third', 'fourth', 'fifth'].includes(grade)) {
      buttonURL = '#' + url.subject + ',' + url.grade;
    } else if(url.subject==='typing') {
      buttonURL = '#typing,typing';
    }

    this.audio.click.play();
    this.props.router.push(location.search + buttonURL);
  }

  renderLoading() {
    let type = "Lesson";
    let url = URL.mapToObject();
    if(url.assignment){
      type = "Assignment";
    }

    return (
      <section className="lesson-container">
        <div style={{position:'absolute', top: '300px', left: '0', width:'100%', textAlign: 'center'}}>
          <LoadingTreadmill />
          <div style={{clear: 'both'}}/>
          <h1 style={{color: '#1e8474'}}>Loading {type}
            <div className="loadingDots">
              <div className="dot1"/><div className="dot2"/><div className="dot3"/>
            </div>
          </h1>
        </div>
      </section>
    );
  }

  render() {
    let url = URL.mapToObject();
    this.sequence = this.sequence ? this.sequence : this.props.player.currentPlaylist;
    this.path = (this.path && (this.path.lesson || this.path.assignment || this.path.singleExercise)) ? this.path : url;
    if(!this.sequence && !url.singlePlay){
      return this.renderLoading();
    }
    let exercisesList =  (this.sequence && this.sequence.exercises) ? this.sequence.exercises : [];
    if(!exercisesList){
      return this.renderLoading();
    }

    if(url.singlePlay) {
      return (
        <section className="lesson-container">
          <div className={`playlist-container ${
            ((this.props.game.gameLoadState==='playing-loadTemplate' || this.props.game.gameLoadState==='playing') && !this.props.game.paused) ||
            this.props.game.gameLoadState==='restart' ||
            this.props.game.gameLoadState==='fetching' ||
            this.props.game.gameLoadState==='willLoadTemplate' ||
            this.props.game.detailPageOnboardingView===true
              ? 'minimized' : ''}`}>
            <div className="try-guided-lessons" onClick={this.clickTryGL}>
              <div className="choose-quest-button-pill">
                <h2>Let's try a Guided Lesson!</h2>
                <div className="subtext">Each lesson is a set of games that focuses on a skill.</div>
              </div>
              <div className="choose-quest-button">
                <div className="icon"/>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="lesson-container">
        <div className={`playlist-container ${
          ((this.props.game.gameLoadState==='playing-loadTemplate' || this.props.game.gameLoadState==='playing') && !this.props.game.paused) ||
          this.props.game.gameLoadState==='restart' ||
          this.props.game.gameLoadState==='fetching' ||
          this.props.game.gameLoadState==='willLoadTemplate' ||
          this.props.game.detailPageOnboardingView===true
            ? 'minimized' : ''}`}>
          <div className="playlist-page-container">
            <div className="playlist-page" style={{ marginLeft: this.getPageScrollPosition(0, exercisesList.length || 0) }}>
              {exercisesList.map((o, i)=>{
                let type = 'game';
                let img = '/assets/globalui/sequences/generic.jpg';
                if(o.thumbnail){
                  img = o.thumbnail;
                }
                if(o.type==='skill-builders') {
                  type = 'exercise';
                } else if(o.type==='worksheet') {
                  type = 'worksheet';
                } else if(o.template==='video') {
                  type = 'song';
                } else if(o.template==='story' || o.template==='bookbuilder') {
                  type = 'story';
                }
                let progress = o.progress ? o.progress : null;
                let progressEls = [];
                if(!o.is_scored){
                  progressEls.push(<span key={o.internalName+"_type"}>{type}</span>);
                }
                if(progress){
                  if(Number(o.pointsPossible)===1){
                    if(Number(progress.earned) || progress.completion){
                      progressEls.push(<div className="check" key={o.internalName+"_check"}/>);
                    } else {
                      progressEls.push(<div className="check empty" key={o.internalName+"_check"}/>);
                    }
                  } else {
                    let stars = 0;
                    if (Number(progress.possible) === Number(o.pointsPossible)) {
                      stars = progress.earned;
                    } else {
                      stars = Math.round(Number(o.pointsPossible) * (Number(progress.earned) / Number(progress.possible)));
                    }
                    let s=1;
                    for(let i=1; i<=stars; i++){
                      progressEls.push(<div className="star" key={o.internalName+"_star_"+s}/>);
                      s++;
                    }
                    for(let i=1; i<=(o.pointsPossible-stars); i++){
                      progressEls.push(<div className="star empty" key={o.internalName+"_star_"+s}/>);
                      s++;
                    }
                  }
                }
                return (
                  <div className={`exercise-icon
                    ${ i===this.state.currentExercise ? 'current' : '' }
                    ${ i===this.state.nextExercise ? 'next' : '' }
                    ${ progress && (progress.earned || progress.completion) ? 'complete' : '' }
                  `} style={{left: i*this.ICON_WIDTH}} key={o.internalName}>
                    <div className="exercise-inner" onClick={this.clickExercise.bind(this, i, o)}>
                      <div className="background" style={{backgroundImage: 'url('+prefixCDN(img)+')', backgroundSize: '100% 100%'}} />
                      <div className="label">{o.name}</div>
                      <div className={`bottom-banner ${type}`}>
                        {progressEls}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={`
            next_button
            ${this.state.navClass}
            ${this.state.nextButton.state}
            ${this.state.nextButton.disabled ? 'disabled' : ''}
          `} onClick={this.next.bind(this, exercisesList.length)}>
            <div className="inner_button">
              <i />
            </div>
          </div>
          <div className={`
            previous_button
            ${this.state.navClass}
            ${this.state.previousButton.state}
            ${this.state.previousButton.disabled ? 'disabled' : ''}
          `} onClick={this.previous}>
            <div className="inner_button">
              <i />
            </div>
          </div>
        </div>
      </section>
    );
  }

  componentDidMount(){
    this.props.loadingActions.loadingFinished();
  }

  componentWillUpdate(nextProps) {
    // typically only happens when we force another sequence to replace the current sequence without destroying the Lesson component. (ex: auto-advancing assignment)
    if(nextProps.player.refreshCurrentPlaylistView){
      // force refresh the view
      this.sequence = null;
      this.state.sequenceLoaded = false;
      this.props.playerActions.refreshedCurrentPlaylistView();
    }

  }

  componentDidUpdate(){
    let url = URL.mapToObject();
    let exerciseObj = null;

    if(!url.singlePlay) {
      exerciseObj = this.getCurrentExercise(this.sequence);

    } else {
      this.singleExercise = true;
      exerciseObj = this.getCurrentExercise(this.singleExercise);
    }

    if(exerciseObj) {
      if(!this.state.sequenceLoaded || (url.singlePlay && this.props.game.selectedGame===null && !this.props.game.gameLoadState)) {
        this.setState({sequenceLoaded: true});
        this.props.gameActions.selectGame({game: exerciseObj});
        // this.props.gameActions.setGame({game: exerciseObj});
      }
    }
  }
};

export default ReactTimeout(Lesson);
