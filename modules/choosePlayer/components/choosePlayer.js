import React from 'react';
import ReactTimeout from 'react-timeout';
import player from '../../../services/player';

import GroupList from'./groupList';
import PlayerList from'./playerList';
import BackButton from '../../../widgets/backButton';


class ChoosePlayer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playerListClass: '',
      groupListClass: '',
      clickedPlayer: false,
      clickedPlayerButton: false,
    };

    this.updatePlayerListClass = this.updatePlayerListClass.bind(this);
    this.updateGroupListClass = this.updateGroupListClass.bind(this);
    this.clickedPlayer = this.clickedPlayer.bind(this);
    this.clickedPlayerButton = this.clickedPlayerButton.bind(this);
  }

  componentWillMount() {
    // todo: move this to middleware:
    if('userType' in this.props.user && this.props.user.userType==='studentCode' ) {
      // this.props.router.push(location.search + '#chooseQuest');
    } else {
      this.props.loadingActions.loadingFinished();
    }
  }

  updatePlayerListClass(className) {
    this.setState({playerListClass: className});
  }
  updateGroupListClass(className) {
    this.setState({groupListClass: className});
  }
  clickedPlayer(id){
    this.setState({clickedPlayer: id});
  }
  clickedPlayerButton(val){
    this.setState({clickedPlayerButton: val});
  }

  render() {
    const numGroups = ('groups' in this.props.player.players) ? Object.keys(this.props.player.players.groups).length : 0;
    // const numGroups = 0;

    let playerListProps = {
      players: this.props.player.players,
      groupName: this.props.groupName,
      groupId: this.props.inGroup,
      fullPageHeight: (numGroups===0 || this.props.inGroup!==null) ? true : false,
      pageNo: this.props.pageNo,
      className: this.state.playerListClass,
      nextPage: this.props.clickNextPage,
      previousPage: this.props.clickPreviousPage,
      toPage: this.props.clickToPage,
      clickedPlayer: this.clickedPlayer,
      clickedPlayerButton: this.clickedPlayerButton,
      updatePlayerListClass: this.updatePlayerListClass,
      updateGroupListClass: this.updateGroupListClass,
      router: this.props.router,
      toUrl: this.props.toUrl,
      user: this.props.user,
      jumpToUrl: this.props.jumpToUrl,
      playerActions: this.props.playerActions,
      playerProgress: this.props.player.progress,
      loadingChildStarted: this.props.loadingActions.loadingChildStarted,
      loadingChildFinished: this.props.loadingActions.loadingChildFinished,
      addPlayerError: this.props.player.addPlayerError,
    };

    let groupListProps = {
      players: this.props.player.players,
      pageNo: this.props.groupPageNo,
      className: this.state.groupListClass,
      clickGroup: this.props.clickGroup,
      clickedPlayerButton: this.state.clickedPlayerButton,
      nextPage: this.props.clickGroupsNextPage,
      previousPage: this.props.clickGroupsPreviousPage,
      toPage: this.props.clickGroupsToPage,
      updatePlayerListClass: this.updatePlayerListClass,
      updateGroupListClass: this.updateGroupListClass
    };

    let backButtonProps = {
      left: 45,
      top: 80,
      visible: this.props.inGroup!==null ? true : false,
      text: "Back to all groups",
      destroyOnClick: true,
      click: ()=>{
        this.updatePlayerListClass('fadeout');
        this.props.setTimeout(()=> {
          this.props.clickGroup({
            id: null,
            name: null
          });
          this.updatePlayerListClass('');
        }, 200);
      }
    };

    return (
      <div className="choose_player_container">
        <BackButton {...backButtonProps} />
        <h1 className="title">{this.props.title || "Choose Player"}</h1>
        <div className={`loading ${!this.props.player.playersLoaded ? '' : 'hidden'}`}>
          <h2 style={{color: '#1e8474', marginTop: '100px'}}>Loading Players
            <div className="loadingDots">
              <div className="dot1"/><div className="dot2"/><div className="dot3"/>
            </div>
          </h2>
        </div>
        { this.props.player.playersLoaded && numGroups>0 && this.props.inGroup===null ? (
          <GroupList {...groupListProps} />
        ) : '' }
        { this.props.player.playersLoaded ? (
          <PlayerList {...playerListProps} />
        ) : '' }
      </div>
    );
  }
};

export default ReactTimeout(ChoosePlayer);
