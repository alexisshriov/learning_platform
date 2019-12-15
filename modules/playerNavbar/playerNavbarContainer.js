import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PlayerNavbar from './components';
import { actions } from './playerNavbarActions'; // usually best to import specific actions, but in this case we want all
import { actions as modalActions } from '../modal/modalActions'; // usually best to import specific actions, but in this case we want all
import { actions as playerActions } from '../../services/player/playerActions';
import { push } from 'connected-react-router';

// import player from '../../services/player';

const mapStateToProps = (state) => {
  return {
    ...state.playerNavbar,
    player: state.player,
    user: state.user,
    game: state.game,
    routerState: state.router
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(actions, dispatch),
    router: { ...bindActionCreators( {push}, dispatch) },
    playerActions: { ...bindActionCreators(playerActions, dispatch) },
    modalActions: { ...bindActionCreators(modalActions, dispatch) }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlayerNavbar);
