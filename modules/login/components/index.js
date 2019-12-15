import React from 'react';
import ReactTimeout from 'react-timeout';
import player from "../../../services/player";
import user from '../../../services/user';
import { Howl, Howler } from 'howler';

import BackButton from '../../../widgets/backButton';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      student_code: {
        disable_button: true,
        error_message: ''
      },
      classroom_code: {
        disable_button: true,
        error_message: ''
      },
      login_using_email: {
        disable_button: true,
        error_message: {
          email: '',
          password: ''
        }
      }
    };

    this.audio = {};
    this.audio.click = new Howl({src: [prefixCDN('/assets/kidframe/audio/select_general.ogg'), prefixCDN('/assets/kidframe/audio/select_general.mp3')]});
    this.audio.clickGo = new Howl({src: [prefixCDN('/assets/kidframe/audio/button_start.ogg'), prefixCDN('/assets/kidframe/audio/button_start.mp3')]});

    this.clickPageButton = this.clickPageButton.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.loginStudentAccessCode = this.loginStudentAccessCode.bind(this);
    this.loginClassroomAccessCode = this.loginClassroomAccessCode.bind(this);
    this.loginUsingEmail = this.loginUsingEmail.bind(this);
  }

  componentDidMount() {
    this.props.loadingActions.loadingFinished();
    this.props.clickToPage({page: null});
    this.props.setTimeout(()=>{
      this.state.loaded = true;
      this.forceUpdate();
      this.props.setTimeout(()=>{
        this.props.clickToPage({page: 'main'});
      }, 500);
    }, 100);
  }

  loginStudentAccessCode(e) {
    e.preventDefault();
    this.state.student_code.error_message = '';
    this.forceUpdate();
    this.props.loginStudentAccessCode();
    let code = document.querySelector('#sign-in-student-code').value;
    user.loginStudentAccessCode(code)
      .then((resp)=>{
        if(resp.status==1) {
          this.props.loggedInStudentAccessCode();
          // this.props.userActions.setUser(resp);
          if(this.props.toUrl){
            let toUrl = this.props.toUrl;
            toUrl = toUrl.split('#').pop();
            toUrl = '?childId='+resp.childId + '#'+toUrl;
            this.props.router.push(toUrl);
            this.props.jumpToUrl(null);
          } else {
            this.props.router.push('?childId='+resp.childId+'#chooseQuest');
          }
        } else {
          this.props.loggedInStudentAccessCode();
          this.state.student_code.error_message = "That student code is invalid.";
          this.forceUpdate();
        }
      })
      .catch((resp)=>{
        this.props.loggedInStudentAccessCode();
        if(resp.message === 'invalid student code') {
          this.state.student_code.error_message = "That student code is invalid.";
        }
        this.forceUpdate();
      });
  }

  loginClassroomAccessCode(e) {
    e.preventDefault();
    this.state.classroom_code.error_message = '';
    this.forceUpdate();
    this.props.loginClassroomAccessCode();
    let code = document.querySelector('#sign-in-classroom-code').value;
    user.loginClassroomAccessCode(code)
      .then((resp)=>{
        if(resp.status==1) {
          this.props.loggedInClassroomAccessCode();
          if(this.props.toUrl){
            this.props.router.push(this.props.toUrl);
            this.props.jumpToUrl(null);
          } else {
            this.props.router.push('#choosePlayer');
          }
        } else {
          this.props.loggedInClassroomAccessCode();
          if(resp.message === 'invalid access code') {
            this.state.classroom_code.error_message = "That classroom code is invalid.";
          }
          this.forceUpdate();
        }
      })
      .catch((resp)=>{
        this.props.loggedInStudentAccessCode();
        if(resp.message === 'invalid access code') {
          this.state.classroom_code.error_message = "That classroom code is invalid.";
        }
        this.forceUpdate();
      });
  }

  loginUsingEmail(e) {
    e.preventDefault();
    this.state.login_using_email.error_message = {email:'', password:''};
    this.forceUpdate();
    this.props.loginUsingEmail();

    var data = {
      username: document.querySelector('#sign-in-email').value,
      password: document.querySelector('#sign-in-password').value,
    };
    // Basic front end validation
    if(!data.password.length && !data.username.length) {
      this.state.login_using_email.error_message.email = 'Please enter your email and password.';
      this.state.login_using_email.error_message.password = ' ';
      this.forceUpdate();
      this.props.loggedInUsingEmail();
      return;
    } else if(!data.password.length) {
      this.state.login_using_email.error_message.password = 'Please enter a password.';
      this.forceUpdate();
      this.props.loggedInUsingEmail();
      return;
    } else if(data.password.length < 6) {
      this.state.login_using_email.error_message.password = 'Password must be at least 6 characters long.';
      this.forceUpdate();
      this.props.loggedInUsingEmail();
      return;
    } else if(!data.username.length) {
      this.state.login_using_email.error_message.email = 'Please enter your email.';
      this.forceUpdate();
      this.props.loggedInUsingEmail();
      return;
    }

    user.loginWithEmail(data)
      .then((resp)=> {
        if(resp.responseCode==1){
          this.props.loggedInUsingEmail();
          if(this.props.toUrl){
            this.props.router.push(this.props.toUrl);
            this.props.jumpToUrl(null);
          } else {
            this.props.router.push('#choosePlayer');
          }
        } else {
          this.props.loggedInUsingEmail();
          if(resp.errors && resp.errors.includes("Incorrect username or password. Try again")) {
            this.state.login_using_email.error_message.email = 'Incorrect username or password. Please try again.';
            this.state.login_using_email.error_message.password = ' ';
          }
          this.forceUpdate();
        }
      })
      .catch((resp)=>{
        this.props.loggedInUsingEmail();
        if(resp.errors && resp.errors.includes("Incorrect username or password. Try again")) {
          this.state.login_using_email.error_message.email = 'Incorrect username or password. Please try again.';
          this.state.login_using_email.error_message.password = ' ';
        }
        this.forceUpdate();
      });

  }

  clickPageButton(page) {
    this.audio.click.play();
    this.props.clickToPage({page});
  }

  handleInputChange(event) {
    switch(event.target.id){
      case "sign-in-student-code":
        this.state.student_code.error_message = '';
        if(event.target.value.length>0){
          this.state.student_code.disable_button = false;
        } else {
          this.state.student_code.disable_button = true;
        }
        break;
      case "sign-in-classroom-code":
        this.state.classroom_code.error_message = '';
        if(event.target.value.length>0){
          this.state.classroom_code.disable_button = false;
        } else {
          this.state.classroom_code.disable_button = true;
        }
        break;
      case "sign-in-email":
      case "sign-in-password":
        this.state.login_using_email.error_message = {email:'', password:''};
        if(document.querySelector('#sign-in-email').value.length>0 && document.querySelector('#sign-in-password').value.length>0){
          this.state.login_using_email.disable_button = false;
        } else {
          this.state.login_using_email.disable_button = true;
        }
        break;
    }
    this.forceUpdate();
  }

  render() {
    let backButtonProps = {
      style: {
        position: 'static',
        display: 'inline-block',
        opacity: this.props.loading ? .5 : .75,
        pointerEvents: this.props.loading ? 'none': ''
      },
      className: 'detailPageOnboardingView',
      visible: true,
      left: 45,
      top: 80,
      text: "Back",
      destroyOnClick: true,
      click: ()=>{
        this.props.clickToPage({page: 'main'});
      }
    };

    return (
      <section className="login_screen">
        <div className="logo_container">
          <div className="edu-logo"/>
        </div>

        <div className={`menu_page main ${this.props.page==='main' ? 'active' : 'hidden'}`}>
          <h2 className="title">Sign in</h2>
          <div className="main-menu-button student-code" onClick={()=>{this.clickPageButton('student-code')}}>
            <i className="icon-user"/> <span>Sign In With Student Code</span> <i className="icon-angle-right"/>
          </div>
          <div className="main-menu-button classroom-code" onClick={()=>{this.clickPageButton('classroom-code')}}>
            <i className="icon-users"/> <span>Sign In With Classroom Access Code</span> <i className="icon-angle-right"/>
          </div>
          <div className="main-menu-button login-using-email" onClick={()=>{this.clickPageButton('login-using-email')}}>
            <i className="icon-mail-alt"/> <span>Sign In With Email and Password</span> <i className="icon-angle-right"/>
          </div>
        </div>


        <div className={`menu_page student-code ${this.props.page==='student-code' ? 'active' : 'hidden'}`}>
          <div className="top">
            <BackButton {...backButtonProps}/>
          </div>
          <h2 className="title">Student Access Code</h2>
          <div className="left">
            <form method="post" onSubmit={this.loginStudentAccessCode} autoComplete="off">
            <label htmlFor="sign-in-student-code">Enter your Student Access Code to get started</label>
            <input type="text" id="sign-in-student-code" name="student-code" className={this.state.student_code.error_message.length>0 ? 'error' : ''} required placeholder="e.g. ABC123" onChange={this.handleInputChange} autoComplete="off"/>
            <div className="errormsg" id="sign-in-classroom-code-error">
              <span>{this.state.student_code.error_message}</span>
              <i className={`icon-attention-circled ${this.state.student_code.error_message.length===0 ? 'hidden' : ''}`} />
            </div>
            <button className={`${this.state.student_code.disable_button ? 'disabled' : ''} ${this.props.loading ? ' loading' : ''}`}
            onClick={()=>{this.audio.clickGo.play()}}>Go</button>
            </form>
          </div>
        </div>

        <div className={`menu_page classroom-code ${this.props.page==='classroom-code' ? 'active' : 'hidden'}`}>
          <div className="top">
            <BackButton {...backButtonProps}/>
          </div>
          <h2 className="title">Classroom Access Code</h2>
          <div className="left">
            <form method="post" onSubmit={this.loginClassroomAccessCode} autoComplete="off">
            <label htmlFor="sign-in-classroom-code">Enter your Classroom Access Code to get started</label>
            <input type="text" id="sign-in-classroom-code" name="classroom-code" required placeholder="e.g. ABC123" onChange={this.handleInputChange} autoComplete="off"/>
            <div className="errormsg" id="sign-in-classroom-code-error">
              <span>{this.state.classroom_code.error_message}</span>
              <i className={`icon-attention-circled ${this.state.classroom_code.error_message.length===0 ? 'hidden' : ''}`} />
            </div>
            <button className={`${this.state.classroom_code.disable_button ? 'disabled' : ''} ${this.props.loading ? ' loading' : ''}`}
            onClick={()=>{this.audio.clickGo.play()}}>Go</button>
            </form>
          </div>
        </div>

        <div className={`menu_page login-using-email ${this.props.page==='login-using-email' ? 'active' : 'hidden'}`}>
          <div className="top">
            <BackButton {...backButtonProps}/>
          </div>
          <h2 className="title">Sign in to Education.com</h2>
          <div className="left">
            <form method="post" onSubmit={this.loginUsingEmail} noValidate>
              <label htmlFor="sign-in-email">Email address</label>
              <input type="email" id="sign-in-email" name="email" autoComplete="off" required onChange={this.handleInputChange}/>
              <div className="errormsg" id="sign-in-email-error">
                <span>{this.state.login_using_email.error_message.email}</span>
                <i className={`icon-attention-circled ${this.state.login_using_email.error_message.email.length===0 ? 'hidden' : ''}`} />
              </div>

              <label htmlFor="sign-in-password">Password</label>
              <input type="password" id="sign-in-password" name="password" autoComplete="off" required onChange={this.handleInputChange}/>
              <div className="errormsg" id="sign-in-password-error">
                <span>{this.state.login_using_email.error_message.password}</span>
                <i className={`icon-attention-circled ${this.state.login_using_email.error_message.password.length===0 ? 'hidden' : ''}`} />
              </div>
              <a className="forgot" href="http://www.education.com/resetpassword/" target="_blank">Forgot Password?</a>

              <button className={`${this.state.login_using_email.disable_button ? 'disabled' : ''} ${this.props.loading ? ' loading' : ''}`}
              onClick={()=>{this.audio.clickGo.play()}}>Sign In</button>
            </form>
          </div>
        </div>

        <div className={`bg_floor ${this.state.loaded ? 'loaded' : ''}`}/>
        <div className={`bg_floyd ${this.state.loaded ? 'loaded' : ''}`}/>
        <div className={`bg_birdee ${this.state.loaded ? 'loaded' : ''}`}/>
        <div className={`bg_roly ${this.state.loaded ? 'loaded' : ''}`}/>
      </section>
    );
  }
};

export default ReactTimeout(Login);
