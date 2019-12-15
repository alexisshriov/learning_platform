import React from 'react';
import ReactTimeout from "react-timeout";


class GeneralModal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    let title = null;
    if(this.props.data.title){
      title = (<div className="title">{this.props.data.title}</div>);
    }

    let text = null;
    if(this.props.data.text){
      if(this.props.data.dangerouslySetText){
        text = (<div className="text" dangerouslySetInnerHTML={{ __html: this.props.data.text }}/>);
      } else {
        text = (<div className="text">{this.props.data.text}</div>);
      }
    }

    let buttons = null;
    if(!this.props.data.removeClose){
      buttons = (
        <div className="buttons">
          {this.props.removeClose}
          <div className="modal_btn btn_ok" onClick={this.props.exitModal.bind(this, 'general')}>{this.props.data.exitButton ? this.props.data.exitButton : "OK"}</div>
        </div>
      );
    }
    return (
      <div className="general_modal_container">
        <div className="content">
          {title}
          {text}
        </div>
        {buttons}
      </div>
    );
  }
}

export default ReactTimeout(GeneralModal);