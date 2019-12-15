import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import assignments from './components';
import { actions } from './assignmentsActions'; // usually best to import specific actions, but in this case we want all
import { push } from 'connected-react-router';
import { actions as playerActions } from '../../services/player/playerActions';
import { actions as loadingActions } from '../loading/loadingActions';

const mapStateToProps = (state) => {
  return {
    ...state.assignments,
     player: state.player,
     loading: state.loading
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

export default connect(mapStateToProps, mapDispatchToProps)(assignments);
