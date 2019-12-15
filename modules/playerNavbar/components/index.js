import React, { Fragment } from 'react';
import ReactTimeout from 'react-timeout';
import Players from '../../../services/player';
import BackButton from '../../../widgets/backButton';
import * as URL from '../../../helpers/url';

import { Howl, Howler } from 'howler';

const BADGE_MODAL = 'badgeModal';
const CHOOSE_AVATAR_MODAL = 'avatarModal';
const LOGOUT_MODAL = 'logOutModal';

class PlayerNavbar extends React.Component {
  constructor(props) {
    super(props);

    this.audio = {};
    this.audio.click = new Howl({src: [prefixCDN('/assets/kidframe/audio/select_general.ogg'), prefixCDN('/assets/kidframe/audio/select_general.mp3')]});
    this.audio.pop = new Howl({src: [prefixCDN('/assets/kidframe/audio/pop.ogg'), prefixCDN('/assets/kidframe/audio/pop.mp3')]});

    this.clickBack = this.clickBack.bind(this);
    this.clickMenu = this.clickMenu.bind(this);
    this.clickMenuItem = this.clickMenuItem.bind(this);
    // this.hoverMenuDropdown = this.hoverMenuDropdown.bind(this);
  }

  clickBack(gotoURL) {
    let url = URL.mapToObject();
    if (url.screen === 'game') {
      // might need to check on pause instead of game
      this.props.modalActions.showExitGameModal(
        { route: location.search+gotoURL }
      );
    } else {
      this.props.router.push(location.search+gotoURL);
    }
  }

  clickMenu() {
    if(this.props.menuActive) {
      this.audio.pop.play();
      this.props.setMenuActive(false);
    } else {
      this.audio.pop.play();
      this.props.setMenuActive(true);
    }
  }

  clickMenuItem(action) {
    this.audio.click.play();
    this.props.setMenuActive(false);
    if('modal' in action) {
        this.openModal(action.modal);
    }
    else if('url' in action && action.url){
      this.props.router.push(location.search+action.url);
    }
  }

  openModal(modalType) {
    switch(modalType) {
      case BADGE_MODAL:
        if (this.props.player.currentPlayerSet) {
          this.props.setMenuActive(false);
          this.audio.click.play();
          this.props.modalActions.showBadgesModal();
          return true;
        }
        break;
      case CHOOSE_AVATAR_MODAL:
          if (this.props.player.currentPlayerSet) {
            this.props.setMenuActive(false);
            this.audio.click.play();
            this.props.modalActions.showChooseAvatarModal();
            return true;
          }
          break;
      case LOGOUT_MODAL:
        if(this.props.player.currentPlayerSet) {
          this.props.setMenuActive(false);
          this.audio.click.play();
          this.props.modalActions.showLogOutModal();
          return true;
        }
        break;
      }
    return false;
  }

  render() {
    if(this.props.player.currentPlayerId===null){
      return null;
    }
    let url = URL.mapToObject();
    let playerId = this.props.player.currentPlayerId;
    let player = this.props.player.players.noGroups.children[playerId];
    let currentPlayerProgress = null;
    if(playerId && this.props.player.progress[playerId]){
      currentPlayerProgress = this.props.player.progress[playerId];
    }
    var backVisible = true;

    var defaultMenu = [
      { text: "Choose a Player", action: { url: "#choosePlayer" } },
      { text: "My Awards & Points", action: { modal: BADGE_MODAL } }
    ];
    if(playerId != -1){
      defaultMenu.push({ text: "Choose Character", action: { modal: CHOOSE_AVATAR_MODAL} });
    }
    if(url.screen==='chooseQuest' && this.props.user.userType==='studentCode'){
      backVisible = false;
    }
    if(this.props.user.userType==='studentCode'){
      defaultMenu = [
        { text: "Log Out", action: { modal: LOGOUT_MODAL} },
        { text: "Choose Character", action: { modal: CHOOSE_AVATAR_MODAL} }
      ];
    }

    var navbarProps = {
      player: {
        ...player
      },
      progress: {
        ...currentPlayerProgress
      },
      menu: {
        contents: defaultMenu
      }
    };

    let showBackbutton = true;
    let showPlayerMenu = true;
    if(url.singlePlay) {
      showBackbutton = false;
    }
    if(this.props.game.detailPageOnboardingView){
      showPlayerMenu = false;
    }

    // default:  back = #choosePlayer
    let backButtonText = "Back to Players";
    let backButtonURL = "#choosePlayer";
    let backButtonClass = 'no_background';


    if(!url.singlePlay) {
      if (url.screen === 'assignments' || url.screen === 'map' || url.screen === 'lesson' || url.screen === 'challenge' || url.screen === 'assignment' || url.screen === 'game') {
        backButtonText = "Back to Quests";
        backButtonURL = "#chooseQuest";
        navbarProps.menu.contents.push({
          text: "Choose a Quest", action: {url: "#chooseQuest"}
        });
        if (url.screen === 'lesson' || url.screen === 'assignment' || url.screen === 'game') {
          if (url.screen === 'lesson' || (url.screen === 'game' && !url.assignment)) {
            backButtonText = "Back to Map";
            backButtonURL = '#' + url.subject + ',' + url.grade;
          } else if (url.screen === 'assignment' || (url.screen === 'game' && url.assignment)) {
            backButtonText = "Back to Assignments";
            backButtonURL = '#assignments';
          }
          backButtonClass = 'dark_background';
          navbarProps.menu.contents.push({
            text: "Course Map", action: {url: '#' + url.subject + ',' + url.grade}
          });
        }
        if (url.screen === 'challenge') {
          backButtonClass = 'dark_background';
        }
      }
    } else {
      backButtonText = "Choose a Quest";
      backButtonURL = "#chooseQuest";
      backButtonClass = 'dark_background';
      navbarProps.menu.contents.push({
        text: "Choose a Quest", action: {url: "#chooseQuest"}
      });

      let grade = url.grade || "";
      grade = grade.replace('math-','').replace('ela-','');
      if(['math', 'ela'].includes(url.subject) && ['preschool', 'kindergarten', 'first', 'second', 'third', 'fourth', 'fifth'].includes(grade)) {
        backButtonText = "To Quest Map";
        backButtonURL = '#' + url.subject + ',' + url.grade;
        navbarProps.menu.contents.push({
          text: "Course Map", action: {url: '#' + url.subject + ',' + url.grade}
        });
      } else if(url.subject==='typing') {
        backButtonText = "To Quest Map";
        backButtonURL = '#typing,typing';
        navbarProps.menu.contents.push({
          text: "Course Map", action: {url: '#typing,typing'}
        });
      }
    }

    var backButtonProps = {
      text: backButtonText,
      visible: backVisible,
      className: backButtonClass,
      destroyOnClick: false,
      clickTime: 400,
      refreshTime: 900,
      click: this.clickBack.bind(this, backButtonURL)
    };

    let playerMenu =``;
    if('player' in navbarProps && 'avatar' in navbarProps.player) {
      let dropdownIcon = (<Fragment><i className="icon-blank"/></Fragment>);
      if(navbarProps.menu.contents.length){
        dropdownIcon = (<Fragment>{this.props.menuActive ? <i className="icon-up-open-1"/> : <i className="icon-down-open-1"/>}</Fragment>);
      }
      playerMenu = (
        <div>
          <div className="playerMenu" onClick={this.clickMenu.bind(this)}>
            <div className={`icon ${navbarProps.player.avatar.internal_name}`} />
            <div className="playerName">
              <div className="name">{navbarProps.player.PlayerName}</div>
              {dropdownIcon}
            </div>
          </div>
          {/*<div className={`playerMenuDropdown ${navbarProps.menu.active ? '' : 'hidden'}`} onMouseOver={this.hoverMenuDropdown.bind(this, true)} onMouseOut={this.hoverMenuDropdown.bind(this, false)}>*/}
          <div className={`playerMenuDropdown ${this.props.menuActive ? '' : 'hidden'}`}>
            { navbarProps.menu.contents.map(function(o, i){
              return (<div onClick={this.clickMenuItem.bind(this, o.action)} className="item" key={`menu_item_`+i}>{o.text}</div>)
            }, this) }
          </div>
        </div>
      );
    }

    let navbarClass = '';
    if(url.screen==='assignments') {
      navbarClass = 'assignments';
    }
    if(url.screen==='lesson' || url.screen==='assignment' || url.screen==='game') {
      navbarClass = 'lesson';
    }
    if(url.screen==='challenge') {
      navbarClass = 'challenge';
    }
    if((url.screen==='game' || url.screen==='challenge') && (this.props.game.gameLoadState==='willLoadTemplate' || this.props.game.gameLoadState==='playing')){
      navbarClass = 'game';
      if(this.props.game.paused){
        navbarClass += ' paused';
      }
    }

    let usertypeClass = '';
    let guestMessage = null;
    if(this.props.player.currentPlayerId==-1){
      usertypeClass = 'guest';
      guestMessage = (
        <div className="guestMessage">Guests do not accrue progress or points</div>
      );
    }

    return (
      <div className={`playerNavbar ${navbarClass} ${usertypeClass} ${this.props.game.detailPageOnboardingView ? 'detailPageOnboardingView' : ''}`}>
        <div className="backElements">
          <div className="barBack">
            <div className="statsBack"/>
          </div>
        </div>
        {showBackbutton && <BackButton {...backButtonProps} />}
        <div className="stats">
          <div className="left" onClick={this.openModal.bind(this, BADGE_MODAL)}>
            <div className="icon awards"><i /></div>
            <div className="statbox">
              <div className="stat awards">{navbarProps.progress.badgesCount}</div>
              <div className="label">Awards</div>
            </div>
          </div>
          <div className="right" onClick={this.openModal.bind(this, BADGE_MODAL)}>
            <div className="icon points"><i /></div>
            <div className="statbox">
              <div className="stat points">{navbarProps.progress.pointsCount}</div>
              <div className="label">Points</div>
            </div>
          </div>
          {guestMessage}
        </div>
        {showPlayerMenu && playerMenu}
      </div>
    );
  }
}

export default ReactTimeout(PlayerNavbar);
