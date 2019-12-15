import React from 'react';
import ReactTimeout from 'react-timeout';
import 'yuki-createjs/lib/easeljs-0.8.2.combined';
import { Howl, Howler } from 'howler';

class RolyHint extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clickState: false
    };
    this.rolyHintInstance = null;
    this.audio = {};
    this.audio.idea = new Howl({src: [prefixCDN('/assets/kidframe/audio/idea.ogg'), prefixCDN('/assets/kidframe/audio/idea.mp3')]});

    this.clickHint = ()=>{
      if(this.props.clickHint && !this.state.clickState) {
        this.setState({clickState: true});
        this.props.clickHint();

        if(this.rolyHintInstance.currentAnimation!=='suggestHint') {
          this.rolyHintInstance.gotoAndPlay('idleToGiveHint'); // give hint from suggestion state
        } else {
          this.rolyHintInstance.gotoAndPlay('giveHint'); // give hint from idle state
        }
        var listener = this.rolyHintInstance.on('animationend', (evt)=>{
          if(evt.name==="backToIdle") {
            this.rolyHintInstance.off("animationend", listener);
            this.props.setTimeout(()=> {
              this.setState({clickState: false});
            }, 600);
          }
        });
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.suggestingHintState && !this.props.suggestingHintState){
      this.audio.idea.play();
      this.rolyHintInstance.gotoAndPlay('suggestHint');
      this.props.setSuggestingHintState(false);
    }
  }

  render() {
    return (
      <div className={`hint_button HUD-btn
        ${this.state.clickState ? 'click' : ''}
        ${this.props.hintState ? '' : 'disabled'}
      `} key="hint_button" onClick={this.clickHint}>
        <canvas id="roly_hint" width="500" height="500" />
        <div className="clickBox" />
      </div>
    )
  }

  componentDidMount() {
    let frames = [
      [291, 1382, 291, 317, 0, -56, -49],
      [1746, 1382, 291, 317, 0, -56, -49],
      [1455, 1382, 291, 317, 0, -56, -49],
      [1164, 1382, 291, 317, 0, -56, -49],
      [873, 1382, 291, 317, 0, -56, -49],
      [582, 1382, 291, 317, 0, -56, -49],
      [0, 1382, 291, 317, 0, -56, -49],
      [0, 1699, 291, 305, 0, -56, -61],
      [1282, 1063, 295, 318, 0, -56, -48],
      [330, 1063, 309, 319, 0, -56, -47],
      [639, 1063, 346, 319, 0, -56, -47],
      [1567, 711, 372, 334, 0, -56, -32],
      [1179, 711, 388, 347, 0, -56, -19],
      [1572, 359, 393, 352, 0, -56, -14],
      [793, 0, 393, 352, 0, -56, -14],
      [786, 711, 393, 352, 0, -56, -14],
      [0, 711, 393, 352, 0, -56, -14],
      [393, 711, 393, 352, 0, -56, -14],
      [0, 0, 398, 359, 0, -56, -7],
      [398, 0, 395, 356, 0, -56, -10],
      [1179, 359, 393, 352, 0, -56, -14],
      [786, 359, 393, 352, 0, -56, -14],
      [393, 359, 393, 352, 0, -56, -14],
      [0, 359, 393, 352, 0, -56, -14],
      [1579, 0, 393, 352, 0, -56, -14],
      [1186, 0, 393, 352, 0, -56, -14],
      [0, 1063, 330, 319, 0, -56, -47],
      [985, 1063, 297, 319, 0, -56, -47],
      [1577, 1063, 292, 318, 0, -56, -48]
    ];
    var rolyHintStage = new createjs.Stage("roly_hint");
    var rolyHintSS = new createjs.SpriteSheet({
      frames: frames,
      images: [prefixCDN("/assets/kidframe/animation/RolyHint.png")],
      animations: {
        suggestHint: {
          frames: [5, 6, 7, 7, 8, 8, 9, 10, 11, 12, 13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13], speed: 1, next: "backToIdle"
        },
        idleToGiveHint: {
          frames: [5, 6, 7, 7, 8, 8, 9, 10, 11, 12, 13], speed: 1, next: "giveHint"
        },
        giveHint: {
          frames: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 24], speed: 1, next: "backToIdle"
        },
        backToIdle: {
          frames: [25, 26, 27, 28, 0], speed: 1, next: "idle"
        },
        idle: {
          frames: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0], speed: .5
        },
      }
    });
    this.rolyHintInstance = new createjs.Sprite(rolyHintSS);
    this.rolyHintInstance.gotoAndPlay('idle');

    rolyHintStage.addChild(this.rolyHintInstance);

    createjs.Ticker.on('tick', (event)=>{
      rolyHintStage.update(event);
    });
  }

}

export default ReactTimeout(RolyHint);