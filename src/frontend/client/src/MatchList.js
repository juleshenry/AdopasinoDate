import React, { Component } from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";

class MatchList extends Component {
  constructor() {
    super();
    this.state = {
      scores: [],
    };
  }
  componentDidMount() {
    const { api } = this.props;
    api
      .get({
        endpoint: "api/users/matches",
      })
      .then((res) => {
        console.log(res.users);
        this.setState({ scores: res.users });
      })
      .catch((err) => {
        console.log("fail load matches");
        console.log(err);
      });
  }

  render() {
    const { chatHandle } = this.props;
    const { scores } = this.state;
    return !scores || scores.length === 0 ? (
      <span> Loading... </span>
    ) : (
      <div>
        <h2>Matches</h2>
        <table>
          <tbody>
            {scores.map((pers, i) => (
              <tr key={i}>
                <td>{pers.displayName}</td>
                <td>
                  <Link
                    to={{
                      pathname: `/app/user/${pers._id}/profile`,
                      state: { message: 'true' },
                    }}
                  >
                    Details
                  </Link>
                  <Link
                    to="/app/chat"
                    onClick={() => chatHandle(pers.userID, pers.displayName)}
                  >
                    Chat
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

const MatchesWithRouter = withRouter(MatchList);
export default MatchesWithRouter;
