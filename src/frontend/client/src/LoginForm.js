import React, { Component } from "react";
import { withRouter } from "react-router";

class LoginForm extends Component {
  render() {
    const {
      state: { email, password },
      onEmailUpdate,
      onPasswordUpdate,
      onSubmit,
			history,
    } = this.props;

    const FORM_NAME = "loginForm";

    return (
      <div>
        <h1>Login, Hotshot</h1>
        <div>
          <input
            type="email"
            onChange={(e) => onEmailUpdate(FORM_NAME, e.target.value)}
            value={email}
            placeholder="Your Email"
          />
        </div>
        <div>
          <input
            required
            type="password"
            onChange={(e) => onPasswordUpdate(FORM_NAME, e.target.value)}
            value={password}
            placeholder="Your Password"
          />
        </div>
        <div>
          <button
            type="submit"
            onClick={() => {
              onSubmit();
              history.push("/app/profile");
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }
}

const LoginFormWithRouter = withRouter(LoginForm);

export default LoginFormWithRouter;
