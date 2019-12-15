import React from 'react';
import { connect } from 'react-redux';
import { CSSTransitionGroup } from 'react-transition-group';

import { actions } from "./modules";

import LoginContainer from './modules/login/loginContainer';
import NavbarContainer from './modules/navbar/navbarContainer';
import PlayerNavbarContainer from './modules/playerNavbar/playerNavbarContainer';
import ModalContainer from './modules/modal/modalContainer';
import TopContainer from './modules/top/topContainer';
import ChoosePlayerContainer from './modules/choosePlayer/choosePlayerContainer';
import ChooseQuestContainer from './modules/chooseQuest/chooseQuestContainer';
import AssignmentsContainer from './modules/assignments/assignmentsContainer';
import LoadingContainer from './modules/loading/loadingContainer';
import MapContainer from './modules/map/mapContainer';
import LessonContainer from './modules/lesson/lessonContainer';
import ChallengeContainer from './modules/challenge/challengeContainer';
import GameContainer from './modules/game/gameContainer';

//todo: remove after abstracting sequence fetchers and other "onAppLoad" calls
import Player from './services/player';
import User from './services/user';
import * as URL from './helpers/url';
import Tracking from './helpers/tracking';
// import Abtests from './helpers/abtests';
import Logger from './helpers/logger';

class App extends React.Component {
  constructor(props) {
    super(props);

    // Give store access to singletons that need it
    User.setStore(this.props.store);
    Player.setStore(this.props.store);
    Tracking.setStore(this.props.store);
    // Abtests.setStore(this.props.store);
    Logger.setStore(this.props.store);

    // Get any special embedding information, such as on a detail page
    if(window.kidframe){
      User.ingestContext(window.kidframe);
    }

    // Always get the list of sequences on app load
    Player.getSequence().then((resp) => {
      this.props.store.dispatch(actions.setSequences({...resp}));
    });
    Player.getSkillMap().then((resp) => {
      this.props.store.dispatch(actions.setSkillMap({...resp}));
    });

    // AB Test
    // Abtests.chooseVariation('brainzy-mastery-bar').then((resp) => {
    //   this.props.store.dispatch(actions.setExperimentVariation({...resp}));
    // });
  }

  renderFragment(condition, jsx){
    if(condition) return jsx;
  }

  render() {
    let state = this.props.store.getState();
    let screen = URL.getScreen();
    let userSet = state.user.user;
    let playerSet = state.player.currentPlayerSet;
    let game = state.game;

    return (
      <div className="screens">
        <LoadingContainer />

        {/*Modals*/}
        <ModalContainer key="modalContainer"/>
        {/* todo: loading screens here instead of in components */}
        {/*Top level UI*/}
        <TopContainer key="topContainer"/>

        {/*Screens, surrounded by screen transition*/}
        <CSSTransitionGroup transitionName="screen" component="div" transitionEnterTimeout={0} transitionLeaveTimeout={500}>
          {this.renderFragment(screen==='login', (
            <LoginContainer key="loginContainer"/>
          ))}
          {this.renderFragment(screen==='choosePlayer' && userSet, (
            <ChoosePlayerContainer key="choosePlayerContainer"/>
          ))}
          {this.renderFragment(screen==='assignments' && playerSet, (
            <AssignmentsContainer key="assignmentsContainer"/>
          ))}
          {this.renderFragment(screen==='chooseQuest' && playerSet, (
            <ChooseQuestContainer key="chooseQuestContainer"/>
          ))}
          {this.renderFragment(screen==='map' && playerSet, (
            <MapContainer key="mapContainer"/>
          ))}
          {/*Lesson and game screens are unified because they share many of the same components*/}
          {this.renderFragment((screen==='lesson' || screen ==='assignment' || screen==='game') && playerSet, (
            <div className="lesson_game" key="lesson_game">
              <LessonContainer key="lessonContainer"/>
              <GameContainer key="gameContainer"/>
            </div>
          ))}
          {this.renderFragment((screen==='challenge') && playerSet, (
            <div className="challenge_game" key="challenge_game">
              <ChallengeContainer key="challengeContainer"/>
              <GameContainer key="gameContainer"/>
            </div>
          ))}
        </CSSTransitionGroup>

        {/*Navbar UI, surrounded by navbar transition*/}
        <CSSTransitionGroup transitionName="navbar" component="div" transitionEnterTimeout={500} transitionLeaveTimeout={0}>
          {this.renderFragment((screen==='choosePlayer') && userSet, (
            <NavbarContainer key="navbarContainer"/>
          ))}
          {this.renderFragment((screen==='chooseQuest' || screen==='assignments' || screen==='map' || screen==='lesson' || screen==='challenge' || screen==='assignment' || screen==='game') && playerSet, (
            <PlayerNavbarContainer key="playerNavbarContainer"/>
          ))}
        </CSSTransitionGroup>

      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    router: state.router,
    player: state.player
  };
};

export default connect(mapStateToProps)(App);
