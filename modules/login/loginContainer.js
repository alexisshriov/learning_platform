import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Login from './components';
import { actions } from './loginActions';

import { actions as userActions } from '../../services/user/userActions';
import { push } from 'connected-react-router';
import {actions as loadingActions} from "../loading/loadingActions";

const mapStateToProps = (state) => {
  return {
    ...state.login,
    player: state.player
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(actions, dispatch),
    router: { ...bindActionCreators( {push}, dispatch) },
    userActions: { ...bindActionCreators(userActions, dispatch) },
    loadingActions: { ...bindActionCreators(loadingActions, dispatch) }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
