import * as URL from './url';

class Tracking {

  constructor() {
    this.store = null;
  }

  setStore(store) {
    this.store = store;
  }


  getTrackingData() {
    var url = URL.mapToObject();
    var state = this.store.getState();

    var ret = {
      section: (window.kidframe && ('embedMode' in window.kidframe) && window.kidframe.embedMode==="detail") ? "Kid Frame detail page" : "Kid Frame",
      appScreen: url.screen,
      course: url.subject || '',
      grade: url.grade ? url.grade.split('-').pop() : '',
      lesson: url.lesson || '',
      exercise: url.game || '',
      assignment: (url.assignment && 'id' in url.assignment) ? url.assignment.id : '',
      memberId: state.user.userId,
      childId: state.player.currentPlayerId,
      loginType: state.user.userType || 'standard',
      sessionId: window.sessionId || '',
      windowId: window.windowId || '',
      isMobileApp: window.isMobileApp || false,
      playCount: (window.kidframe && window.kidframe.playCount) ? window.kidframe.playCount : 0,
      partOf: url.singlePlay ? 'single play' : (url.assignment ? 'assignment' : (url.challenge ? 'challenge' : 'guided lesson')),
      guidedLessonID: null,
        singlePlayToken: ('singlePlayToken' in window.kidframe) ? window.kidframe.singlePlayToken : false
    };

    // if in a guided lesson, add lesson ID:
    if(ret.partOf==='guided lesson'){
      ret.guidedLessonID = window.location.hash;
    }

    // If in a game/exercise, add extra information:
    if(state.game.currentGame){
      ret.contentType = state.game.currentGame.type || '';
      ret.template = state.game.currentGame.template || '';
      if(ret.template==='interactive-worksheet'){
        ret.contentType = 'worksheet';
      }
      ret.isScored = state.game.currentGame.is_scored || false;
    }

    return ret;
  }

  track(eventName, extra) {
    let data = this.getTrackingData();
    if(extra){
      data = {
        ...data,
        ...extra
      };
    }
    window.analytics.track(eventName, data);
  }

  trackExperiment(data) {
    window.analytics.track('Experiment Viewed', data);
  }
}

let tracking = new Tracking();
export default tracking;
