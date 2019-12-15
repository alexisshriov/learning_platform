import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Navbar from './components';
import { actions } from './navbarActions';

import { push } from 'connected-react-router';

// import player from '../../services/player';

const mapStateToProps = (state) => {
  return {
    ...state.navbar,
    user: state.user
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(actions, dispatch),
    router: { ...bindActionCreators( {push}, dispatch) }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
