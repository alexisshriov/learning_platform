import React from 'react';
import {Howl} from "howler";
import ReactTimeout from "react-timeout";

class ExitGameModal extends React.Component {
  constructor(props) {
    super(props);

    this.contentType = "game";
    if(this.props.game.currentGame){
      let gameObj = this.props.game.currentGame;
      this.contentType = this.getContentType(gameObj);
    }

    this.audio = {};
    this.audio.woowoowooo = new Howl({src: [prefixCDN('/assets/kidframe/audio/woowoowooo.ogg'), prefixCDN('/assets/kidframe/audio/woowoowooo.mp3')]});
    this.audio.leave_challenge = new Howl({src: [prefixCDN('/assets/globalui/audio/are_you_sure_you_want_to_leave_this_challenge.ogg'), prefixCDN('/assets/globalui/audio/are_you_sure_you_want_to_leave_this_challenge.mp3')]});
    this.audio.click = new Howl({src: [prefixCDN('/assets/kidframe/audio/select_general.ogg'), prefixCDN('/assets/kidframe/audio/select_general.mp3')]});
    this.audio.close = new Howl({src: [prefixCDN('/assets/kidframe/audio/cancel.ogg'), prefixCDN('/assets/kidframe/audio/cancel.mp3')]});

    this.getContentType = this.getContentType.bind(this);
    this.goToPage = this.goToPage.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }
  
  getContentType(gameObj) {
    let ret = "game";
    if(gameObj.type==='skill-builders') {
      ret = 'exercise';
    } else if(gameObj.type==='worksheet') {
      ret = 'worksheet';
    } else if(gameObj.template==='video') {
      ret = 'song';
    } else if(gameObj.template==='story' || gameObj.template==='bookbuilder') {
      ret = 'story';
    }
    return ret;
  }

  goToPage() {
    this.audio.click.play();
    let route = this.props.exitGame.route;
    if (route) {
      this.props.router.push(this.props.exitGame.route);
      // this.props.router.goBack();
    }

    let game = this.props.exitGame.game;
    if (game) {
      this.props.gameActions.setGame({
        game: {...game}
      });
      this.props.setTimeout(()=> {
        this.props.gameActions.autostartGame(true);
      }, 200);
    }

    this.props.exitModal('exitgame');
  }

  closeModal() {
    this.audio.close.play();
    this.props.exitModal('exitgame');
  }


  render() {
    let yesText = "Yes, leave "+this.contentType;
    return (
      <div className="exitgame_modal_container">
        <div className="modal_img"/>
        <div className="content">Are you sure you want to leave this {this.contentType}?</div>
        <div className="modal_btn btn_no" onClick={this.closeModal.bind(this)}>No, stay here</div>
        <div className="modal_btn btn_yes" onClick={this.goToPage}>{yesText}</div>
      </div>
    );
  }

  componentDidMount() {
    this.audio.woowoowooo.play();
    this.props.setTimeout(()=>{
      this.audio.leave_challenge.play();
    }, 800);
  }

  componentWillUnmount() {
    for(var key in this.audio){
      if(key!=='close' && key!=='click') {
        this.audio[key].stop();
      }
    }
  }
}

export default ReactTimeout(ExitGameModal);
