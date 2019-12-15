import React, { Fragment } from 'react';
import ErrorModal from './modules/modal/components/errorModal';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false
    };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
  }


  render() {
    if(this.state.hasError){
      return (
        <Fragment>
          <div className="modal_container">
            <div className="error-modal container">
              <div className="modal_overlay"/>
              <div className="dialog">
                <ErrorModal />
              </div>
            </div>
          </div>
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          {this.props.children}
        </Fragment>
      );
    }
  }
};

export default ErrorBoundary;
