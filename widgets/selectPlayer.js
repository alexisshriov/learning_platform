import React from 'react';
import ReactTimeout from 'react-timeout';
import * as URL from '../helpers/url';


class SelectPlayer extends React.Component {
  constructor(props) {
    const avatarPerPage = 7; // 7 fit on the page
    super(props);
    this.scrollWidth = 1140;
    let arrowRight = false;
    let arrowLeft = false;
    let totalNumItems = Object.keys(this.props.players.noGroups.children).length + 1;
    let pageAmount = Math.ceil((totalNumItems / avatarPerPage)) - 1;
    if (pageAmount > 0) {
      arrowRight = true;
    }
    this.state = {
      page: 0,
      selectedPlayer: -1,
      pageAmount: pageAmount,
      arrowRight: arrowRight,
      arrowLeft: arrowLeft,
    };

    this.childListRender = this.childListRender.bind(this);
    this.childAddStarted = this.childAddStarted.bind(this);
    this.childAdded = this.childAdded.bind(this);
    this.childAddedError = this.childAddedError.bind(this);

    document.addEventListener('addChildStarted', this.childAddStarted);
    document.addEventListener('addedChild', this.childAdded);
    document.addEventListener('addedChildError', this.childAddedError);
  }

  childAddStarted () {
    //@TODO: Check which text we want to show while adding kid treadmill
    this.props.loadingChildStarted({loadingText: "Loading", });
  }

  childAddedError () {
    this.props.loadingChildFinished();
  }

  childAdded (e) {
    const avatarPerPage = 7; // 7 fit on the page

    this.props.addPlayer(e.detail);
    this.clickPlayer(e.detail.PlayerId);

    let totalNumItems = Object.keys(this.props.players.noGroups.children).length + 1;
    let pageAmount = Math.ceil((totalNumItems / avatarPerPage)) - 1;
    let arrowRight = pageAmount > 0;
    this.setState(
{
        pageAmount: pageAmount,
        arrowRight: arrowRight,
      });

    this.props.loadingChildFinished();
  }


  clickPlayer(playerId){
    this.setState({selectedPlayer: playerId});
    this.props.setCurrentPlayer({id: parseInt(playerId)});

    // update the player ID in the url:
    let search = new URLSearchParams(window.location.search);
    search.set('childId', playerId);
    window.history.pushState('', 'Home', '?'+search.toString()+window.location.hash);

    let url = URL.mapToObject();
    if(url.singlePlay){
      // attempt to set the player's grade and subject for single play games
      if(url.grade) {
        let grade = url.grade.replace('math-','').replace('ela-','');
        if(['preschool', 'kindergarten', 'first', 'second', 'third', 'fourth', 'fifth'].includes(grade)) {
          if(url.subject==='ela'){
            this.props.setGrade({ela: {grade: grade, internalName: 'ela-'+grade}});
          } else if(url.subject==='math'){
            this.props.setGrade({math: {grade: grade, internalName: 'math-'+grade}});
          } else {
            this.props.setGrade({ela: {grade: grade, internalName: 'ela-'+grade}, math: {grade: grade, internalName: 'math-'+grade}});
          }
        }
      }
    }
  }

  clickPrevious(){
    let arrowLeft = true;
    let arrowRight = true;
    let page = this.state.page;
    if(page > 0){
      arrowLeft = true;
      page--;
    }
    if(page <= 0) {
      arrowLeft = false;
    }
    this.setState({arrowLeft, page, arrowRight});
  }

  clickNext(){
    let arrowRight = true;
    let page = this.state.page;
    let arrowLeft = true;
    if(page < this.state.pageAmount){
      arrowRight = true;
      page++;
    }
    if(page >= this.state.pageAmount) {
      arrowRight = false;
    }
    this.setState({arrowRight, page, arrowLeft});

  }

  childListRender(players, guestMode = true){
    const avatarPerPage = 7; // 7 fit on the page
    let playerJsxList = [];
    let itemClass = "";

    //@TODO: Look for which is the 'page' where the new already preselected kid is located
    if(window.kidframe['memberType'] == "pro") {
      playerJsxList.push((
        <div className={`item player selectPlayerItem ${itemClass}`} key='addChild' data-playerid={-2} onClick={()=>{window.kidframe.openAddChildModal();}}>
          <div className="icon addChild" />
          <div className="label">Add Child</div>
        </div>
      ));
    }

    if(guestMode){
      playerJsxList.push(
        <div className={`item player selectPlayerItem ${this.state.selectedPlayer === -1? 'selected' : ''}`} key={-1} data-playerid={-1} onClick={()=>{this.clickPlayer(-1)}}>
          <div className={'icon guest'} />
          <div className="label guest"><small>play as</small><div className="guestText">Guest</div></div>
        </div>
      );
    }

    let playersArray = [];
    Object.keys(players).forEach((key, index) => {
      playersArray.push(players[key]);
    });

    playersArray.sort((playerA,playerB)=>{
        return playerA.PlayerName.toLowerCase().localeCompare(playerB.PlayerName.toLowerCase());
    });

    Object.keys(playersArray).forEach((key, index) => {
      let player = playersArray[key];
      itemClass = this.state.selectedPlayer === player.PlayerId ? 'selected' : '';
      if(player.PlayerId === "-1") return;
      playerJsxList.push((
        <div className={`item player selectPlayerItem ${itemClass}`} key={player.PlayerId} data-playerid={player.PlayerId} onClick={()=>{this.clickPlayer(player.PlayerId)}}>
          <div className={`icon ${player.avatar.internal_name}`} />
          <div className="label">{player.PlayerName}</div>
        </div>
      ));
    });


    let pageLength = guestMode ? Object.keys(playersArray).length : Object.keys(playersArray).length - 1;
    return playerJsxList;
  }

  render() {
    const playerList = this.childListRender(this.props.players.noGroups.children, true);
    return(
      <div className={`selectPlayer ${
        ((this.props.game.gameLoadState==='playing-loadTemplate' || this.props.game.gameLoadState==='playing') && !this.props.game.paused) ||
        this.props.game.gameLoadState==='restart' ||
        this.props.game.gameLoadState==='fetching' ||
        this.props.game.gameLoadState==='willLoadTemplate'||
        this.props.game.playedFirstGame
          ? 'minimized' : ''}`}>
        <h2>Choose Player</h2>
        <div className="playerContainerOuter">
          <div className="playerContainer" style={{position: "relative", left: -(this.state.page*this.scrollWidth)}}>
            {playerList}
          </div>
        </div>
        <div className="next_button" onClick={this.clickNext.bind(this)} style={{display: this.state.arrowRight? 'block':'none'}}>
          <div className="inner_button">
            <i />
          </div>
        </div>
        <div className={`previous_button`} onClick={this.clickPrevious.bind(this)} style={{display: this.state.arrowLeft? 'block':'none'}}>
          <div className="inner_button">
            <i />
          </div>
        </div>
      </div>
    );
  }
}

export default ReactTimeout(SelectPlayer);
