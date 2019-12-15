import React from 'react';
import ReactTimeout from 'react-timeout';
import { Howl, Howler } from 'howler';
import LoadingTreadmill from '../../../widgets/loadingTreadmill';
import * as URL from '../../../helpers/url';
import Gift from '../../../widgets/gift.js';

class Map extends React.Component {
  constructor(props) {
    super(props);

    this.subject = null;
    this.grade = null;
    this.mapInfo = null;
    this.mapSequence = null;
    this.currentPlayerProgress = null;

    this.state = {
      lockButtons: false,
      audioCooldown: false,
      characterEntered: this.props.toLesson ? true : false,
      clickedLessonId: null,
      characterX: null,
      characterY: null,
      displayGift: true
    };

    this.audio = {};
    this.lessonAudio = [];
    this.audio.click = new Howl({src: [prefixCDN('/assets/kidframe/audio/lesson_start.ogg'), prefixCDN('/assets/kidframe/audio/lesson_start.mp3')]});

    this.placeLessons = this.placeLessons.bind(this);
    this.clickLesson = this.clickLesson.bind(this);
    this.playAudio = this.playAudio.bind(this);
  }

  clickLesson(path, lessonPosition){
    if(this.state.lockButtons) return;
    for(var key in this.audio){
      this.audio[key].stop();
    }
    this.audio.click.play();
    this.setState({lockButtons: true});
    this.setState({clickedLessonId: path[2]});
    this.props.setCharacterPosition(lessonPosition);
    let toUrl = location.search+'#'+path.toString();

    if(lessonPosition.x !== this.state.characterX || lessonPosition.y !== this.state.characterY) {
      // animate to new position
      ((newX, newY, toUrl) => {
        let el = document.querySelector("#map_character");
        if (!el) return;
        el.style.left = newX + 'px';
        el.style.top = newY + 'px';
        el.style.marginTop = '-153px';
        el.style.transform = 'scale(1.5)';
        el.style.transition = "1000ms left ease-in-out, 1000ms top ease-in-out, 500ms transform cubic-bezier(0.550, 0.085, 0.680, 0.530), 500ms margin-top cubic-bezier(0.550, 0.085, 0.680, 0.530)";
        this.props.setTimeout(() => {
          if (!el) return;
          el.style.marginTop = '-83px';
          el.style.transform = 'scale(1)';
          this.props.setTimeout(() => {
            this.props.router.push(toUrl);
          }, 750);
        }, 500);
      })(lessonPosition.x, lessonPosition.y, toUrl);
    } else {
      // same lesson
      this.props.setTimeout(() => {
        this.props.router.push(toUrl);
      }, 250);
    }
  }

  playAudio(src){
    if(!src) return;
    if(this.state.audioCooldown) return;
    if(this.state.lockButtons) return;
    for(var key in this.audio){
      this.audio[key].stop();
    }
    this.audio[src].play();
    this.setState({audioCooldown: true});
    this.props.setTimeout(()=>{
      this.setState({audioCooldown: false});
    }, 500);
  }

  placeLessons(mapSequence){
    if('lessons' in mapSequence && this.props.player.playersLoaded) {
      let playerId = this.props.player.currentPlayerId;
      let player = this.props.player.players.noGroups.children[playerId];
      let characterPlaced = false;
      let gradeInternalName = (this.subject!=='typing') ? this.props.player.gradesSelected[this.subject].internalName : 'typing';
      if(!this.currentPlayerProgress && playerId && this.props.player.progress[playerId]){
        this.currentPlayerProgress = this.props.player.progress[playerId];
      }
      let path = [];
      if('lastPlayed' in this.currentPlayerProgress && this.subject in this.currentPlayerProgress.lastPlayed && gradeInternalName in this.currentPlayerProgress.lastPlayed[this.subject] && 'path' in this.currentPlayerProgress.lastPlayed[this.subject][gradeInternalName]) {
        path = this.currentPlayerProgress.lastPlayed[this.subject][gradeInternalName].path;
      }

      // let path = this.props.player.currentPlayerProgress.lastPlayed[subject].path;
      return mapSequence.lessons.map((lesson, i) => {

        // let lessonProgress = this.getLessonProgress.call(this,path[0],path[1], lesson);
        let lessonProgress = {possible: 0, earned: 0};
        for (var e = 0; e < lesson.exercises.length; e++) {
          let exercise = lesson.exercises[e];
          if ('progress' in exercise) {
            lessonProgress.possible += exercise.progress.possible;
            lessonProgress.earned += exercise.progress.earned;
          }
        }
        let progress = lessonProgress.possible ? lessonProgress.earned / lessonProgress.possible : 0;
        // gets the lesson name if the player has progress
        let lessonPath = path.length >= 3 ? path[2] : null;
        let character = null;

        if (  // todo: gets overwritten immediately by progress because toLesson goes to null, followed by more render()
          ( this.props.toLesson && this.props.toLesson.from.internalName===lesson.internalName ) ||
          ( !this.props.toLesson && (!characterPlaced && (lessonPath === lesson.internalName || lessonPath === null)) )
        ) {
          characterPlaced = lesson;
          this.state.characterX = lesson.mapx;
          this.state.characterY = lesson.mapy;
          let characterImg = prefixCDN('/assets/globalui/maps/characters/' + (player.avatar.internal_name || 'roly') + '.png');
          character = (
            <img ref={c => (this.character = c)} src={prefixCDN(characterImg)} className={`character ${this.state.characterEntered?'entered':''}`} id="map_character" key="map_character"
                   style={{left: parseInt(lesson.mapx), top: parseInt(lesson.mapy)}}/>
          );
          if(!this.props.toLesson && !this.state.characterEntered) {
            this.props.setTimeout(() => {
              this.setState({characterEntered: true});
            }, 500);
          }
        }
        // remove the typing from the title
        let lessonName = lesson.name.replace(/^Typing /, "");

        let bgColor = "123423";
        if('bg' in this.mapSequence){
          bgColor = this.mapSequence.bg.replace('#', '');
        }
        // converting the background into RGBA
        let rgba = {
          'r': parseInt(parseInt(bgColor.substring(0, 2), 16) * .5),
          'g': parseInt(parseInt(bgColor.substring(2, 4), 16) * .5),
          'b': parseInt(parseInt(bgColor.substring(4, 6), 16) * .5),
          'a': .65
        };
        // // showing the chcekmark if the lesson was completed
        let doneImg = "";
        if (progress >= 1) {
          doneImg = (
            <img className="checkmark" src={prefixCDN('/assets/globalui/maps/checkmark.png')} alt="done"/>
          );
        }
        let targetImg = prefixCDN('/assets/globalui/maps/target.png');

        let currentLessonPath = [this.subject, gradeInternalName, lesson.internalName];

        let audio = null;
        if(lesson.audio) {
          if(!(lesson.audio in this.audio)) {
            audio = new Howl({
              src: [prefixCDN('/assets/globalui/audio/sequences/'+lesson.audio+'.ogg'), prefixCDN('/assets/globalui/audio/sequences/'+lesson.audio+'.mp3')],
              volume: 0.5
            });
            this.audio[lesson.audio] = audio;
            this.lessonAudio.push(audio);
          }
        }
        let lessonClass = "";
        if(this.state.clickedLessonId==lesson.internalName) {
          lessonClass = "selected";
        } else if(this.state.clickedLessonId!==null && this.state.clickedPlayerId!=lesson.internalName){
          lessonClass = "not_selected";
        }
        return (
          <div key={'lesson_'+i}>
            <div className={`lesson_container ${lessonClass}`}
                 style={{left: parseInt(lesson.mapx), top: parseInt(lesson.mapy), position: "absolute"}}>
              <img src={prefixCDN(targetImg)} className="target"/>
              <div className='lesson_text'>
                {lessonName}
              </div>
              <div className='progress_holder'
                   style={{background: 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + rgba.a}}>
                <div className='progress_bar' style={{width: progress * 100 + '%'}}/>
              </div>
              {doneImg}
              <div className="clickarea"
                   onClick={this.clickLesson.bind(this, currentLessonPath, {x: lesson.mapx, y: lesson.mapy})}
                   onMouseEnter={this.playAudio.bind(this, lesson.audio)}/>
            </div>
            {character}
          </div>
        );
      });
    }
    else {
      return null;
    }
  }

  renderMap(mapInfo, mapSequence) {
    let bgStyle = mapInfo.back.color;
    if(bgStyle.constructor===Array){
      if(bgStyle.length===0) {
        bgStyle = "#000000";
      } else if(bgStyle.length===1) {
        bgStyle = bgStyle[0];
      } else {
        let dir = "to top";
        let str = "linear-gradient("+dir+", ";
        for(let i=0; i<bgStyle.length; i++){
          if(typeof bgStyle[i]==="object"){
            str += bgStyle[i].c;
            if('p' in bgStyle[i]){
              str += ' '+bgStyle[i].p;
            }
          } else {
            str += bgStyle[i];
          }
          if(i<bgStyle.length-1){
            str += ', ';
          }
        }
        str += ")";
        bgStyle = str;
      }
    }

    let bgItems = [];
    if(mapInfo.back.type==='waves'){
      bgItems.push(<div className="layer-back waves_1a" key="layer-back-1"/>);
      bgItems.push(<div className="layer-back waves_1b" key="layer-back-2"/>);
    }
    else if(mapInfo.back.type==='waves 2') {
      bgItems.push(<div className="layer-back waves_2a" key="layer-back-1"/>);
      bgItems.push(<div className="layer-back waves_2b" key="layer-back-2"/>);
    }
    else if(mapInfo.back.type==='ice') {
      bgItems.push(<div className="layer-back ice" key="layer-back-1"/>);
    }
    return (
      <div className="background" style={{background: bgStyle}}>
        {bgItems}
        <div className="map_content" data-mapsize={mapInfo.mapSize}>
          <img src={prefixCDN('/assets/globalui/maps/'+mapInfo.image)}/>
          <div className="lessons">
            {this.placeLessons(mapSequence)}
          </div>
        </div>
      </div>
    );
  }

  renderLoading() {
    return(
      <section className="course-map">
        <div style={{position:'absolute', top: '300px', left: '0', width:'100%', textAlign: 'center'}}>
          <LoadingTreadmill />
          <div style={{clear: 'both'}}/>
          <h1 style={{color: '#1e8474'}}>Loading Quest
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
    // this.subject = this.subject ? this.subject : this.props.player.path.subject;
    this.subject = this.subject ? this.subject : url.subject;
    if(!this.subject){
      return this.renderLoading();
    }
    if(this.subject!=='typing') {
      this.grade = this.grade ? this.grade : (this.props.player.gradesSelected[this.subject] ? this.props.player.gradesSelected[this.subject].internalName : null);
      if (!this.grade) {
        return this.renderLoading();
      }
    } else {
      this.grade = 'typing';
    }

    if(!this.mapInfo || !this.mapSequence) {

      let playerId = this.props.player.currentPlayerId;
      let currentPlayerProgress = null;
      if (playerId && this.props.player.progress[playerId]) {
        currentPlayerProgress = this.props.player.progress[playerId];
      }

      let playerSequence = currentPlayerProgress.playerSequence[this.subject];

      let mapSequence = {};
      let mapSize = "default";

      let mapInfo = {
        mapSize: "default",
        image: null,
        back: {
          type: null,
          color: ['#000000']
        }
      };

      for (var c = 0; c < playerSequence.courses.length; c++) {

        let course = playerSequence.courses[c];
        if (course.internalName === this.grade) {
          mapSequence = course;
          mapInfo.back.color = [mapSequence.bg];
          mapInfo.image = mapSequence.map;

          if ('mapInfo' in mapSequence) {
            mapInfo = {
              ...mapInfo,
              ...mapSequence.mapInfo,
              back: {
                ...mapInfo.back,
                ...mapSequence.mapInfo.back
              }
            };
          }

          this.mapInfo = mapInfo;
          this.mapSequence = mapSequence;
          break;
        }
      }
    }

    if(!this.mapInfo || !this.mapSequence){
      return this.renderLoading();
    }


    let giftProps = null;

    if (this.props.player.players.noGroups !== undefined) {
      giftProps = {
        currentPlayer: this.props.player.players.noGroups.children[this.props.player.currentPlayerId],
        gift: this.props.player.gift,
        giftLoaded: this.props.player.giftLoaded,
        modalActions: this.props.modalActions
      };
    }

    let gift = giftProps !== null && this.props.player.giftLoaded && this.props.player.gift && this.state.displayGift ? <Gift {...giftProps} /> : null;

    return (
      <section className="course-map">
        {gift}
        {this.renderMap(this.mapInfo, this.mapSequence)}
      </section>
    );
  }

  componentDidMount(){
    this.props.loadingActions.loadingFinished();
    if(this.props.toLesson) {
      this.setState({displayGift: false});
    }
  }

  componentDidUpdate() {
    let self = this;
    if(this.props.toLesson && !this.state.lockButtons){
      this.state.lockButtons = true;
      ((newX, newY, newLesson, locationSearch)=>{
        this.props.setTimeout(() => {
          let el = document.querySelector("#map_character");
          if(!el) return;
          this.audio.click.play();
          el.style.left = newX + 'px';
          el.style.top = newY + 'px';
          el.style.marginTop = '-153px';
          el.style.transform = 'scale(1.5)';
          el.style.transition = "1000ms left ease-in-out, 1000ms top ease-in-out, 500ms transform cubic-bezier(0.550, 0.085, 0.680, 0.530), 500ms margin-top cubic-bezier(0.550, 0.085, 0.680, 0.530)";
          this.props.setTimeout(() => {
            if(!el) return;
            el.style.marginTop = '-83px';
            el.style.transform = 'scale(1)';
            this.props.setTimeout(() => {
              let url = URL.mapToObject();
              let newUrl = locationSearch + '#' + url.subject + ',' + url.grade + ',' + newLesson.internalName;
              self.props.router.push(newUrl);
              self.props.jumpToLesson(null);
              self.props.gameActions.selectGame({ game: newLesson.exercises[0] });
            }, 750);
          }, 500);
        }, 1000);
      })(self.props.toLesson.to.mapx, self.props.toLesson.to.mapy, self.props.toLesson.to, location.search);
    }
  }
}

export default ReactTimeout(Map);
