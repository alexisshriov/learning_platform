import React from 'react';

import user from '../../../services/user';
import { Howl, Howler } from 'howler';


export default class Navbar extends React.Component {
  constructor(props) {
    super(props);

    this.audio = {};
    this.audio.click = new Howl({src: [prefixCDN('/assets/kidframe/audio/select_general.ogg'), prefixCDN('/assets/kidframe/audio/select_general.mp3')]});
    this.clickLogout = this.clickLogout.bind(this);
  }

  clickLogout() {
    this.audio.click.play();
    user.logout();
  }

  renderLogout() {
    if(this.props.user.embedMode==='detail' || (this.props.user.accountInfo && 'signoutDisabled' in this.props.user.accountInfo) ){
      return null;
    } else {
      return (
        <div>
          <div className="spacer hidden"/>
          <div className="right">
            <div className={`logout ${this.props.user.user ? '' : 'disabled'}`} onClick={this.clickLogout}>
              <span>Sign Out</span><i className="icon-logout"/>
            </div>
          </div>
        </div>
      );
    }
  }

  render() {
    return (
      <div className="navbar">
        <div className="left">
          <div className="logo" />
        </div>
        <div className="middle" />
        {this.renderLogout()}
      </div>
    );
  }
}