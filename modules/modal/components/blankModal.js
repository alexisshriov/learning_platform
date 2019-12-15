import React from 'react';
import ReactTimeout from "react-timeout";

class BlankModal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let className = '';
        if(this.props.className) {
            className += this.props.className;
        }

        return (
            <div className={`${className}-modal-container`}>
                {this.props.children}
            </div>
        );
    }
}

export default ReactTimeout(BlankModal);