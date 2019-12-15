import {bindActionCreators} from "redux";
import {actions as modalActions} from "../modules/modal/modalActions";
import Tracking from './tracking';


class Logger {

  constructor() {
    this.actions = {};
    this.initLogger();
  }

  setStore(store) {
    this.store = store;
    this.actions.modal = { ...bindActionCreators( modalActions, store.dispatch) };
  }

  initLogger() {
    var self = this;

    // Create custom logger function on the window
    window.logError = function(data) {
      var args = Tracking.getTrackingData();
      var args = {
        ...args,
        message: data.msg || '',
        url: data.url || '',
        line: data.line || '',
        column: data.column || '',
        modal: data.showModal || false,
        width: $(window).width(),
        height: $(window).height()
      };
      console.log('error:', args);

      window.errorPosted = window.errorPosted || {};
      if(window.errorPosted[data.msg]) return;
      window.errorPosted[data.msg] = true;

      $.post('/games/request/error/report', args).fail(function() {
        // If there was an XHR error, change the error message to say the user is offline
        // if(ui) ui.showErrorOverlay(true);
        self.actions.modal.showErrorModal({message: args.msg, url: args.url, line: args.line});
      });
    };

    // Override window's onerror method to automatically handle browser errors
    window.onerror = function(msg, url, line, column) {
      column = column ? column : 0;
      // We only want to show the modal if it will affect gameplay
      // We log all errors regardless of whether or not we show an error modal
      var showModal = true;

      // This is thrown by some chrome extensions and shouldn't affect gameplay
      if(msg === 'Script error.' || msg === 'Unspecified error.') {
        showModal = false;
        msg += ' (Probably safe to ignore)';
      }
      // Allow our own [debug] errors without halting the gameplay.
      if(msg.substring(0,7) == '[debug]'){
        showModal = false;
      }
      // Errors from 3rd party scripts or browser plugins shouldn't affect gameplay
      if(url && url.substr(0,4)==='http' && url.indexOf('education.com')<0) showModal = false;

      window.logError({
        msg: msg,
        url: url,
        line: line,
        column: column,
        showModal: showModal
      });

      if(showModal) {
        self.actions.modal.showErrorModal({message: msg, url: url, line: line});
      }
    };
  }

}

let logger = new Logger();
export default logger;
