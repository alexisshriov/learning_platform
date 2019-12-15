import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ChoosePlayer from './components/choosePlayer';
import { actions } from './choosePlayerActions';

import { actions as playerActions } from '../../services/player/playerActions';
import { actions as loadingActions } from '../loading/loadingActions';
import { push } from 'connected-react-router';

const mapStateToProps = (state) => {
  return {
    ...state.choosePlayer,
    player: state.player,
    user: state.user,
    loading: state.loading,

  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(actions, dispatch),
    router: { ...bindActionCreators( {push}, dispatch) },
    playerActions: { ...bindActionCreators(playerActions, dispatch) },
    loadingActions: { ...bindActionCreators(loadingActions, dispatch) }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChoosePlayer);
