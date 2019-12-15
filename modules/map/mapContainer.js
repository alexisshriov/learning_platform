import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Map from './components';
import { actions } from './mapActions'; // usually best to import specific actions, but in this case we want all
import { push } from 'connected-react-router';
import { actions as playerActions } from '../../services/player/playerActions';
import { actions as gameActions } from '../game/gameActions';
import { actions as loadingActions } from '../loading/loadingActions';
import { actions as modalActions } from '../modal/modalActions';

const mapStateToProps = (state) => {
  return {
    ...state.map,
    player: state.player,
    loading: state.loading
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(actions, dispatch),
    router: { ...bindActionCreators( {push}, dispatch) },
    playerActions: { ...bindActionCreators(playerActions, dispatch) },
    gameActions: { ...bindActionCreators(gameActions, dispatch) },
    modalActions: {...bindActionCreators(modalActions, dispatch)},
    loadingActions: { ...bindActionCreators(loadingActions, dispatch) }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Map);
