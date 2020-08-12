import React, { Component } from "react";
import { withRouter, Redirect } from "react-router";
import {
  BrowserRouter as Router,
  Link,
  Route,
} from "react-router-dom";
import TestForm from "./TestForm.js";


class RecommendationList extends Component {
  constructor() {
    super();
    this.state = {
      recs: [],
    };

  }
  componentDidMount() {
    const { api } = this.props;
    api
      .get({
        endpoint: "api/users/recs",
      })
      .then((users) => {
				let x = JSON.stringify(users);
				console.log(`Recs are ${x}`);
        this.setState({ recs: users });
      })
      .catch((err) => {
        console.log("fail load people");
        console.log(err);
      });
  }

  render() {
    const { recs } = this.state;

    // if (this.state.redirect) {
    //   return (<Redirect push to="/app/maywork" />);
    // }


    return (recs === undefined ^ recs.length === 0) ? (
      <span> Loading... </span>
    ) : (
			<div>
				<h2>Recommendations</h2>
	      <table>
	        <tbody>
	          {recs.map((pers) => (
	            <tr key={pers._id}>
	              <td>{pers.displayName}</td>
	              <td>
	                <Link to={`/app/user/${pers._id}/profile`}>Details</Link>
	              </td>
	            </tr>
	          ))}
	        </tbody>
	      </table>
			</div>
    );
  }
}

const RecsWithRouter = withRouter(RecommendationList);
export default RecsWithRouter;
