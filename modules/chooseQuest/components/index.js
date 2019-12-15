import React from 'react';
import ReactTimeout from 'react-timeout';

import Players from '../../../services/player';
import GradeSelector from './gradeSelector';
import LoadingTreadmill from '../../../widgets/loadingTreadmill';

import { Howl, Howler } from 'howler';

import Gift from '../../../widgets/gift.js';

class ChooseQuest extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lockButtons: false,
      clickedQuest: null
    };
    this.questRenderNo = 0;

    this.playedQuestSounds = false;
    this.audio = {};
    this.audio.start = new Howl({src: [prefixCDN('/assets/kidframe/audio/quest_start.ogg'), prefixCDN('/assets/kidframe/audio/quest_start.mp3')]});
    this.audio.assignments = new Howl({src: [prefixCDN('/assets/kidframe/audio/select_general.ogg'), prefixCDN('/assets/kidframe/audio/select_general.mp3')]});
    this.audio.softbounce = new Howl({src: [prefixCDN('/assets/kidframe/audio/softbounce.ogg'), prefixCDN('/assets/kidframe/audio/softbounce.mp3')]});

    this.getQuestProps = this.getQuestProps.bind(this);
    this.getAllGrades = this.getAllGrades.bind(this);
    this.clickQuest = this.clickQuest.bind(this);
    this.clickGrade = this.clickGrade.bind(this);
    this.getPath = this.getPath.bind(this);
    this.gotoAssignments = this.gotoAssignments.bind(this);
    this.gotoChallenge = this.gotoChallenge.bind(this);
    this.renderSubject = this.renderSubject.bind(this);

  }

  /**
   * get the props for a quest type
   * @param  {string} subject ela or math
   * @return {object}         all the props that are need for the quest type
   */
  getQuestProps(subject, gradeLock=false){
    return {
      grades: this.getAllGrades(subject, gradeLock),
      player: this.props.player,
      subject: subject,
      clickGrade: this.clickGrade
    }
  }

  /**
   * get all the grades for a subject Eg math
   * @return {[array]} array with all the grades in it
   */
  getAllGrades(subject, gradeLock){
    let sequences = this.props.player.sequences;
    let grades = [];
    if(subject in sequences){
      let gradeSequences = sequences[subject];
      for (var key in gradeSequences.courses) {
        let course = gradeSequences.courses[key];
        if(gradeLock) {
          if(course.grade === gradeLock) {
            grades.push({'grade': course.grade, 'internalName': course.internalName});
          }
        } else {
          grades.push({'grade': course.grade, 'internalName': course.internalName});
        }

      }
    }
    return grades;
  }

  clickQuest(subject, canClick) {
    if(this.state.lockButtons) return;
    if(canClick) {
      this.setState({lockButtons: true});
      this.setState({clickedQuest: subject});
      let playerId = this.props.player.currentPlayerId;
      let currentPlayer = this.props.player.players.noGroups.children[playerId];

      // let currentPlayerProgress = null;
      // if(playerId && this.props.player.progress[playerId]){
      //   currentPlayerProgress = this.props.player.progress[playerId];
      // }
      let path = '#';

      if(subject === 'assignments') {
        this.audio.assignments.play();
        this.props.setTimeout(()=> {
          this.gotoAssignments();
        }, 500);

      } else if(subject === 'challenge') {
        this.audio.start.play();
        this.props.setTimeout(()=> {
          this.gotoChallenge();
        }, 500);

      } else {
        this.audio.start.play();
        // path = this.getPath(currentPlayerProgress, subject, path);
        path = this.getPath(subject, path);
        this.props.setTimeout(()=> {
          this.props.router.push(location.search + path);
        }, 500);
      }
    }
  }

  clickGrade(subject, grade){
    if(this.state.lockButtons) return;

    let payload = {};
    payload[subject] = grade;
    this.props.playerActions.setGrade(payload);
  }

  // getPath(currentPlayerProgress, subject, path) {
  getPath(subject, path) {
    if(subject==='typing') {
      path += 'typing,typing';
    } else {
      let gradeSelector = this.props.player.gradesSelected[subject];
      path += subject + ',';
      path += gradeSelector.internalName;
    }

    return path;
  }
  componentDidMount(){
    this.props.loadingActions.loadingFinished();
  }
  gotoAssignments() {
    let playerId = this.props.player.currentPlayerId;
    let assignmentsLoaded = this.props.player.assignmentsLoaded;

    if (assignmentsLoaded) {
      this.props.router.push(location.search + '#assignments');
    } else {
      this.props.playerActions.fetchAssignments();
      Players.getAssignments(playerId).then((resp) => {
        this.props.playerActions.setAssignments({playerId: playerId, assignments: resp.assignments});
        this.props.router.push(location.search + '#assignments');
      });
    }
  }
  gotoChallenge() {
    this.props.router.push(location.search + '#challenge');
  }

  renderSubject(subject, mandatoryAssignment=false, activeAssignmentCount=0, playSound){
    let playerId = this.props.player.currentPlayerId;
    let userType = this.props.user.userType;
    let currentPlayerProgress = null;
    let assignmentsoftbounce = null;
    let assignmentLockQuest  = null;
    let classroomHideGrade = this.props.player.players.noGroups.children[playerId].classroomHideGrade;
    let classroomLockedGrade = this.props.player.players.noGroups.children[playerId].classroomLockedGrade;
    let hiddenGrade = classroomHideGrade && userType==='classroom' ? classroomHideGrade : this.props.player.players.noGroups.children[playerId].hiddenGrade;
    let lockedGrade = classroomLockedGrade && userType==='classroom' ? classroomLockedGrade : this.props.player.players.noGroups.children[playerId].lockedGrade;

    if(playerId && this.props.player.progress[playerId]){
      currentPlayerProgress = this.props.player.progress[playerId];
      if(activeAssignmentCount> 0) {
        assignmentsoftbounce = (<div className='assignment_softbounce'><div className="assignment_bubble"><span>{activeAssignmentCount}</span></div></div>);
      }
      if(mandatoryAssignment){
        assignmentLockQuest = (<div className='quest-lock'><img src={prefixCDN('/assets/kidframe/ui/lock.png')}/></div>);
      }
      // Set the last played grades based on playerProgress
    }

    let ret = null;
    let questClass = "";
    if(this.state.clickedQuest==subject) {
      questClass = "selected";
    } else if(this.state.clickedQuest!==null && this.state.clickedQuest!=subject){
      questClass = "not_selected";
    }
    switch(subject) {
      case 'assignments':
        if(playerId!=-1) {
          ret = (
            <div className={`subject ${questClass}`} key="subject_assignments" style={{animationDelay: (this.questRenderNo*130)+'ms'}}>
              <div className={`play_course_container ${questClass}`} onClick={this.clickQuest.bind(this, 'assignments', true)}>
                <div className="back assignments">
                  {assignmentsoftbounce}
                  <div className="course_btn course_assignments"/>
                </div>
              </div>
            </div>
          );
        }
        break;

      case 'challenge':
        if(window.kidframe && window.kidframe.showAdaptive) {
          if(playerId!=-1) {
            ret = (
              <div className={`subject ${questClass}`} key="subject_challenge"
                   style={{animationDelay: (this.questRenderNo * 130) + 'ms'}}>
                {assignmentLockQuest}
                <div className={`play_course_container ${questClass}`}
                     onClick={this.clickQuest.bind(this, 'challenge', !mandatoryAssignment)}>
                  <div className="back challenge">
                    {assignmentsoftbounce}
                    <div className="course_btn course_challenge"/>
                  </div>
                </div>
              </div>
            );
          }
        }
        break;

      default:
        if( subject in currentPlayerProgress.playerSequence ){
          let gradeSelector = null;
          if(subject!=='typing' && !hiddenGrade){
            gradeSelector = (<GradeSelector {...this.getQuestProps(subject, lockedGrade)}/>);
          }
          ret = (
            <div className={`subject ${questClass}`} key={'subject_'+subject} style={{animationDelay: (this.questRenderNo*100)+'ms'}}>
            {assignmentLockQuest}
              <div className={`play_course_container ${questClass}`} onClick={this.clickQuest.bind(this, subject, !mandatoryAssignment)}>
                <div className={`back ${subject}`}>
                  <div className={`course_btn course_${subject}`}/>
                </div>
              </div>
              {gradeSelector}
            </div>
          );
        }
    }
    if(ret){
      let fraction = 0.057762265046662105;
      let steps = [0, 4, 7, 11, 12];
      if(playSound) {
        ((j) => {
          this.props.setTimeout(() => {
            let a = this.audio.softbounce.play();
            this.audio.softbounce.rate(Math.exp(fraction * steps[j]), a);
          }, 350 + j * 130);
        })(this.questRenderNo);
      }
      this.questRenderNo++;
    }
    return ret;
  }

  renderLoading() {
    return(
      <section className="choose_quest_container loading">
        <div style={{position:'absolute', top: '300px', left: '0', width:'100%', textAlign: 'center'}}>
          <LoadingTreadmill />
          <div style={{clear: 'both'}}/>
          <h1 style={{color: '#1e8474'}}>Loading Quests
            <div className="loadingDots">
              <div className="dot1"/><div className="dot2"/><div className="dot3"/>
            </div>
          </h1>
        </div>
      </section>
    );
  }

  render() {
    this.questRenderNo = 0;

    // making sure that the data is loaded or show a loading screen
    if(this.props.player.currentPlayerSet && this.props.player.progressLoaded && this.props.player.sequenceLoaded) {
      let mandatoryAssignment = false;
      let assignmentLockInfo = null;
      let playerId = this.props.player.currentPlayerId;
      let currentPlayerProgress = this.props.player.progress[playerId];
      let activeAssignmentCount = 0;

      for (var assignmentKey in currentPlayerProgress.assignments) {
        let assignment = currentPlayerProgress.assignments[assignmentKey];
        if(assignment.progress === null || assignment.progress.completion < 1) {
            activeAssignmentCount++;
            if (assignment.mandatory === true) {
              mandatoryAssignment = true;
              assignmentLockInfo = (<div className='quest-lock-info'><img src={prefixCDN('/assets/kidframe/ui/lock.png')}/> <h3>You have mandatory assignments</h3></div>);
            }
        }
      }

      let playSound = false;
      if(!this.playedQuestSounds){
        playSound = true;
        this.playedQuestSounds = true;
      }

      let subjects = [
        this.renderSubject('assignments', mandatoryAssignment, activeAssignmentCount, playSound),
        this.renderSubject('math', mandatoryAssignment, false, playSound),
        this.renderSubject('ela', mandatoryAssignment, false, playSound),
        this.renderSubject('typing', mandatoryAssignment, false, playSound),
        this.renderSubject('challenge', mandatoryAssignment, false, playSound)
      ];


      let giftProps = null;

      if (this.props.player.players.noGroups !== undefined) {
        giftProps = {
          currentPlayer: this.props.player.players.noGroups.children[this.props.player.currentPlayerId],
          gift: this.props.player.gift,
          giftLoaded: this.props.player.giftLoaded,
          modalActions: this.props.modalActions
        };
      }

      let gift = giftProps !== null && this.props.player.giftLoaded && this.props.player.gift ? <Gift {...giftProps} /> : null;


      return (
        <section className="choose_quest_container">
          <div className={`backColor ${this.state.clickedQuest ? this.state.clickedQuest : ""}`}/>
          <div className="subjects" key="subjects">
            <h1 className="title">Choose a Quest</h1>
            <div className={`subjectContainer ${subjects.length>4 && 'small'}`}>
              {subjects}
              {gift}
            </div>
          </div>
          {assignmentLockInfo}
        </section>
      );

    } else {
      return this.renderLoading();
    }
  }
}

export default ReactTimeout(ChooseQuest);
