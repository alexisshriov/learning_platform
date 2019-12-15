import React, { Fragment } from 'react';
import ReactTimeout from 'react-timeout';
import clickdrag from 'react-clickdrag';
import { Howl, Howler } from 'howler';

import RolyHint from './rolyHint';

class Controls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toggleVolume: false,
      paused: false,
    }

    this.audio = {};
    this.audio.pause = new Howl({src: [prefixCDN('/assets/kidframe/audio/pause.ogg'), prefixCDN('/assets/kidframe/audio/pause.mp3')]});
    this.audio.vol = new Howl({src: [prefixCDN('/assets/kidframe/audio/select_general.ogg'), prefixCDN('/assets/kidframe/audio/select_general.mp3')]});
    this.audio.pop = new Howl({src: [prefixCDN('/assets/kidframe/audio/pop.ogg'), prefixCDN('/assets/kidframe/audio/pop.mp3')]});

    this.clickPause = this.clickPause.bind(this);
    this.clickResume = this.clickResume.bind(this);
    this.clickHint = this.clickHint.bind(this);
    this.clickToggleVolume = this.clickToggleVolume.bind(this);

    this.clickPauseListener = this.clickPauseListener.bind(this);
    this.clickPlayListener = this.clickPlayListener.bind(this);

    this.VolumeSliderInstance = clickdrag(VolumeSlider, {touch: true});

    document.addEventListener('clickClose', this.clickPauseListener);
    document.addEventListener('clickPlay', this.clickPlayListener);
  }

  clickPauseListener(e) {
    this.clickPause(true);
  }
  clickPlayListener(e) {
    this.clickResume();
  }

  clickPause(forcePause = false) {
    if(this.props.exercise && this.props.exercise.global_timer && 'pause' in this.props.exercise.global_timer && 'resume' in this.props.exercise.global_timer) {
      if (this.state.paused === false || forcePause) {
        this.props.exercise.global_timer.pause();
        this.props.pauseGame();
        this.setState({paused: true});
        this.audio.pause.play();
        if(window.kidframe && window.kidframe.clickedPause) {
          window.kidframe.clickedPause();
        }
      } else {
        this.props.exercise.global_timer.resume();
        this.props.resumeGame();
        this.setState({paused: false});
        if(window.kidframe && window.kidframe.clickedPlay) {
          window.kidframe.clickedPlay();
        }
      }
    }
  }

  clickResume() {
    if(this.props.exercise && this.props.exercise.global_timer && 'resume' in this.props.exercise.global_timer) {
      this.props.exercise.global_timer.resume();
      this.props.resumeGame();
      this.setState({paused: false});
      if (window.kidframe && window.kidframe.clickedPlay) {
        window.kidframe.clickedPlay();
      }
    }
  }

  clickHint() {
    if(this.props.current_exercise && this.props.current_exercise.repeatQuestion && typeof this.props.current_exercise.repeatQuestion === 'function') {
      this.props.current_exercise.repeatQuestion();
      // this.setState(prevState => ({
      //   hint: {
      //     ...prevState.hint,
      //     click: true
      //   }
      // }));
      // this.props.setTimeout(()=>{
      //   this.setState(prevState => ({
      //     hint: {
      //       ...prevState.hint,
      //       click: false
      //     }
      //   }));
      // },250);
    } else {
      // learnosity:
      if(this.props.exercise && 'learnosity' in this.props.exercise && 'toggleHintDisplay' in this.props.exercise.learnosity) {
        this.props.exercise.learnosity.toggleHintDisplay();
      }
    }
  }

  clickToggleVolume() {
    this.audio.pop.play();
    this.setState({toggleVolume: !this.state.toggleVolume});
  }

  render() {
    const pauseButton = (
      <div className={`pauseOverlay ${this.props.paused ? '' : 'hidden'}`}>
        <div className="paused_button" key="paused_button" onClick={this.clickResume}><i className="paused"/></div>
      </div>
    );

    // let hintButton = null;
    // let hintButtonProps = {};
    // if(this.props.hintState!==null){
      let hintButtonProps = {
        hintState: this.props.hintState,
        suggestingHintState: this.props.suggestingHintState,
        setSuggestingHintState: this.props.setSuggestingHintState,
        clickHint: this.clickHint
      };
      let hintButton = (<RolyHint {...hintButtonProps} />);
    // }

    let volumeProps = {
      exercise: this.props.exercise,
      volumeActive: this.state.toggleVolume,
      audio: this.audio,
      clickToggleVolume: this.clickToggleVolume
    };

    let volumeSliderInstance = null;
    if(this.VolumeSliderInstance && volumeProps){
      volumeSliderInstance = (<this.VolumeSliderInstance {...volumeProps} />);
    }

    return (
      <div className="gameControls">
        <div className="HUD left">
          <div className="pause HUD-btn" onClick={this.clickPause}>
            <i className="pause" />
          </div>
          {/*<div className="fullScreen HUD-btn" onClick={this.clickFullScreen}>*/}
            {/*<i className="icon-resize-full-alt"/>*/}
          {/*</div>*/}
        </div>
        <div className="HUD volume">
          {volumeSliderInstance}
        </div>
        {hintButton}
        {pauseButton}
      </div>
    );
  }

  componentDidUpdate() {
    if(this.props.paused !== this.state.paused){
      this.setState({paused: this.props.paused});
    }
  }
};


class VolumeSlider extends React.Component {
  constructor(props) {
    super(props);

    let vol = parseFloat(Howler.volume());
    this.state = {
      lastPositionY: (1-vol)*135,
      currentY: (1-vol)*135,
      percent: vol
    };

    this.setPercent = this.setPercent.bind(this);
    this.clickSlider = this.clickSlider.bind(this);

    // this.setPercent(.5);
  }

  setPercent(percent) {
    percent = Math.max( Math.min(percent, 1), 0 );
    this.setState({
      lastPositionY: (1-percent)*135,
      currentY: (1-percent)*135,
      percent: percent
    });
  }

  clickSlider(e) {
    let frameEl = document.querySelector('#kidframe');
    let scale = frameEl.getBoundingClientRect().width / frameEl.offsetWidth || 1;
    let rect = e.target.getBoundingClientRect();
    let y = (e.clientY-rect.top)/scale - 5 - 20;
    let percent = Math.max( Math.min((1-y/135), 1), 0 )
    this.setPercent(percent);
    Howler.volume(percent);
    window.audio_volume = percent;
    if(this.props.exercise && ('EduAudio' in this.props.exercise)){
      this.props.exercise.EduAudio.setVolume(percent);
    }
    this.props.audio.vol.play();
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.dataDrag.isMoving) {
      let frameEl = document.querySelector('#kidframe');
      let scale = frameEl.getBoundingClientRect().width / frameEl.offsetWidth || 1;
      let newY = this.state.lastPositionY + nextProps.dataDrag.moveDeltaY / scale;
      newY = Math.max( Math.min(newY,135), 0 );
      this.setState({
        currentY: newY,
        percent: Math.max( Math.min(1-newY/135, 1), 0 )
      });
    } else {
      this.setState({lastPositionY: this.state.currentY});
      Howler.volume(this.state.percent);
      window.audio_volume = this.state.percent;
      try {
        if (this.props.exercise && this.props.exercise.constructor && ('EduAudio' in this.props.exercise) && ('setVolume' in this.props.exercise.EduAudio)) {
          this.props.exercise.EduAudio.setVolume(this.state.percent);
        }
      } catch(e) {
        console.log('can\'t set audio volume', e);
      }
      if(this.state.lastPositionY!==this.state.currentY) {
        this.props.audio.vol.play();
      }
    }
  }

  render() {
    let translation = 'translateY('+this.state.currentY+'px)';
    let volSnap = Math.min( Math.max( Math.floor(this.state.percent*2.8+.8), 0), 3);
    return (
      <Fragment>
        <div className={`volumeControl ${this.props.volumeActive?'active':'inactive'}`}>
          <div className="volumeDragHandle" style={{transform: translation}} />
          <div className="volume">
            <div className="sliderContainer" onClick={(e)=>this.clickSlider(e.nativeEvent)}>
              <div className="slider">
                <div className="inner" style={{height: 'calc('+this.state.percent*100+'% - 24px)'}}/>
              </div>
            </div>
            <div className="knob" style={{bottom: this.state.percent*135+'px'}}>
            </div>
          </div>
        </div>
        <div className={`volumeToggle ${this.props.volumeActive?'active':'inactive'}`} onClick={this.props.clickToggleVolume}>
          <div className="back"/>
          <div className="icon" style={{backgroundPosition: (-32*volSnap)+'px 0px'}}/>
        </div>
      </Fragment>
    );
  }

  componentWillUnmount() {
    document.removeEventListener('clickClose', this.clickPauseListener);
    document.removeEventListener('clickPlay', this.clickPlayListener);
  }
}

export default ReactTimeout(Controls);
