import React, { Fragment } from 'react';
import ReactTimeout from "react-timeout";
import PopBadges from '../../../widgets/popBadges';
import * as URL from '../../../helpers/url';

import { Howl, Howler } from 'howler';
import {getAssignmentId} from "../../../helpers/url";


class EndGameModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newBadges: 'pending',

      showMasteryBar: false,
      // Mastery bar needs to wait for prior animations and api response to finish
      starAnimation: 'wait',
      newMasteryScoreAPIResponse: 'wait'
    };

    this.numStars = null;
    this.oldStars = null;
    this.currentStar = 0;
    this.stars = [];
    this.check = null;

    this.skills = [];
    this.oldMastery = null;
    this.newMastery = null;
    this.subject = null;

    this.deltaPoints = 0;
    this.deltaBadges = [];

    this.reactionText = null;

    this.SCORE_METRIC_CORRECT = 'correct';
    this.SCORE_METRIC_ACCURACY = 'accuracy';
    this.SCORE_METRIC_RAW_ACCURACY = 'rawAccuracy';
    this.SCORE_METRIC_WPM = 'WPM';
    this.SCORE_METRIC_GROSS_WPM = 'grossWPM';

    this.audio = {};

    this.audio.star_1 = new Howl({src: [prefixCDN('/assets/kidframe/audio/star_1.ogg'), prefixCDN('/assets/kidframe/audio/star_1.mp3')]});
    this.audio.star_2 = new Howl({src: [prefixCDN('/assets/kidframe/audio/star_2.ogg'), prefixCDN('/assets/kidframe/audio/star_2.mp3')]});
    this.audio.star_3 = new Howl({src: [prefixCDN('/assets/kidframe/audio/star_3.ogg'), prefixCDN('/assets/kidframe/audio/star_3.mp3')]});
    this.audio.click = new Howl({src: [prefixCDN('/assets/kidframe/audio/select_general.ogg'), prefixCDN('/assets/kidframe/audio/select_general.mp3')]});

    this.audio.reaction = null;

    this.reactionAudioPaths = {
      one2one: [
        "youre_on_your_way"
      ],
      two2one: [
        "flex_your_noodle_try_again",
        "not_as_good_as_last_time_keep"
      ],
      three2one: [
        "flex_your_noodle_try_again",
        "not_as_good_as_last_time_keep"
      ],
      zero: [
        "your_brain_is_just_warming_up"
      ],
      one: [
        "your_brain_is_just_warming_up"
      ],
      two: [
        "youre_getting_there_learn_on",
        "keep_practicing_you_almost"
      ],
      three2two: [
        "last_time_was_a_little_better"
      ],
      one2two: [
        "good_work_brainbuilder",
        "your_brain_is_getting_stronger",
        "you_didnt_know_that_before",
        "i_like_how_you_keep_trying",
        "good_work_you_beat_your_last_try"
      ],
      three: [
        "you_are_a_master"
      ],
      checkmark: [
        "/assets/content/audio/male1/words/nice",
        "/assets/content/audio/male1/words/cool",
      ]
    };

    this.scoreFeedback = {
      noscore: [
        (<Fragment>You finished!<br />Keep going.</Fragment>)
      ],
      one2one: [
        "You're on your way!"
      ],
      two2one: [
        "Not as good as last time. Keep trying."
      ],
      three2one: [
        "Not as good as last time. Keep trying."
      ],
      zero: [
        "Your brain is just warming up."
      ],
      one: [
        "Your brain is just warming up."
      ],
      two: [
        "You're getting there. Learn on!",
        "Keep practicing. You almost have it!"
      ],
      three2two: [
        "Last time was a little better."
      ],
      one2two: [
        "Good work, brain builder!",
        "Your brain is getting stronger!",
        "You've almost mastered this skill!",
        "Good work! You beat your last score."
      ],
      three: [
        "You are a master!"
      ]
    };

    this.goToPage = this.goToPage.bind(this);
    this.retryGame = this.retryGame.bind(this);
    this.renderStar = this.renderStar.bind(this);
    this.renderCheck = this.renderCheck.bind(this);
    this.getReactionText = this.getReactionText.bind(this);
  }

  goToPage() {
    if(this.props.data.goingTo !== 'next challenge exercise') {
      this.audio.click.play();
      if (this.props.data.nextUrl) {
        if (this.props.data.nextExercise) {
          this.props.gameActions.selectGame({
            game: this.props.data.nextExercise
          });
        }

        if (this.props.data.goingTo === "next lesson") {
          this.props.mapActions.jumpToLesson({
            from: this.props.data.currentLesson,
            to: this.props.data.nextLesson
          });
        }
        this.props.router.push(this.props.data.nextUrl);

      } else if (this.props.data.goingTo === "assignments") {
        this.props.router.push(this.props.data.returnUrl);
      }

    } else {
      // next challenge item
      let challengeId = this.props.player.currentChallengeId;
      let positions = (this.props.player.currentPlayerId in this.props.player.challengePositions) ? this.props.player.challengePositions[this.props.player.currentPlayerId] : null;
      let position = positions ? positions[challengeId] : 0;
      this.props.playerActions.setChallengePosition({
        playerId: this.props.player.currentPlayerId,
        challengeId,
        position: position+1
      });
      this.props.gameActions.unsetGame();
      this.props.gameActions.selectGame({});
      this.audio.click.play();
    }

    this.props.gameActions.unsetGame();
    this.props.exitModal('endgame');
  }

  retryGame() {
    this.audio.click.play();
    this.props.gameActions.restartGame();
    this.props.exitModal('endgame');
  }

  getReactionText(old_stars, new_stars) {

    let reactionText = "";
    let key = null;
    let variant = 0;
    var mapping = {
      "0": "zero",
      "1": "one",
      "2": "two",
      "3": "three"
    };

    if(old_stars) {
      key = mapping[old_stars]+'2'+mapping[new_stars];
      if(this.scoreFeedback[key]) {
        let ret = this.chooseRandom(this.scoreFeedback[key], true);
        reactionText = ret.val;
        variant = ret.i;
      } else {
        key = mapping[new_stars];
        let ret = this.chooseRandom(this.scoreFeedback[key], true);
        reactionText = ret.val;
        variant = ret.i;
      }
    } else {
      key = mapping[new_stars];
      let ret = this.chooseRandom(this.scoreFeedback[key], true);
      reactionText = ret.val;
      variant = ret.i;
    }

    if(this.reactionAudioPaths[key]) {
      this.audio.reaction = new Howl({src: [prefixCDN('/assets/globalui/audio/' + this.reactionAudioPaths[key][variant] + '.ogg'), prefixCDN('/assets/globalui/audio/' + this.reactionAudioPaths[key][variant] + '.mp3')]});
    }

    return reactionText;
  }

  chooseRandom(arr, includeIndex=false){
    let i = Math.floor(Math.random()*arr.length);
    if(includeIndex) {
      return {i: i, val: arr[i]};
    }
    return arr[i];
  }

  componentDidMount() {
    this.numStars = ('numStars' in this.props.data) ? this.props.data.numStars : null;
    this.oldStars = (('progress' in this.props.data.exercise) && this.props.data.exercise.progress.earned) ? this.props.data.exercise.progress.earned : null;
    let useCheck = false;

    if(this.props.data.isScored) {
      if(this.numStars!==null) {
        for (let i = 1; i <= this.numStars; i++) {
          this.props.setTimeout(() => {
            this.renderStar(i);
            this.audio['star_' + i].play();
          }, i * 500 + 100);
          if (i === this.numStars) {
            this.props.setTimeout(() => {
              this.setState({starAnimation: 'done'});
              this.props.setTimeout(() => {
                this.audio.reaction.play();
              }, 1000);
            }, (i + 1) * 500 + 100);
          }
        }
        this.reactionText = this.getReactionText(this.oldStars, this.numStars);
      } else {
        useCheck = true;
      }
    } else {
      useCheck = true;
    }

    if(useCheck) {
      this.reactionText = (<Fragment>You finished!<br />Keep going.</Fragment>);
      let audio = this.chooseRandom(this.reactionAudioPaths.checkmark);
      this.audio.reaction = new Howl({src: [prefixCDN(audio + '.ogg'), prefixCDN(audio + '.mp3')]});
      this.props.setTimeout(() => {
        this.renderCheck();
        this.props.setTimeout(() => {
          this.audio.star_3.play(); // todo: a different sound for checkmarks?
          this.props.setTimeout(() => {
            this.audio.reaction.play();
          }, 600);
        }, 300);
      }, 400);
    }

    if(parseInt(this.props.player.currentPlayerId) !== -1 && this.props.data.isScored && !this.props.data.isTyping) {
      this.setState({showMasteryBar: true});
      let currentSkill = this.props.player.progress[this.props.player.currentPlayerId].skillMastery;
      this.skills = ('trackedSkills' in this.props.game.currentGame) ? this.props.game.currentGame.trackedSkills : [''];
      this.oldMastery = 0;

      if (this.skills[0] && currentSkill && this.skills[0] in currentSkill) {
        this.oldMastery = currentSkill[this.skills[0]] * 100;

         let skillSplit = this.skills[0].split('.');
         this.subject = skillSplit[0];
      }
    }

    this.deltaPoints = ('deltaPoints' in this.props.data) ? this.props.data.deltaPoints : 0;
  }

  renderStar(i) {
    this.stars.push(
      <div className={"endstar star_"+i} key={"endstar_"+i}/>
    );
    this.currentStar++;
    this.forceUpdate();
  }

  renderCheck() {
    this.check = (<div className="endcheck" key="endcheck"/>);
    this.forceUpdate();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.game.newBadges !== prevProps.game.newBadges && this.state.newBadges==='pending') {
      if(this.props.data.isScored) {
        // Delay because star sequencing takes longer
        this.props.setTimeout(() => {
          this.setState({newBadges: this.props.game.newBadges});
        }, 1500);
      } else {
        this.setState({newBadges: this.props.game.newBadges});
      }
    }

    if(this.props.game.newSkillMastery !== prevProps.game.newSkillMastery) {
      this.setState({newMasteryScoreAPIResponse: 'done'});
      this.newMastery = this.props.game.newSkillMastery[0].proficiency * 100 + 5;

      this.props.playerActions.updateSkill({
        playerId: this.props.player.currentPlayerId,
        skill: this.props.game.newSkillMastery[0].skill,
        proficiency: this.props.game.newSkillMastery[0].proficiency
      });

      this.newMastery = (this.newMastery>100) ? 100 : this.newMastery;
    }
  }

  componentWillUnmount() {
    this.props.gameActions.setNewBadgesEndGame('pending');
  }

  render() {
    let starsEl = null;
    let checkEl = null;
    if(this.props.data) {
      if (this.props.data.isScored) {
        starsEl = (
          <div className="star_container">
            <div className="endstars_back">
              {this.stars}
            </div>
          </div>
        );
      } else {
        checkEl = (
          <div className="check_container">
            <div className="endcheck_back">
              {this.check}
            </div>
          </div>
        );
      }
    }
    
    let metricsEl = [];
    if(this.props.data.isTyping){
      if(this.props.data.tracking_data.hasOwnProperty(this.SCORE_METRIC_WPM)){
        metricsEl.push(
          <div className="metric_row" key="metric_WPM">
            <div className="metric_label">Words Per Minute:</div>
            <div className="metric_value">{Math.round(this.props.data.tracking_data.WPM)}</div>
          </div>
        );
      }
      if(this.props.data.tracking_data.hasOwnProperty(this.SCORE_METRIC_GROSS_WPM)){
        metricsEl.push(
          <div className="metric_row faded" key="metric_GrossWPM">
            <div className="metric_label">Gross WPM:</div>
            <div className="metric_value">{Math.round(this.props.data.tracking_data.grossWPM)}</div>
          </div>
        );
      }
      if(this.props.data.tracking_data.hasOwnProperty(this.SCORE_METRIC_ACCURACY)){
        metricsEl.push(
          <div className="metric_row" key="metric_Accuracy">
            <div className="metric_label">Accuracy:</div>
            <div className="metric_value">{Math.round(this.props.data.tracking_data.accuracy)}<small>%</small></div>
          </div>
        );
      }
      if(this.props.data.tracking_data.hasOwnProperty(this.SCORE_METRIC_RAW_ACCURACY)){
        metricsEl.push(
          <div className="metric_row faded" key="metric_RawAccuracy">
            <div className="metric_label">Raw Accuracy:</div>
            <div className="metric_value">{Math.round(this.props.data.tracking_data.rawAccuracy)}<small>%</small></div>
          </div>
        );
      }
    }

    let skillMasteryEl = null;
    if(this.state.showMasteryBar) {
      if(this.oldMastery >= 0 && this.oldMastery >= 0) {
        const proficient = 85;
        const emerging = 50;

        let masteryLevel = '';
        if(this.oldMastery >= proficient) {
          masteryLevel = 'proficient';
        } else if(this.oldMastery >= emerging) {
          masteryLevel = 'emerging';
        } else {
          masteryLevel = 'approaching';
        }

        const proficientStyle = {
          background: '#50c75c',
          boxShadow: '0px -5.5px 0.5px -1px #23922e inset'
        };

        const emeringStyle = {
          background: '#ffe81e',
          boxShadow: '0px -5.5px 0.5px -1px #dccc42 inset'
        };

        const approachingStyle = {
          background: '#f77',
          boxShadow: '0px -5.5px 0.5px -1px #d95050 inset'
        };

        let masteryBarStyle = {};
        if(this.state.starAnimation === 'wait' || this.state.newMasteryScoreAPIResponse === 'wait') {
          masteryBarStyle = {
            width: this.oldMastery + '%'
          };
        } else {
          masteryBarStyle = {
            width: this.newMastery + '%',
            transition: 'width 1s, background 1s, box-shadow 1s'
          };

          if(this.newMastery >= proficient) {
            Object.assign(masteryBarStyle, proficientStyle);
          } else if(this.newMastery >= emerging) {
            Object.assign(masteryBarStyle, emeringStyle);
          } else {
            Object.assign(masteryBarStyle, approachingStyle);
          }
        }

        let deltaMasteryBarStyle = {
          width: this.newMastery + '%'
        };

        skillMasteryEl = (
            <div className="mastery_row">
              <div className="mastery_bar_container">
                <div className={`mastery_bar ${masteryLevel}`} style={masteryBarStyle} />
                <div className="delta_mastery_bar" style={deltaMasteryBarStyle} />
                <div className={`skill_mastery_prize ${this.subject}`} />
              </div>
              <div className="skill_label">{this.props.player.skillMap[this.skills[0]]}</div>
            </div>
        );
      }
    }

    let pointsEl = null;
    if(!this.state.showMasteryBar && this.deltaPoints){
      pointsEl = (
          <div className="points_row">
            <div className="label">You earned</div>
            <div className="icon points"><i/></div>
            <div className="deltaPoints">{this.deltaPoints} points!</div>
          </div>
      );
    }

    let newBadgesEl = null;
    if (this.state.newBadges && this.state.newBadges !== 'seen' && this.state.newBadges !== 'pending') {
      if (this.state.newBadges.length > 0) {
        newBadgesEl = <PopBadges badges={this.state.newBadges}
                       setNewBadgesEndGame={this.props.gameActions.setNewBadgesEndGame}
                       finishBadgeView={()=>{this.setState({newBadges: 'seen'})}} />
      }
    }

    let nextButtonText = "Next";
    if(this.props.data.nextExercise && !this.props.data.completedLesson) {
      let gameObj = this.props.data.nextExercise;
      let type = 'Game';
      if (gameObj.type === 'skill-builders') {
        type = 'Exercise';
      } else if (gameObj.type === 'worksheet') {
        type = 'Worksheet';
      } else if (gameObj.template === 'video') {
        type = 'Song';
      } else if (gameObj.template === 'story' || gameObj.template === 'bookbuilder') {
        type = 'Story';
      }
      nextButtonText = "Next " + type;
    } else if (this.props.data.goingTo === 'assignments') {
      nextButtonText = "Assignments";
    } else if(this.props.data.completedLesson && this.props.data.nextUrl && URL.getScreen((this.props.data.nextUrl).replace(/^.+#/,'#'))==='assignments') {
      nextButtonText = "Assignments";
    } else if(this.props.data.completedLesson && this.props.data.nextUrl && URL.getScreen((this.props.data.nextUrl).replace(/^.+#/,'#'))==='assignment') {
      nextButtonText = "Next Assignment";
    } else if(this.props.data.completedLesson && !this.props.data.completedGrade) {
      nextButtonText = "Next Lesson";
    }

    let showRetry = true;
    if(this.props.data.goingTo === 'next challenge exercise'){
      showRetry = false;

      let challengeId = this.props.player.currentChallengeId;
      let positions = (this.props.player.currentPlayerId in this.props.player.challengePositions) ? this.props.player.challengePositions[this.props.player.currentPlayerId] : null;
      let challenges = (this.props.player.currentPlayerId in this.props.player.challenges) ? this.props.player.challenges[this.props.player.currentPlayerId] : null;

      if(challengeId && positions && (challengeId in challenges) && (challengeId in positions)) {
        let total = challenges[challengeId].total;
        let position = positions[challengeId];
        if(position+1 < total) {
          nextButtonText = "Continue Challenge";
        }
      }
    }

    let showNext = true;
    if ('singlePlayToken' in window.kidframe && window.kidframe.singlePlayToken) {
      showNext = false;
      if(window.kidframe && window.kidframe.clickedPause) {
        window.kidframe.clickedPause();
      }
    }

    return (
      <div className={`endgame_modal_container ${this.props.data.isTyping?'typing':''}`}>
        {starsEl}
        {checkEl}
        <div className="middle">
          <h1 className="reaction_text">{this.reactionText}</h1>
          {metricsEl}
          {skillMasteryEl}
          {pointsEl}
          {newBadgesEl}
        </div>
        <div className="buttons">
          {showRetry && (
            <div className={`modal_btn btn_play_again
              ${this.state.newBadges!=='seen' && "hidden"}
            `} onClick={this.retryGame} key={'again'}><i className="icon-ccw"/>Play Again</div>
          )}
          {showNext && (
            <div className={`modal_btn btn_next
              ${this.state.newBadges!=='seen' && "hidden"}
              ${this.props.data.goingTo==='next challenge exercise'?'btn_challenge_next':''}
            `} onClick={this.goToPage} key={'next'}><i className="icon-right-big"/>{nextButtonText}</div>
          )}
        </div>
      </div>
    );
  }
}

export default ReactTimeout(EndGameModal);