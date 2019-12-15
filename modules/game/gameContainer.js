import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Game from './components';
import { actions } from './gameActions';
import { actions as playerActions } from '../../services/player/playerActions';
import { actions as modalActions } from '../modal/modalActions';
import { actions as loadingActions } from '../loading/loadingActions';
import { actions as playerNavbarActions } from '../playerNavbar/playerNavbarActions';


const mapStateToProps = (state) => ({
    ...state.game,
    player: state.player,
    user: state.user,
    loading: state.loading
  });

const mapDispatchToProps = (dispatch) => ({
    ...bindActionCreators(actions, dispatch),
    router: { ...bindActionCreators( {push}, dispatch) },
    playerActions: { ...bindActionCreators(playerActions, dispatch) },
    modalActions: { ...bindActionCreators(modalActions, dispatch) },
    playerNavbarActions: { ...bindActionCreators(playerNavbarActions, dispatch) },
    loadingActions: { ...bindActionCreators(loadingActions, dispatch) }
  });

export default connect(mapStateToProps, mapDispatchToProps)(Game);
