import React from 'react';

import * as URL from '../../../helpers/url';
import { fullScreen } from '../../../helpers/screen';

export default class Top extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      fullscreen: false
    };
    this.showFullscreen = this.props.user.embedMode !== 'detail' ? true : false;
    this.clickFullScreen = this.clickFullScreen.bind(this);
  }
  clickFullScreen = () => this.setState({fullscreen: fullScreen()});

  render() {
    let screen = URL.getScreen();
    return (
      <div className={`topUI ${screen} ${this.props.game.gameLoadState ? this.props.game.gameLoadState : 'noGame'} ${this.props.game.paused ? 'paused' : ''} ${this.props.game.detailPageOnboardingView ? 'detailPageOnboardingView' : ''}`}>
        {this.showFullscreen && (
          <div className={`fullScreen ${this.state.fullscreen ? 'active' : 'inactive'}`} onClick={this.clickFullScreen}>
            <div className="back"/>
            <i className={this.state.fullscreen ? 'icon-resize-small' : 'icon-resize-full'}/>
          </div>
        )}
      </div>
    );
  }
}