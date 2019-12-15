import React from 'react';
import ReactTimeout from 'react-timeout';
import player from '../../../services/player';
import API from '../../../helpers/api';
import { Howl, Howler } from 'howler';
import AddChildModal from '../../../../../styleguide/addChildModal';
import avatarPaths from "../../../../../styleguide/avatarPaths";


class PlayerList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      navClass: '',
      nextButton: {
        disabled: false,
        state: 'ready'
      },
      previousButton: {
        disabled: false,
        state: 'ready'
      },
      lockButtons: false,
      clickedPlayerId: null,
      addChildModalOpened: false,
      addChildRequestStarted: false,
      addChildErrorMessage: '',
    };

    this.audio = {};
    this.audio.click = new Howl({src: [prefixCDN('/assets/kidframe/audio/select_player.ogg'), prefixCDN('/assets/kidframe/audio/select_player.mp3')]});
    this.audio.pop = new Howl({src: [prefixCDN('/assets/kidframe/audio/pop.ogg'), prefixCDN('/assets/kidframe/audio/pop.mp3')]});

    this.avatars = avatarPaths;

    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.toPage = this.toPage.bind(this);
    this.parsePlayers = this.parsePlayers.bind(this);
    this.clickPlayer = this.clickPlayer.bind(this);
    this.closeAddChildModal = this.closeAddChildModal.bind(this);
    this.addChildCallback = this.addChildCallback.bind(this);
    this.openAddChildModal = this.openAddChildModal.bind(this);
  }

  openAddChildModal () {
    this.setState({
      addChildModalOpened: true,
    });
  };

  closeAddChildModal () {
    this.setState({
      addChildModalOpened: false,
    });
  };

  addChildCallback = (fields, done) => {
    if (this.state.addChildRequestStarted) {
      return false;
    }
    if (!fields.name.length || fields.name.trim() === '') {
      this.setState({
        addChildErrorMessage: "Please enter your child's name"
      });
      return false;
    }
    this.setState({
      addChildRequestStarted: true,
      addChildErrorMessage: '',
      addChildModalOpened: false,
    });

    if(done) done();

    // todo: make a new clean endpoint that matches our data structure and supports grade locking/hiding. see editChild for example.
    let data = {
      childName: fields.name,
      childAvatar:  fields.avatarInternalName,
      childGrade: fields.grade,
      verbose: 1
    };

    player.addChild(data);
  };

  clickPlayer(id){
    if(this.state.lockButtons) return;
    this.setState({lockButtons: true});

    this.audio.click.play();
    this.setState({clickedPlayerId: id});
    this.props.clickedPlayerButton(true);

    if(this.props.playerProgress[id]) {
      this.props.playerActions.setCurrentPlayer({id:id});
      API.activateToken();
      this.props.router.push('?childId='+id+'#chooseQuest');
    } else {
      player.getPlayerProgress(id)
        .then((resp)=>{
          let payload = {};
          payload[id] = {...resp};
          this.props.playerActions.setProgress(payload);
          this.props.playerActions.setCurrentPlayer({id:id});
          API.activateToken();
          this.props.clickedPlayer(id);
          if(location.hash === '#choosePlayer'){
            if(this.props.toUrl){
              this.props.router.push('?childId='+id+this.props.toUrl);
              this.props.jumpToUrl(null);
            } else {
              this.props.router.push('?childId=' + id + '#chooseQuest');
            }
          }
        }).catch((resp)=>{
          this.setState({lockButtons: false});
          this.props.clickedPlayerButton(false);
      });
    }
  }

  next() {
    if(!this.state.nextButton.disabled) {
      this.state.nextButton.state = 'clicked';
      this.audio.pop.play();
      this.props.setTimeout(()=>{
        this.state.nextButton.state = 'ready';
        this.forceUpdate();
      }, 200);
      let players = this.parsePlayers(this.props.players);
      let pageSize = this.props.fullPageHeight ? 21 : 14;
      let playerLength = (this.props.groupId == null) ? players.length+2 : players.length;
      let numPages = Math.ceil(playerLength / pageSize);
      if (this.props.pageNo < numPages-1) {
        this.props.nextPage();
        this.forceUpdate();
      }
    }
  }

  previous() {
    if(!this.state.previousButton.disabled) {
      this.state.previousButton.state = 'clicked';
      this.audio.pop.play();
      this.props.setTimeout(() => {
        this.state.previousButton.state = 'ready';
        this.forceUpdate();
      }, 200);
      if (this.props.pageNo > 0) {
        this.props.previousPage();
        this.forceUpdate();
      }
    }
  }

  toPage(pageNo) {
    if(this.props.pageNo!==pageNo){
      this.props.toPage({pageNo: pageNo});
    }
  }

  parsePlayers(playerGroup) {
    if(this.props.groupId == null){
      playerGroup = playerGroup.noGroups;
    } else {
      playerGroup = playerGroup.groups[this.props.groupId];
    }
    let playerArray = [];
    for(var key in playerGroup.children){
      let child = playerGroup.children[key];
      playerArray.push(child);
    }
    playerArray.sort((a,b)=>{
      return a.PlayerName.toLowerCase().localeCompare(b.PlayerName.toLowerCase());
    });
    return playerArray;
  }
  componentDidUpdate(){
    if (this.props.addPlayerError.error && (!this.state.addChildModalOpened || this.state.addChildErrorMessage !== this.props.addPlayerError.message)) {
      this.setState({
        addChildRequestStarted: false,
        addChildErrorMessage: this.props.addPlayerError.message,
        addChildModalOpened: true,
      });
      this.props.playerActions.setPlayerError({isError:false, error:{}});
    }
    if(this.props.addingPlayer !== this.state.addChildRequestStarted) {
      this.state.addChildRequestStarted = this.props.addingPlayer;
    }
  }
  render() {
    let players = this.parsePlayers(this.props.players);
    let pageSize = this.props.fullPageHeight ? 21 : 14; // 28 instead of 21?
    let playerLength = (this.props.groupId == null) ? players.length+2 : players.length;
    let numPages = Math.ceil(playerLength / pageSize);
    let showAddPlayer = (window.kidframe['memberType'] === 'pro' && this.props.user.userType==='standard');

    if(this.props.pageNo < 1){
      this.state.previousButton.disabled = true;
    } else {
      this.state.previousButton.disabled = false;
    }

    if(this.props.pageNo >= numPages-1){
      this.state.nextButton.disabled = true;
    } else {
      this.state.nextButton.disabled = false;
    }

    if(numPages<=1){
      this.state.navClass = 'hidden';
    } else {
      this.state.navClass = '';
    }

    const playerEls = [];
    const pagination = [];
    let playerCount = 0;
    let page0Props = {
      marginLeft: (this.props.pageNo * -100)+'%'
    };
    for(var p=0; p<numPages; p++){
      let playerItems = [];
      // todo: redo this to make sense...
      let pageSizeModifier = 0;

      if(p === 0 && this.props.groupId == null) {
        pageSizeModifier = 2;
        //TODO: remove once we have confirmed we are not having this
        // // Add player and Guest to the front
        // playerItems.push(
        //   <div className="item" key={0} data-playerid={0} onClick={()=>{/*nothing yet sucka*/}}>
        //     <div className={'icon'} />
        //     <div className="label">Add Player</div>
        //   </div>
        // );

        let itemClass = "";

        if(this.state.clickedPlayerId!==null){
          itemClass = "not_selected";
        }
        if(showAddPlayer) {
          playerItems.push((
            <div className={`item player selectPlayerItem ${itemClass}`} key='addChild' data-playerid={-2}
                 onClick={() => {
                   this.openAddChildModal();
                 }}>
              <div className="icon addChild"/>
              <div className="label">Add Child</div>
            </div>
          ));
        }

        // Guest:
        itemClass = "";
        if(this.state.clickedPlayerId==-1) {
          itemClass = "selected";
        } else if(this.state.clickedPlayerId!==null && this.state.clickedPlayerId!=-1){
          itemClass = "not_selected";
        }
        playerItems.push(
          <div className={`item player ${itemClass}`} key={-1} data-playerid={-1} onClick={()=>{this.clickPlayer(-1)}}>
            <div className={'icon guest'} />
            <div className="label guest"><small>play as</small><div className="guestText">Guest</div></div>
          </div>
        );
      }

      for(var i=0; i<pageSize-pageSizeModifier; i++){
        if( (p*(pageSize-pageSizeModifier) + i) >= playerLength) break;
        let player = players[playerCount++];
        if(player && player.PlayerId!=-1) {
          let itemClass = "";
          if(this.state.clickedPlayerId==player.PlayerId) {
            itemClass = "selected";
          } else if(this.state.clickedPlayerId!==null && this.state.clickedPlayerId!=player.PlayerId){
            itemClass = "not_selected";
          }
          playerItems.push(
            <div className={`item player ${itemClass}`} key={player.PlayerId} data-playerid={player.PlayerId} onClick={()=>{this.clickPlayer(player.PlayerId)}}>
              <div className={`icon ${player.avatar.internal_name}`} />
              <div className="label">{player.PlayerName}</div>
            </div>
          );
        }
      }

      playerEls.push(
        <div className="page" key={`group_${this.props.groupId}_page_${p}`} data-page={`${p}`} style={page0Props}>
          { playerItems }
        </div>
      );

      pagination.push(
        <div className={`page_bullet ${p === this.props.pageNo ? 'active' : ''}`} key={`page_bullet_${p}`}
             data-page={`${p}`} onClick={(event)=>{this.toPage(Number(event.target.getAttribute('data-page')))}}>
          <div className="inner_bullet"/>
        </div>
      );
      page0Props = {};
    }

    let listClass = '';
    if(this.props.fullPageHeight) {
      listClass += ' tall';
    } else {
      listClass += ' labeled';
    }
    if(this.props.groupId!==null) {
      listClass += ' labeled';
    }

    return (
      <div>
        {showAddPlayer && (
          <AddChildModal
            key="addChildModal"
            open={this.state.addChildModalOpened}
            closeAddChildModal={this.closeAddChildModal}
            addChildCallback={this.addChildCallback}
            addChildErrorMessage={this.state.addChildErrorMessage}
            avatars={this.avatars}
          />
        )}
        <div className={`player_list ${listClass} ${this.props.className}`} key={`player_list`}>
          <div className="inner">
            <h2>{this.props.groupId===null ? 'Individual Players' : this.props.groupName }</h2>
            <div className="pages">
              {playerEls}
            </div>
          </div>
          <div className={`
            next_button
            ${this.state.navClass}
            ${this.state.nextButton.state==='clicked' ? 'clicked' : ''}
            ${this.state.nextButton.disabled ? 'disabled' : ''}
          `} onClick={this.next}>
            <div className="inner_button">
              <i />
            </div>
          </div>
          <div className={`
            previous_button
            ${this.state.navClass}
            ${this.state.previousButton.state==='clicked' ? 'clicked' : ''}
            ${this.state.previousButton.disabled ? 'disabled' : ''}
          `} onClick={this.previous}>
            <div className="inner_button">
              <i />
            </div>
          </div>
          <div className={`
            pagination
            ${this.state.navClass}
          `}>
            {pagination}
          </div>
        </div>
      </div>
    );
  }
}

export default ReactTimeout(PlayerList);
