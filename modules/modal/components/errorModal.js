import React from 'react';

class ErrorModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      buttonState: '',
      error_expanded: false
    };
    this.refresh = this.refresh.bind(this);
  }

  expandDropdown() {
    this.setState({error_expanded: !this.state.error_expanded});
  }

  refresh() {
    this.setState({buttonState: 'active'});
    if(window.kidframe && window.kidframe.initialURL){
      window.location.href = window.kidframe.initialURL;
    } else {
      window.location.reload();
    }
  }

  render() {
    let message = this.props.message ? this.props.message : 'Unknown error';
    let url = this.props.url ? this.props.url : null;
    let line = this.props.line ? this.props.line : null;
    return (
      <div className='error-content modal_container'>
        <div className='error-image'/>
        <div className='error-text'>
          <div className='uh-oh'>Uh oh, something went wrong.</div>
          <div className='error-dropdown-link left' onClick={()=>{this.expandDropdown()}}>Details
            <i className={`${this.state.error_expanded ? 'icon-down-open-1' : 'icon-up-open-1'}`}></i>
          </div>
          <div className={`error-details left ${this.state.error_expanded && 'expanded'}`}>
            <div>{message}</div>
            <div>{url!==null && 'url: '+url}</div>
            <div>{line!==null && 'line: '+line}</div>
          </div>
        </div>
        <div className={`refresh-btn ${this.state.buttonState}`} onClick={this.refresh}>
          <i className="icon-arrows-cw"/> Try again
        </div>
      </div>
    );
  }
}

export default ErrorModal;