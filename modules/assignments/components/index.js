import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import ReactTimeout from "react-timeout";

import { Howl, Howler } from 'howler';
const assignmentsMaxHeight = 600;
class Assignments extends React.Component {

  ASSIGNMENT_URL = '#assignment';

  constructor(props) {
    super(props);

    this.state =  {
      navClass : 'hidden',
      nextButtonDisabled : false,
      previousButtonDisabled : true,
      containerScrollTop : 0,
      numBullets : 0
    };

    this.audio = {};
    this.audio.start = new Howl({src: [prefixCDN('/assets/kidframe/audio/quest_start.ogg'), prefixCDN('/assets/kidframe/audio/quest_start.mp3')]});

    this.goToAssignment = this.goToAssignment.bind(this);
    this.generateAssignmentUrl = this.generateAssignmentUrl.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.updateButtonsStates = this.updateButtonsStates.bind(this);
    this.paginationClick = this.paginationClick.bind(this);
    this.animateScrollTo = this.animateScrollTo.bind(this);
  }

  componentDidMount(){
    this.props.loadingActions.loadingFinished();

    if(document.querySelector('#assignments-list')) {
      if (assignmentsMaxHeight < document.querySelector('#assignments-list').scrollHeight) {
        this.setState({navClass: ''});
        document.querySelector('#assignments-list').addEventListener('scroll', this.handleScroll);
        this.setState({numBullets: Math.ceil(document.querySelector('#assignments-list').scrollHeight / assignmentsMaxHeight)})
      }
    }
  }

  handleScroll (event) {
    if(document.querySelector('#assignments-list')) {
      this.setState({containerScrollTop: document.querySelector('#assignments-list').scrollTop});
      this.updateButtonsStates();
    }
  }

  generateAssignmentUrl(assignment) {
    let assignmentUrl = location.search + this.ASSIGNMENT_URL +'-'+ assignment.id;
    return assignmentUrl;
  }

  goToAssignment (assignment) {
    this.audio.start.play();
    let playerActions = this.props.playerActions;
    this.props.router.push(this.generateAssignmentUrl(assignment));
  }

  getAssignmentProgressBar (assignment) {
    let item = [];
    let progress, started, starClass, assignmentName;
    let star1, star2, star3;

    item.push(Object.keys(assignment.items).map((key)=>{
      progress = this.getAssignmentItemProgress(assignment, assignment.items[key]);
      assignmentName = assignment.items[key].name;
      started = !progress.earned ? 'exercise not-started' : 'exercise started';
      starClass = !progress.earned ? 'icon-star-empty' : 'icon-star';
      star1 = (progress.earned < 1) ? 'empty' : 'full';
      star2 = (progress.earned < 2) ? 'empty' : 'full';
      star3 = (progress.earned < 3) ? 'empty' : 'full';
      return (
        <div className={started} key={key}>{/*make this a link to assignment game*/}
          <div className="hidden tooltip">{assignmentName}
            <div className="diamond"/>
          </div>
          <i className={starClass + ' ' + star1}/>
          <i className={starClass + ' ' + star2}/>
          <i className={starClass + ' ' + star3}/>
        </div>
      );
    }));
    return (
      <div className="progress">
        {item}
      </div>
    );
  }

  getAssignmentItemProgress (assignment, exercise) {
    var self = this;
    var def = {earned:0, possible:3};
    assignment = assignment || this.assignment;
    exercise = exercise || this.exercise;

    if(!assignment) return def;
    if(!exercise) return def;

    var progress = assignment.progress;
    if(!progress || !progress.items) return def;

    for(var i=0; i<progress.items.length; i++) {
      if(progress.items[i].internalName === exercise.internalName) {
        if(exercise.is_scored) {
          def.earned = Math.round(progress.items[i].score*3);
        }
        // Unscored game
        else {
          if(progress.items[i].completion) {
            def.earned = 3;
          }
        }
        break;
      }
    }

    return def;
  }

  animateScrollTo(element, scrollTo, duration) {
    const speed = 5;
    let endScrollTop = scrollTo;
    if (duration < 0) {
      element.scrollTop = endScrollTop;
      this.setState({ containerScrollTop : endScrollTop });
      this.updateButtonsStates();
      return;
    }
    let difference = scrollTo - element.scrollTop;
    let perTick = difference / duration * speed;

    this.props.setTimeout(() => {
      element.scrollTop = element.scrollTop + perTick;
      this.animateScrollTo(element, scrollTo, duration - speed);
    }, speed);
  }

  paginationClick(page) {
    if(document.querySelector('#assignments-list')) {
      let scrollTo = page * assignmentsMaxHeight;
      this.animateScrollTo(document.querySelector('#assignments-list'), scrollTo, 200);
    }
  }

  updateButtonsStates(){
    if(document.querySelector('#assignments-list')) {
      if (this.state.containerScrollTop + assignmentsMaxHeight == document.querySelector('#assignments-list').scrollHeight) {
        this.setState({nextButtonDisabled: true});
      } else {
        this.setState({nextButtonDisabled: false});
      }

      if (0 == document.querySelector('#assignments-list').scrollTop) {
        this.setState({previousButtonDisabled: true});
      } else {
        this.setState({previousButtonDisabled: false});
      }
    }
  }

  nextPage(){
    if(document.querySelector('#assignments-list')) {
      let scrollTo = Math.min(this.state.containerScrollTop + assignmentsMaxHeight, document.querySelector('#assignments-list').scrollHeight);
      this.animateScrollTo(document.querySelector('#assignments-list'), scrollTo, 200);
    }
  }

  previousPage(){
    if(document.querySelector('#assignments-list')) {
      let scrollTo = Math.max(this.state.containerScrollTop - assignmentsMaxHeight, 0);
      this.animateScrollTo(document.querySelector('#assignments-list'), scrollTo, 200);
    }
  }

  render() {
    let playerId = this.props.player.currentPlayerId;
    let assignments = {};
    let bullets = [];
    for (let i = 0; i < this.state.numBullets; i++){
      let active = Math.ceil((this.state.containerScrollTop)/assignmentsMaxHeight) === i?'active':'';
      bullets.push((<div key={`bullet_${i}`} onClick={()=>{this.paginationClick(i)}} className={`page_bullet ${active}`} data-page={`${i}`}>
        <div className="inner_bullet"></div>
      </div>));
    }
    if(playerId in this.props.player.progress && 'assignments' in this.props.player.progress[playerId]) {
      assignments = this.props.player.progress[playerId].assignments;
    } else {
      return(
        <section className="assignments_container">
          <div className="assignments">
            <h1>Assignments</h1>
            <h2 style={{color: '#1e8474', marginTop: '100px'}}>Loading Assignments
              <div className="loadingDots">
                <div className="dot1"/><div className="dot2"/><div className="dot3"/>
              </div>
            </h2>
          </div>
        </section>
      );
    }

    return (
      <section className="assignments_container">
        <div className="assignments">
          <h1>Assignments</h1>
          <div id={"assignments-list"} className="table-holder">
            <table className="current-table">
              <thead>
              <tr className="table-header">
                <th className="name-cell">Name</th>
                <th className="mandatory-cell"/>
                <th className="progress-cell">Progress</th>
                <th className="due-date">Due Date</th>
                <th className="actions">Actions</th>
              </tr>
              </thead>
              {Object.keys(assignments).map((key)=>{
                let assignment = assignments[key];
                let due = new Date(assignment.dateDue*1000).toLocaleDateString();
                let action = true ? <div className="btn btn-green btn-lg play">Play</div>
                  : <div className="complete-message">Completed</div>;

                return (
                  <tbody key={assignment.id} onClick={this.goToAssignment.bind(this,assignment)}>
                  <tr>
                    <td className="name">{assignment.name}</td>
                    <td className="mandatory">{assignment.mandatory?'Required':''}</td>
                    <td className="progress-cell">{this.getAssignmentProgressBar(assignment)}</td>
                    <td className="due-date">{due}</td>
                    <td className="actions">{action}</td>{/*@todo bring to game page*/}
                  </tr>
                  </tbody>
                );
              })}
            </table>
          </div>

          <div className={`
            next_button
            ${this.state.navClass}
            ${this.state.nextButtonDisabled ? 'disabled' : ''}
          `} onClick={this.nextPage}>
            <div className="inner_button">
              <i />
            </div>
          </div>
          <div className={`
            previous_button
            ${this.state.navClass}
            ${this.state.previousButtonDisabled ? 'disabled' : ''}
          `} onClick={this.previousPage}>
            <div className="inner_button">
              <i />
            </div>
          </div>
        </div>
        <div className={`
          pagination
          ${this.state.navClass}
          `}>
          {bullets}
        </div>
      </section>
    );
  }
};

export default ReactTimeout(Assignments);
