import React from 'react';
import ReactTimeout from 'react-timeout';

import { Howl, Howler } from 'howler';

// import $ from 'jquery';

class GroupList extends React.Component {
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
      }
    };

    this.audio = {};
    this.audio.click = new Howl({src: [prefixCDN('/assets/kidframe/audio/select_general.ogg'), prefixCDN('/assets/kidframe/audio/select_general.mp3')]});
    this.audio.pop = new Howl({src: [prefixCDN('/assets/kidframe/audio/pop.ogg'), prefixCDN('/assets/kidframe/audio/pop.mp3')]});

    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.toPage = this.toPage.bind(this);
    this.parseGroups = this.parseGroups.bind(this);
    this.selectGroup = this.selectGroup.bind(this);
  }

  next() {
    if(!this.state.nextButton.disabled) {
      this.state.nextButton.state = 'clicked';
      this.audio.pop.play();
      this.props.setTimeout(()=>{
        this.state.nextButton.state = 'ready';
        this.forceUpdate();
      }, 200);
      let groups = this.parseGroups(this.props.players.groups);
      let pageSize = 6;
      let numPages = Math.ceil(groups.length / pageSize);
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

  selectGroup(id, name) {
    this.props.updatePlayerListClass('fadeout');
    this.props.updateGroupListClass('fadeout');
    this.audio.click.play();

    this.props.setTimeout(()=> {
      this.props.clickGroup({
        id: id,
        name: name
      });
      this.props.updatePlayerListClass('');
      this.props.updateGroupListClass('');
    }, 200);
  }

  parseGroups(groupsObj) {
    let groups = Object.keys(groupsObj).map((key)=>{
      return groupsObj[key];
    });

    return groups;
  }

  render() {
    let groups = this.parseGroups(this.props.players.groups);
    let pageSize = 6;
    let numPages = Math.ceil(groups.length / pageSize);

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

    const groupEls = [];
    const pagination = [];
    let page0Props = {
      marginLeft: (this.props.pageNo * -100)+'%'
    };
    for(var p=0; p<numPages; p++){
      let groupItems = [];
      for(var i=0; i<pageSize; i++){
        if( (p*pageSize + i) >= groups.length) break;
        let group = groups[p*pageSize + i];
        groupItems.push(
          <div className={`item player ${this.props.clickedPlayerButton ? 'not_selected' : ''}`} key={group.PlayerGroupId} data-groupid={group.PlayerGroupId} onClick={()=>{this.selectGroup(group.PlayerGroupId, group.GroupName)}}>
            <div className={`icon group_avatar_${group.GroupAvatarId}`} />
            <div className="label">{group.GroupName}</div>
          </div>
        );
      }
      groupEls.push(
        <div className="page" key={`groups_page_${p}`} data-page={`${p}`} style={page0Props}>
          { groupItems }
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

    return (
      <div className={`group_list ${this.props.className}`} key={`group_list`}>
        <div className="inner">
          <h2>Groups</h2>
          <div className="pages">
            {groupEls}
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
    );
  }
}

export default ReactTimeout(GroupList);
