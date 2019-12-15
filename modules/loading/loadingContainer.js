import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Loading from './components';
import { actions } from './loadingActions';
import { push } from 'connected-react-router';

const mapStateToProps = (state) => {
  return {
        ...state.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
      ...bindActionCreators(actions, dispatch),
    router: { ...bindActionCreators( {push}, dispatch) }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Loading);
