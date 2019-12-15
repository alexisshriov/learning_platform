import React from 'react';
import ReactTimeout from 'react-timeout';
import 'yuki-createjs/lib/easeljs-0.8.2.combined';
import LoadingTreadmillAnimation from '../../../widgets/loadingTreadmill';
import * as URL from '../../../helpers/url';

class LoadingScreen extends React.Component {

  render() {
    if(!this.props.addingChild && !this.props.loading) {
      return null;
    }
    let loadingText = this.props.loadingText ? this.props.loadingText : "Loading";

    return(
      <section style={{zIndex:10000000}} className="choose_quest_container loading loading-overlay">
        <div style={{position:'absolute', top: '300px', left: '0', width:'100%', textAlign: 'center'}}>
          <LoadingTreadmillAnimation />
          <div style={{clear: 'both'}}/>
          <h1 style={{color: '#1e8474'}}>{loadingText}
            <div className="loadingDots">
              <div className="dot1"/><div className="dot2"/><div className="dot3"/>
            </div>
          </h1>
        </div>
      </section>
    );
  }
}

export default ReactTimeout(LoadingScreen);
