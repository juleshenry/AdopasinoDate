import React, { Component } from "react";

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.onFileChange = this.onFileChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = { img: "" };
  }
  componentDidMount() {
    const { user, match, loadUser } = this.props;
    if (match && match.params.id) {
      loadUser({ id: match.params.id });
    }

  }
  onFileChange(e) {
    this.setState({ img: e.target.files[0] });
  }

  onSubmit(e) {
    e.preventDefault();
    console.log("submitted");
    var formData = new FormData();
    formData.append("img", this.state.img);
    formData.append("_id", this.props.user._id);
    let resp = fetch("http://localhost:3000/foto", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData);
        this.props.onFotoSubmit(responseData.filepath);
        return responseData;
      })
      .catch((error) => console.warn(error));
  }

  render() {
    const { user, voteUp, voteDown } = this.props;
		console.log(`GOING TO ${this.props.location?.state}`);
		console.log(this.props.location?.state);
    if (!user || !user.displayName) {
      return (
        <div>
          <h2>Loading...</h2>
        </div>
      );
    }
    let profile = "http://localhost:3000/static/";
    if (user.avatars !== undefined && user.avatars.length > 0) {
      profile += user.avatars[0]; //TODO: nasty hardcoding
    } else {
      profile += "noprofile.png";
      return (
        <div>
          <h2>Upload a Profile to Find Love!</h2>
          <img src={profile} width="180" height="300" />
          <form onSubmit={this.onSubmit}>
            <div className="form-group">
              <input type="file" onChange={this.onFileChange} />
            </div>
            <div className="form-group">
              <button type="submit">Upload</button>
            </div>
          </form>
        </div>
      );
    }
    if (!voteUp || !voteDown) {
      return (
        <div>
          <h2>{`Welcome : ${user.displayName}!`}</h2>
          <img src={profile} alt="profilepic" width="180" height="300" />
          <form onSubmit={this.onSubmit}>
            <div className="form-group">
              <input type="file" className="file" onChange={this.onFileChange} />
            </div>
            <div className="form-group">
              <button type="submit">Change Profile</button>
            </div>
          </form>
          <p>{`You have ${user.balance} Kissmet tokens!`}</p>
        </div>
      );
    } else {
      const vote = (choice) => {
        this.setState({ showResults: true });
        console.log(choice);
        choice ? voteUp(user._id) : voteDown(user._id);
      };
      return (
        <div>
          <h2>{`Meet : ${user.displayName}`}</h2>
          <img src={profile} alt="profilepic" width="180" height="300" />
          {!this.state.showResults ? (
            <div className="form-group">
              <button type="vote-up" onClick={() => vote(1)}>
                Kiss
              </button>
              <button type="vote-down" onClick={() => vote(0)}>
                Miss
              </button>
            </div>
          ) : null}
          <p>{`Gender: ${user.gender}`}</p>
          <p>{`Interested in: ${user.preference}`}</p>
        </div>
      );
    }
  }
}

export default UserProfile;
