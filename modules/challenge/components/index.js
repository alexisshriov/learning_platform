import React, { Fragment } from 'react';
import ReactTimeout from "react-timeout";
import { CSSTransitionGroup } from 'react-transition-group';

import LoadingTreadmill from '../../../widgets/loadingTreadmill';
import player from '../../../services/player';
import * as URL from '../../../helpers/url';

import { Howl, Howler } from 'howler';

class Challenge extends React.Component {
  constructor(props) {
    super(props);

    this.audio = {};
    // this.audio.click = new Howl({src: [prefixCDN('/assets/kidframe/audio/select_general.ogg'), prefixCDN('/assets/kidframe/audio/select_general.mp3')]});
    // this.audio.pop = new Howl({src: [prefixCDN('/assets/kidframe/audio/pop.ogg'), prefixCDN('/assets/kidframe/audio/pop.mp3')]});
    this.audio.popin = new Howl({src: [prefixCDN('/assets/kidframe/audio/popin.ogg'), prefixCDN('/assets/kidframe/audio/popin.mp3')]});

    this.ICON_WIDTH = 170;

    this.fetchingNext = false;

    this.props.gameActions.selectGame({});
    this.props.gameActions.unsetGame();
  }

  render() {
    let exercises = null;
    let total = null;
    if(this.props.player.challenges && this.props.player.challenges[this.props.player.currentPlayerId] && this.props.player.currentChallengeId && this.props.player.challenges[this.props.player.currentPlayerId][this.props.player.currentChallengeId]){
      let challenge = (this.props.player.currentPlayerId in this.props.player.challenges) ? this.props.player.challenges[this.props.player.currentPlayerId][this.props.player.currentChallengeId] : null;
      if(challenge) {
        exercises = challenge['exercises'];
        total = challenge['total'];
      }
    }

    if(exercises && exercises.length < total){
      for(let i=exercises.length; i<total; i++){
        exercises.push({
          type: 'hidden'
        });
      }
    }

    return (
      <section className="challenge-container">
        <div className={`playlist-container ${
          ((this.props.game.gameLoadState==='playing-loadTemplate' || this.props.game.gameLoadState==='playing') && !this.props.game.paused) ||
          this.props.game.gameLoadState==='restart' ||
          this.props.game.gameLoadState==='fetching' ||
          this.props.game.gameLoadState==='willLoadTemplate'
            ? 'minimized' : ''}`}>
          <div className="playlist-page-container">
            <div className="playlist-page" style={{ marginLeft: 0 }}>
              {exercises && exercises.map((o, i)=>{
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
                } else if(o.type==='hidden') {
                  type = 'hidden';
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
                let position = (this.props.player.currentPlayerId in this.props.player.challengePositions) ? this.props.player.challengePositions[this.props.player.currentPlayerId][this.props.player.currentChallengeId] : 0;

                return (
                  <Fragment key={"challenge-exercise-fragment-"+i}>
                    <div className={`exercise-icon
                      ${ i===position ? 'current' : '' }
                      ${ progress && (progress.earned || progress.completion) ? 'complete' : '' }
                    `} style={{left: i*(this.ICON_WIDTH+40) + 50}} key={"challenge-exercise-"+i}>
                      <CSSTransitionGroup transitionName="challenge_icon" component="div" transitionEnterTimeout={0} transitionLeaveTimeout={500}>
                        {o.type!=='hidden' && (
                        <div className="exercise-inner" key={`inner_`+i}>
                          <div className="background" style={{backgroundImage: 'url('+prefixCDN(img)+')', backgroundSize: '100% 100%'}} />
                          <div className="label">{o.title}</div>
                          <div className={`bottom-banner ${type}`}>
                            {progressEls}
                          </div>
                        </div>
                        )}
                        {o.type==='hidden' && (
                          <div className="exercise-inner hidden" key={`inner_hidden_`+i}>
                            <div className="label">?</div>
                          </div>
                        )}
                      </CSSTransitionGroup>
                    </div>

                    {/*<div className={`map-arrow ${position>i?'finished':''}`} style={{left: (i+1)*(this.ICON_WIDTH+40)+10}} key={"challenge-exercise-arrow-"+i} />*/}
                  </Fragment>
                );
              })}

              { total>0 && (
                <div className="flag" key="challenge-end-flag" style={{
                  left: total*(this.ICON_WIDTH+40) + 50,
                  backgroundImage: 'url('+prefixCDN('/assets/kidframe/ui/checkered_flag.png')+')',
                  backgroundSize: 'cover'
                }}/>
              )}
            </div>
          </div>

        </div>
      </section>
    );
  }

  componentDidMount() {
    if(!this.props.player.currentChallengeId){
      this.props.playerActions.setCurrentChallengeId('daily');
    }
    if(!this.props.player.challenges[this.props.player.currentPlayerId] || !this.props.player.challenges[this.props.player.currentPlayerId][this.props.player.currentChallengeId]){
      this.props.playerActions.fetchChallenges();
      player.getChallenges(this.props.player.currentPlayerId).then(resp=>{
        if(resp.challenges) {
          resp.playerId = this.props.player.currentPlayerId;
          this.props.playerActions.setChallenges(resp);
        }
      });
    }
  }

  componentDidUpdate() {
    if(this.props.player.challenges[this.props.player.currentPlayerId] && this.props.player.challenges[this.props.player.currentPlayerId][this.props.player.currentChallengeId]){
      let challenge = this.props.player.challenges[this.props.player.currentPlayerId][this.props.player.currentChallengeId];
      let exercises = challenge['exercises'];
      if(exercises && !this.props.game.selectedGame){
        if(this.props.player.currentPlayerId in this.props.player.challengePositions && this.props.player.currentChallengeId in this.props.player.challengePositions[this.props.player.currentPlayerId]) {
          let position = this.props.player.challengePositions[this.props.player.currentPlayerId][this.props.player.currentChallengeId];
          let game = exercises[position];
          if(game) {
            if(game.type!=='hidden') {
              this.props.gameActions.selectGame({game});
              this.props.gameActions.setGame({game});
            } else {
              // time to fetch the next one...
              if(this.fetchingNext){
                return;
              }
              this.fetchingNext = true;
              let minDelay = new Promise((resolve, reject)=>{
                this.props.setTimeout(()=>{
                  resolve();
                }, 1000);
              });
              let previousExercise = position>0 ? exercises[position-1] : null;
              let data = {
                childId: this.props.player.currentPlayerId,
                challengeId: this.props.player.currentChallengeId,
                position: position
              };
              if(previousExercise && previousExercise.internalName) {
                data.previousExercise = previousExercise.internalName;
              }
              let itemFetch = player.getNextChallengeItem(data);
              Promise.all([itemFetch, minDelay]).then(resps=>{
                this.fetchingNext = false;
                let resp = resps[0];
                if(resp.exercise) {
                  this.audio.popin.play();
                  exercises[position] = resp.exercise;
                  this.props.playerActions.updateChallenge({
                    playerId: this.props.player.currentPlayerId,
                    challengeId: this.props.player.currentChallengeId,
                    challenge: {
                      ...challenge,
                      exercises
                    }
                  });
                }
              });
            }
          }
        }
      }
    }
  }
}

export default ReactTimeout(Challenge);
