import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Top from './components';
import { actions } from './topActions.js';

const mapStateToProps = (state) => {
  return {
    ...state.top,
    game: state.game,
    routerState: state.router,
    user: state.user
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(actions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Top);
