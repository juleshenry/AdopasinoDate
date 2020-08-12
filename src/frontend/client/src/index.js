import React, { Component } from "react";
import { render } from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  history,
} from "react-router-dom";
import { useForm, ErrorMessage } from "react-hook-form";
import { withRouter } from "react-router";
import { useHistory } from "react-router-dom";
import socketIOClient from 'socket.io-client';

import API from "./api.js";
import LoginForm from "./LoginForm.js";
import SignupForm from "./SignupForm.js";
import UserProfile from "./UserProfile.js";
import PeopleList from "./PeopleList.js";
import SimpleError from "./SimpleError.js";
import RecommendationList from "./RecommendationList.js";
import MatchList from "./MatchList.js";
import ChatForm from "./ChatForm.js";
import TestForm from "./TestForm.js";

const Protected = ({ authenticated, children }) =>
  authenticated ? children : null;

const INITVAL = 3;

class App extends Component {
  constructor(props) {
    super(props);

    const access_token = window.localStorage.getItem("access_token");

    this.state = {
      access_token,
      currentUser: null,
      user: null,
      people: [],
      loginForm: {
        email: "claire@example.com",
        password: "321321",
      },
      signupForm: {
        displayName: "Alicia",
        email: "alicia@example.com",
        password: "321321",
        gender: "",
        preference: "",
      },
      chatInfo: {
        userID: null,
        displayName: null,
      },
      messages: [],
    };

    this.api = API(access_token);
  }

  componentDidUpdate() {
    const { access_token } = this.state;
    window.localStorage.setItem("access_token", access_token);

    console.log("CMP did Update");

  }

  componentDidMount() {
    console.log("CMP did Mount");
    const { access_token } = this.state;
    this.loadCurrentUser();

    const socket = socketIOClient('http://localhost:3000');
    this.socket = socket;

    socket.on('getMsgs', messages => {
        this.setState({
            messages,
        });
    });

    socket.on('newChatMsg', msg => {
        this.setState({
            messages: [].concat(this.state.messages, msg),
        });
    });
  }

  sendChatMsg(text, rcp) {
      const msg = {
          sender: this.state.currentUser.userID,
          rcp,
          text,
      };

      this.setState({
          messages: [].concat(this.state.messages, msg),
      });

      this.socket.emit('chatMsg', msg);
  }

  onNameUpdate(displayName) {
    const { signupForm } = this.state;

    const updatedForm = Object.assign({}, signupForm, { displayName });

    this.setState({
      signupForm: updatedForm,
    });
  }

  onEmailUpdate(form, email) {
    const oldForm = this.state[form];

    const updateForm = Object.assign({}, oldForm, { email });
    this.setState({
      [form]: updateForm,
    });
  }

  onPasswordUpdate(form, password) {
    const oldForm = this.state[form];

    const updateForm = Object.assign({}, oldForm, { password });
    this.setState({
      [form]: updateForm,
    });
  }

  onFileSubmit() {}

  onLoginSubmit() {
    const {
      loginForm: { email, password },
    } = this.state;

    this.api
      .post({
        endpoint: "auth/login",
        body: {
          email,
          password,
        },
      })
      .then((resp) => {
        if (resp === undefined) {
          console.log("Login Failed");
        } else {
          let { access_token } = resp;
          console.log(`Access: ${access_token}`);
          this.setState({
            access_token,
          });
          this.api = API(access_token);
          this.loadCurrentUser();
        }
      })
      .catch((err) => console.log(err));
  }

  onLogoutClick() {
    localStorage.clear();
    window.location.href = "/";
  }

  loadCurrentUser() {
    this.loadUser({ id: "me" });
  }

  loadUser({ id }) {
    let userField = id === "me" ? "currentUser" : "user";
    this.setState({
      [userField]: false,
    });

    this.api
      .get({ endpoint: `api/users/${id}` })
      .then(
        ({ _id, email, displayName, gender, preference, balance, avatars, userID }) => {
          this.setState({
            [userField]: {
              _id,
              email,
              displayName,
              gender,
              preference,
              balance,
              avatars,
              userID,
            },
          });
        }
      )
      .catch((err) => {
        console.log(`fail load user with id: ${id}`);
        console.log(err);
      });
  }

  loadPeople() {
    console.log("loadpeople");
    const { people } = this.state;

    this.api
      .get({
        endpoint: "api/users",
      })
      .then((users) => {
        console.log(`Users are ${users}`);
        this.setState({ people: users });
      })
      .catch((err) => {
        console.log("fail load people");
        console.log(err);
      });
  }

  usePageViews() {
    let location = useLocation();
    console.log(location.pathname);
  }

  onFotoSubmit(filepath) {
    if (filepath == undefined) return;
    let replaceUser = this.state.currentUser;
    replaceUser.avatars = [filepath];
    this.setState({
      currentUser: replaceUser,
    });
  }

  onSignupSubmit(signupForm) {
    var uid;

    this.api
      .post({
        endpoint: "auth/signup",
        body: {
          email: signupForm.email,
          password: signupForm.password,
          displayName: signupForm.displayName,
          gender: signupForm.gender,
          preference: signupForm.preference,
          balance: INITVAL,
        },
      })
      .then(({ access_token, userID }) => {
        uid = userID;
        console.log(`Access: ${access_token}`);
        this.setState({
          access_token,
        });
        this.api = API(access_token);
        this.loadCurrentUser();
      })
      .catch((err) => console.log(err));

    this.setState({
      currentUser: {
        displayName: signupForm.displayName,
        email: signupForm.email,
        gender: signupForm.gender,
        preference: signupForm.preference,
        balance: INITVAL,
        userID: uid,
      },
      signupForm: {
        displayName: "",
        email: "",
        password: "",
        gender: "",
        preference: "",
      },
    });
  }

  vote(upOrDown, id) {
    this.api
      .get({
        endpoint: `api/users/${id}/vote/${upOrDown}`,
      })
      .then(({ user }) => {
        console.log(user);
      });
  }

  voteUp(id) {
    this.vote("up", id);
  }

  voteDown(id) {
    this.vote("down", id);
  }

  chatHandle(userID, displayName) {
    this.setState({
      chatInfo: {
        userID: userID,
        displayName: displayName,
      },
    }, () => {
      console.log('OKOK');
      console.log(this.state.chatInfo.displayName);
    });

  }

  onTestSubmit() {
    console.log("MAYWORK Works!");
  }

  render() {
    const { currentUser, user, signupForm, loginForm, people } = this.state;

    let displayLogout = (
      <li className="topnav" onClick={this.onLogoutClick}>
        <Link to="/app/logout">Logout</Link>
      </li>
    );

    let logoutLink = currentUser?.displayName ? displayLogout : null;

    let loginLink = (
      <li className={"topnav "}>
        <Link to="/app/login">Login</Link>
      </li>
    );

    let signupLink = (
      <li className="topnav ">
        <Link to="/app/signup">Signup</Link>
      </li>
    );

    let userProfLink = currentUser?.displayName ? (
      <li className={"topnav "}>
        <Link to="/app/profile">User Profile</Link>
      </li>
    ) : null;

    let recsLink = currentUser?.displayName ? (
      <li className={"topnav "}>
        <Link to="/app/recs">Recs</Link>
      </li>
    ) : null;

    let matchesLink = currentUser?.displayName ? (
      <li className={"topnav"}>
        <Link to="/app/matches">Matches</Link>
      </li>
    ) : null;

    return (
      <Router>
        <div>
          <ul className="topnav">
            {logoutLink}
            {this.state.currentUser?.avatars?.length > 0 && recsLink}
            {this.state.currentUser?.avatars?.length > 0 && matchesLink}
            {this.state.currentUser?.avatars?.length > 0 && userProfLink}
            <Route
              path="/app/login"
              render={() => (
                <div>{!this.state.currentUser?.displayName && signupLink}</div>
              )}
            />
            <Route
              path="/app/signup"
              render={() => (
                <div>{!this.state.currentUser?.displayName && loginLink}</div>
              )}
            />
          </ul>
          <div className="topnav">
            {!this.state.currentUser?.displayName && (
              <Route
                path="/app/signup"
                render={() => (
                  <SignupForm onSignupSubmit={this.onSignupSubmit.bind(this)} />
                )}
              />
            )}
            {!this.state.currentUser?.displayName && (
              <Route
                path="/app/login"
                render={() => (
                  <LoginForm
                    state={loginForm}
                    onEmailUpdate={this.onEmailUpdate.bind(this)}
                    onPasswordUpdate={this.onPasswordUpdate.bind(this)}
                    onSubmit={this.onLoginSubmit.bind(this)}
                  />
                )}
              />
            )}
            {this.state.currentUser && (
              <Route
                path="/app/profile"
                render={() => (
                  <UserProfile
                    user={currentUser}
                    onFotoSubmit={this.onFotoSubmit.bind(this)}
                    messages={ this.state.messages }
                    onSend={ this.sendChatMsg.bind(this) }
                  />
                )}
              />
            )}
            <SimpleError>
              {
                <Route
                  path="/app/recs"
                  render={() => (
                    <RecommendationList
                      api={this.api}
                      people={people}
                      loadPeople={this.loadPeople.bind(this)}
                    />
                  )}
                />
              }
            </SimpleError>

						<SimpleError>
            {<Route
                path="/app/matches"
                render={() => (
                  <MatchList
                    api={this.api}
                    chatHandle={this.chatHandle.bind(this)}
                  />
                )}
              />
            }
						</SimpleError>
						<Switch>
								<Route path="/app/user/me/profile" render={ () => (
										<UserProfile
                        state={signupForm}
                        user={currentUser}
                        messages={ this.state.messages }
                        onSend={ this.sendChatMsg.bind(this) }
                    />
								)} />
								<Route path="/app/user/:id/profile" render={ ({ match }) => (
										<UserProfile
												user={ user }
												match={ match }
												voteUp={ this.voteUp.bind(this) }
												voteDown={ this.voteDown.bind(this) }
												loadUser={ this.loadUser.bind(this) }
												/>
								)} />
						</Switch>

            {
              <Route
                path="/app/chat"
                render={() => (
                  <ChatForm
                    user={ currentUser }
                    chatInfo={ this.state.chatInfo }
                    messages={ this.state.messages }
                    onSend={ this.sendChatMsg.bind(this) }
                  />
                )}
              />
            }

          </div>
        </div>
      </Router>
    );
  }
}

const container = document.getElementById("root");

render(<App />, container);
