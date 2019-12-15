import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';

import ModalError from './errorModal';
import EndGameModal from './endGameModal';
import ExitGameModal from './exitGameModal';
import BadgesModal from './badgesModal';
import ChooseAvatarModal from './chooseAvatarModal';
import LogOutModal from './logOutModal';
import GeneralModal from './generalModal';
import BlankModal from './blankModal';

import { Howl, Howler } from 'howler';

class ModalComponent extends React.Component {
  constructor(props) {
    super(props);

    this.audio = {};
    this.audio.close = new Howl({src: [prefixCDN('/assets/kidframe/audio/cancel.ogg'), prefixCDN('/assets/kidframe/audio/cancel.mp3')]});

    this.closeModal = this.closeModal.bind(this);
  }

  closeModal(modalName, playSound=false) {
    if(playSound){
      this.audio.close.play();
    }
    this.props.exitModal(modalName);
  }

  render() {
    const modalsToRender = [];

    let badgesProps = {
      player: {...this.props.player},
      badges: {...this.props.badges},
      nextPage: this.props.badgeNextPage,
      previousPage: this.props.badgePreviousPage,
      toPage: this.props.badgeToPage,
      resetPage: this.props.badgeResetPage
    };

    let logOutProps = {
      exitModal: this.props.exitModal,
      user: {...this.props.user},
    };

    let exitGameProps = {
      exitGame: {...this.props.exitgame},
      exitModal: this.props.exitModal,
      router: this.props.router,
      game: this.props.game,
      gameActions: this.props.gameActions
    };

    let endGameProps = {
      data: {...this.props.endgame.data},
      user: {...this.props.user},
      player: {...this.props.player},
      playerActions: {...this.props.playerActions},
      game: {...this.props.game},
      gameActions: {...this.props.gameActions},
      mapActions: {...this.props.mapActions},
      exitModal: this.props.exitModal,
      router: this.props.router
    };

    let chooseAvatarProps = {
      player: {...this.props.player},
      playerActions: {...this.props.playerActions},
      router: this.props.router,
      exitModal: this.props.exitModal
    };

    let generalModalProps = {
      data: {...this.props.general.data},
      exitModal: this.props.exitModal
    };

    let blankModalProps = {
      className: this.props.blank.className
    };

    var badges = this.props.badges.visible ? (<BadgesModal {...badgesProps} />) : '';
    var endgame = this.props.endgame.visible ? (<EndGameModal {...endGameProps} />) : '';
    var exitgame = this.props.exitgame.visible ? (<ExitGameModal {...exitGameProps} />) : '';
    var logout = this.props.logOut.visible ? (<LogOutModal {...logOutProps} />) : '';
    var error = this.props.error.visible ? (<ModalError {...this.props.error} />) : '';
    var general = this.props.general.visible ? (<GeneralModal {...generalModalProps} />) : '';
    var blank = this.props.blank.visible && this.props.blank.children ? (<BlankModal {...blankModalProps}>{this.props.blank.children}</BlankModal>) : '';
    var chooseavatar = this.props.chooseAvatar.visible ? (<ChooseAvatarModal {...chooseAvatarProps} />) : '';

    // These modals are ordered by priority (z-index)
    let modals = [badges, chooseavatar, endgame, exitgame, logout, general, blank, error];
    let modalKeys = ['badges', 'chooseavatar', 'endgame', 'exitgame', 'logout', 'general', 'blank', 'error'];

    for (var i = 0; i < modals.length; i++) {
      if ( modals[i] ) {
        modalsToRender.push(
          <div className={`${modalKeys[i]}-modal container `} key={modalKeys[i]}>
            <div className={'modal_overlay'} onClick={ modalKeys[i]==='chooseavatar' || modalKeys[i]==='badges' || modalKeys[i]==='exitgame' || modalKeys[i]==='logout' ? this.closeModal.bind(this, modalKeys[i], true) : ()=>{} } />
            { modalKeys[i]!=='blank' ?
              (<div className={'dialog'}>
                { modalKeys[i]==='badges' || modalKeys[i]==='chooseavatar' ||  modalKeys[i]==='exitgame' || (modalKeys[i]==='general' || modalKeys[i]==='logout' && !generalModalProps.data.removeClose) ? (<i className={'icon-cancel'} onClick={this.closeModal.bind(this, modalKeys[i], true)} /> ) : null }
                { modals[i] }
              </div>) : modals[i]
            }
          </div>
        );
      }
    }

    return (
      <div key="modal_container" className={'modal_container'}>
        <CSSTransitionGroup transitionName="modals" component="div" transitionEnterTimeout={0} transitionLeaveTimeout={0}>
          { modalsToRender }
        </CSSTransitionGroup>
      </div>
    );
  }
}

export default ModalComponent;
