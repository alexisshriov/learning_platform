import React from 'react';
import API from '../../../helpers/api.js'
import { Howl, Howler } from 'howler';
import 'yuki-createjs/lib/easeljs-0.8.2.combined';
const AVATARS = {
  "roly": {
    "internal_name": "roly",
    "display_name": "Roly",
    "index": 0,
    "id": 1,
    "path": "/themes/sky/i/progress-tracker/Avatars/Roly-Kid.png"
  },
  "tutu": {
    "internal_name": "tutu",
    "display_name": "Tutu",
    "index": 1,
    "id": 2,
    "path": "/themes/sky/i/progress-tracker/Avatars/TuTu-Kid.png"
  },
  "penelope": {
    "internal_name": "penelope",
    "display_name": "Penelope",
    "index": 2,
    "id": 3,
    "path": "/themes/sky/i/progress-tracker/Avatars/Penelope-Kid.png"
  },
  "cuzcuz": {
    "internal_name": "cuzcuz",
    "display_name": "Cuz-Cuz",
    "index": 3,
    "id": 4,
    "path": "/themes/sky/i/progress-tracker/Avatars/CuzCuz-Kid.png"
  },
  "muggo": {
    "internal_name": "muggo",
    "display_name": "Muggo",
    "index": 4,
    "id": "5",
    "path": "/themes/sky/i/progress-tracker/Avatars/Muggo-Kid.png"
  },
  "icecream": {
    "internal_name": "icecream",
    "display_name": "Officer Ice Cream",
    "index": 5,
    "id": 6,
    "path": "/themes/sky/i/progress-tracker/Avatars/OfficerIceCream-Kid.png"
  },
  "floyd": {
    "internal_name": "floyd",
    "display_name": "Floyd",
    "index": 6,
    "id": 7,
    "path": "/themes/sky/i/progress-tracker/Avatars/Foyd-Kid.png"
  },
  "birdy": {
    "internal_name": "birdy",
    "display_name": "Birdee",
    "index": 7,
    "id": 8,
    "path": "/themes/sky/i/progress-tracker/Avatars/Birdee-Kid.png"
  }
};
class ChooseAvatarModal extends React.Component {

  constructor(props) {
    super(props);
    this.progress = 0;
    this.clickAvatar = this.clickAvatar.bind(this);
    this.clickDone = this.clickDone.bind(this);
    this.tick = createjs.Ticker;
    this.moveAngle = 0;
    // this.moveIndex = 0;
    let playerId = this.props.player.currentPlayerId;
    let player = this.props.player.players.noGroups.children[playerId];
    let avatarKey = player.avatar.internal_name;
    this.currentSelectedAvatar = avatarKey;
    this.moveIndex = Object.keys(AVATARS).length - AVATARS[avatarKey].index;
    for (var key in AVATARS) {
      AVATARS[key].index = this.numberLoopAround(0, Object.keys(AVATARS).length, AVATARS[key].index, this.moveIndex);

    }
    this.moveIndex = 0;
    this.tick.addEventListener("tick", this.handleTick.bind(this));
    this.tick.framerate = 30;
    this.populateAvatars = this.populateAvatars.bind(this);
    this.audio = {};
    this.audio.click = new Howl({src: [prefixCDN('/assets/kidframe/audio/pop.ogg'), prefixCDN('/assets/kidframe/audio/pop.mp3')]});
    this.audio.done = new Howl({src: [prefixCDN('/assets/kidframe/audio/quest_start.ogg'), prefixCDN('/assets/kidframe/audio/quest_start.mp3')]});

    this.state = {
      avatarUrl:'/assets/globalui/avatars/'+avatarKey+'.png',
      avatarName: AVATARS[avatarKey].display_name
    }
  }
  componentWillMount(){

  }
  populateAvatars(){

    return Object.keys(AVATARS).map((key, index)=>{
      let avatar = AVATARS[key];
      let calculatedPostion = this.caculateAvatarPositions(avatar, 0);
      return (
        <div key={key} id={"avatar-select-wheel-"+key} style={{position: "absolute", left: (calculatedPostion.x-(calculatedPostion.size/2)), top:(calculatedPostion.y-(calculatedPostion.size/2)), background:"url("+avatar.path+")",
          backgroundSize: "cover", backgroundRepeat:  "no-repeat", backgroundPosition: "center center", height:calculatedPostion.size,
          borderRadius:100, width:calculatedPostion.size}}
             onClick={this.clickAvatar.bind(this, key)}
        >
        </div>
      )
    });
  }
  caculateAvatarPositions(avatar, moveAmount){
    const RY = 150;
    const RX = 200;
    const ANGLE = 360 / Object.keys(AVATARS).length;
    const MAX_SIZE = 110;
    const MIN_SIZE = 75;

    let i = avatar.index;
    let dDeg = ((ANGLE * i)+90+moveAmount);
    let dRad = dDeg * (Math.PI / 180);
    if(dRad > 360) dRad = dRad - 360;
    let x = ((RX * Math.cos(dRad))+RX);
    let y = ((RY * Math.sin(dRad))+RY);
    let range = Math.sin(dRad);
    let size = MIN_SIZE + ((1 + range)/2) * (MAX_SIZE - MIN_SIZE);

    return {
      x: x,
      y: y,
      size: size,
    }
  }
  handleTick(event) {
    let complete = false;
    const TIME  = 500;
    this.progress += event.delta;
    let precent = this.progress/TIME;
    precent = precent<.5 ? 4*precent*precent*precent : (precent-1)*(2*precent-2)*(2*precent-2)+1;

    if(this.progress >= TIME) {
      precent = 1;
      this.tick.removeAllEventListeners();
      complete = true;
      this.progress = 0;
    }
    let moveAmount = this.moveAngle * precent;

    Object.keys(AVATARS).map((key, index)=>{
      let avatar = AVATARS[key];
      let calculatedPostion = this.caculateAvatarPositions(avatar, moveAmount);
      let domAvatar = document.querySelector("#avatar-select-wheel-"+key);
      if(domAvatar && domAvatar.style) {
        domAvatar.style.left = (calculatedPostion.x - (calculatedPostion.size / 2)) + "px";
        domAvatar.style.top = (calculatedPostion.y - (calculatedPostion.size / 2)) + "px";
        domAvatar.style.width = calculatedPostion.size + "px";
        domAvatar.style.height = calculatedPostion.size + "px";
        if (complete) {
          AVATARS[key].index = this.numberLoopAround(0, Object.keys(AVATARS).length, avatar.index, this.moveIndex);
          domAvatar.classList.remove("selected");
          if (AVATARS[key].index === 0) {
            domAvatar.classList.add("selected");
          }
        }
      }
    });
    if(precent === 1) {
      this.finishedTween = true;
    }
  }
  numberLoopAround(min, max, number, amount){
    number = amount + number;
    if(number >= max) number -= max;
    if(number < min) number += max;
    return number;
  }
  clickAvatar(key){
    if(this.finishedTween) {
      this.audio.click.play();
      this.finishedTween = false;
      this.currentSelectedAvatar = key;
      this.moveAngle = 360-(AVATARS[key].index * (360 / Object.keys(AVATARS).length));
      if(this.moveAngle > 180) {
        this.moveAngle -= 360;
      }
      this.setState({avatarUrl:'/assets/globalui/avatars/'+key+".png",avatarName: AVATARS[key].display_name});
      this.moveIndex =  Object.keys(AVATARS).length - AVATARS[key].index;
      this.tick.addEventListener("tick", this.handleTick.bind(this));
      this.tick.framerate = 30;
    }

  }
  clickDone(){
    this.props.exitModal('chooseavatar');
    this.audio.done.play();
    API.updateChild({id:this.props.player.currentPlayerId, avatar: AVATARS[this.currentSelectedAvatar].internal_name});
    this.props.playerActions.setAvatar({id:this.props.player.currentPlayerId, avatar:{...AVATARS[this.currentSelectedAvatar]}});
  }
  render() {
    let avatars = this.populateAvatars();
    return (
      <div  className="choose_avatar modal_container">
        <div className="title">Choose Character</div>
        <div className="avatar-name-container ">
          <div className="avatar-name">{this.state.avatarName}</div>
        </div>
        <div className="lg-avatar" style={{backgroundImage: "url("+this.state.avatarUrl + ")"}} />
        <div className="avatars">
          {avatars}
        </div>
        <div onClick={this.clickDone} className="done-btn">Done</div>
      </div>
    );
  }
};

export default ChooseAvatarModal;
