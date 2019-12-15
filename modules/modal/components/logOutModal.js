import React from 'react';
import {Howl} from "howler";
import user from '../../../services/user';

class LogOutModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            buttonState: ''
        };

        this.audio = {};
        this.audio.close = new Howl({src: [prefixCDN('/assets/kidframe/audio/cancel.ogg'), prefixCDN('/assets/kidframe/audio/cancel.mp3')]});

        this.closeModal = this.closeModal.bind(this);
        this.logoff = this.logoff.bind(this);
    }

    closeModal() {
        this.audio.close.play();
        this.props.exitModal('logout');
    }

    logoff() {
        this.setState({buttonState: 'active'});
        user.logout();
        this.closeModal();
    }

    render() {
        return (
            <div className="logout-content">
                <div className="logout-image"/>
                <div className="logout-message">
                    <div className="main">Do you want to sign off?</div>
                </div>
                <div className="buttons">
                    <div className="modal-btn close-btn" onClick={this.closeModal}>
                        <i className="icon-cancel"/> No</div>
                    <div className={`modal-btn logout-btn ${this.state.buttonState}`} onClick={this.logoff}>
                        <i className="icon-logout"/> Yes
                    </div>
                </div>
            </div>
        );
    }
}

export default LogOutModal;