import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Challenge from './components';
import { actions } from './challengeActions';
import { actions as gameActions } from '../game/gameActions';
import { actions as loadingActions } from '../loading/loadingActions';
import { actions as playerActions } from '../../services/player/playerActions';
import { actions as modalActions } from '../modal/modalActions';

const mapStateToProps = (state) => {
  return {
    ...state.challenge,
    game: state.game,
    player: state.player,
    loading: state.loading
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(actions, dispatch),
    gameActions: { ...bindActionCreators(gameActions, dispatch) },
    router: { ...bindActionCreators( {push}, dispatch) },
    playerActions: { ...bindActionCreators(playerActions, dispatch) },
    modalActions: { ...bindActionCreators(modalActions, dispatch) },
    loadingActions: { ...bindActionCreators(loadingActions, dispatch) }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Challenge);
