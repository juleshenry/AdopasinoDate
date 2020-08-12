import React from "react";
import { withRouter } from "react-router";
import { useForm, ErrorMessage } from "react-hook-form";
import { useHistory } from "react-router-dom";

const SignupForm = (props) => {
  const { register, watch, errors, handleSubmit } = useForm();
  let history = useHistory();

  const onSubmit = (data, e) => {
    console.log(data, e);
    props.onSignupSubmit(data);
    history.push("/app/profile");
  };

  return (
    <div>
      <div>
        <div>
          <h1>Find Love</h1>
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        method="post"
        encType="multipart/form-data"
      >
        <div className="form-group">
          <label htmlFor="displayName">Username</label>
          <input
            name="displayName"
            placeholder="Enter username"
            className={`form-control ${errors.displayName ? "is-invalid" : ""}`}
            ref={register({
              required: "Username is required",
							pattern: {
								value: "(?i)^(?:(?![×Þß÷þø])[-'0-9a-zÀ-ÿ])+$"
							}
            })}
          />
          {errors.displayName && (
            <p className="warning">Username is Required</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            name="email"
            placeholder="Enter email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            ref={register({
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: "Invalid email address format",
              },
							maxLength: 32
            })}
          />
          {errors.email && <p className="warning">Email is Required</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            name="password"
            type="password"
            placeholder="Enter password"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            ref={register({
              required: "Password is required",
              validate: (value) =>
                value.length >= 8 || "Password must be 3 characters at minimum",
            })}
          />
          {errors.password && <p className="warning">Password is Invalid</p>}
        </div>

        <div className="form-group">
          <label htmlFor="passwordconfirm">Confirm Password</label>
          <input
            name="passwordconfirm"
            type="password"
            placeholder="Enter password"
            className={`form-control ${
              errors.password - confirm ? "is-invalid" : ""
            }`}
            ref={register({
              required: "Passwords must match",
              validate: (value) =>
                value === watch("password") || "Passwords must match!",
            })}
          />
          {errors.passwordconfirm && (
            <p className="warning">Passwords do not match</p>
          )}
        </div>

        <div className="form-group">
          <label className="control-label" htmlFor="gender">
            What is your gender?
            <br />
            <input
              type="radio"
              name="gender"
              id="gender-1"
              value="Female"
              ref={register({ required: true })}
              className="radio"
            />
            <label className="radio">Female</label>
            <input
              type="radio"
              name="gender"
              id="gender-2"
              value="Male"
              ref={register({ required: true })}
              className="radio"
            />
            <label className="radio">Male</label>
            <input
              type="radio"
              name="gender"
              id="gender-3"
              value="Other"
              ref={register({ required: true })}
              className="radio"
            />
            <label className="radio">Other</label>
            {errors.gender && <p className="warning">Gender is Required</p>}
          </label>
        </div>

        <div className="form-group">
          <label className="control-label" htmlFor="gender">
            What are you looking for?
            <br />
            <input
              type="radio"
              name="preference"
              id="preference-1"
              value="Female"
              ref={register({ required: true })}
              className="radio"
            />
            <label className="radio">Female</label>
            <input
              type="radio"
              name="preference"
              id="preference-2"
              value="Male"
              ref={register({ required: true })}
              className="radio"
            />
            <label className="radio">Male</label>
            <input
              type="radio"
              name="preference"
              id="preference-3"
              value="Other"
              ref={register({ required: true })}
              className="radio"
            />
            <label className="radio">Both</label>
            {errors.preference && (
              <p className="warning">Preference is Required</p>
            )}
          </label>
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default withRouter(SignupForm);
