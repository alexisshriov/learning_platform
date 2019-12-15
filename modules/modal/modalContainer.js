import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Modal from './components';
import { actions } from './modalActions';
import { actions as playerActions } from '../../services/player/playerActions';
import { actions as gameActions } from '../game/gameActions';
import { actions as mapActions } from '../map/mapActions';
import { push, goBack } from 'connected-react-router';

const mapStateToProps = (state) => {
  return {
    ...state.modal,
    user: state.user,
    player: state.player,
    game: state.game
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(actions, dispatch),
    router: { ...bindActionCreators({push, goBack}, dispatch) },
    playerActions: { ...bindActionCreators(playerActions, dispatch) },
    gameActions: { ...bindActionCreators(gameActions, dispatch) },
    mapActions: { ...bindActionCreators(mapActions, dispatch)}
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Modal);
