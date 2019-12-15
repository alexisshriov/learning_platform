import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ChooseQuest from './components';
import { actions } from './chooseQuestActions';
import { push } from 'connected-react-router';
import { actions as loadingActions } from '../loading/loadingActions';
import { actions as playerActions } from '../../services/player/playerActions';
import {actions as modalActions} from "../modal/modalActions";

const mapStateToProps = (state) => {
  return {
    ...state.chooseQuest,
    player: state.player,
    loading: state.loading,
    user: state.user
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(actions, dispatch),
    router: { ...bindActionCreators( {push}, dispatch) },
    playerActions: { ...bindActionCreators(playerActions, dispatch) },
    modalActions: {...bindActionCreators(modalActions, dispatch)},
    loadingActions: { ...bindActionCreators(loadingActions, dispatch) }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseQuest);
