import React from 'react';
import ReactTimeout from 'react-timeout';
import Players from '../../../services/player';

import { Howl, Howler } from 'howler';

class GradeSelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      menu: {
        active: false,
        timeout: null
      }
    };

    this.audio = {};
    this.audio.click = new Howl({src: [prefixCDN('/assets/kidframe/audio/select_general.ogg'), prefixCDN('/assets/kidframe/audio/select_general.mp3')]});
    this.audio.pop = new Howl({src: [prefixCDN('/assets/kidframe/audio/pop.ogg'), prefixCDN('/assets/kidframe/audio/pop.mp3')]});

    this.clickMenu = this.clickMenu.bind(this);
    this.clickMenuItem = this.clickMenuItem.bind(this);
    this.hoverMenuDropdown = this.hoverMenuDropdown.bind(this);
  }

  clickMenu() {
    if(this.state.menu.active) {
      this.state.menu.active = false;
      this.props.clearTimeout(this.state.menu.timeout);
    } else {
      this.state.menu.active = true;
      this.audio.pop.play();
    }
    this.forceUpdate();
  }

  hoverMenuDropdown(entering) {
    if(entering){
      this.props.clearTimeout(this.state.menu.timeout);
    } else {
      this.state.menu.timeout = this.props.setTimeout(() => {
        this.state.menu.active = false;
        this.forceUpdate();
      }, 2000);
    }
  }

  clickMenuItem(grade) {
    this.state.menu.active = false;
    this.audio.click.play();
    this.props.clearTimeout(this.state.menu.timeout);
    this.forceUpdate();

    this.props.clickGrade(this.props.subject, grade);
  }

  gradeList(grades, currentGrade) {
    if(currentGrade && grades.length > 1) {
      return grades.map((grade, index) => {
        return (
          <div className={`item ${grade.grade === currentGrade.grade ? 'selected' : ''}`} onClick={()=>{this.clickMenuItem(grade)}} key={index}>
            {grade.grade}
          </div>
        )
      });
    } else {
      return null;
    }
  }

  render() {
    let grade = this.props.player.gradesSelected[this.props.subject];
    if(!grade) {
      return null;
    }
    let iconPencil = <i className="icon-pencil"/>;

    if(this.props.grades.length <= 1) {
       grade = this.props.grades[0] ? this.props.grades[0] : grade;
       iconPencil = '';
    }
    let gradeName = grade !== null? grade.grade : '';

    return (
      <div className={`gradeSelector ${this.props.subject}`}>
        <div className="currentSelected">
          <h3 className="gradeName" onClick={this.clickMenu.bind(this)}>
            {gradeName} {iconPencil}
          </h3>
         <div className={`gradeList ${this.state.menu.active ? '' : 'hidden'}`} onMouseOver={this.hoverMenuDropdown.bind(this, true)} onMouseOut={this.hoverMenuDropdown.bind(this, false)}>
           {this.gradeList(this.props.grades, grade)}
         </div>
        </div>
      </div>
    );
  }
};

export default ReactTimeout(GradeSelector);
