import React, { Component } from "react";
import { withRouter } from 'react-router';

class TestForm extends Component {
  render() {

    return (
      <div>
          <h2>Find Love</h2>
          <div>
              <button type="button" onClick={ () => {
                  this.props.onSubmit();
                  console.log("Ok");
                  //history.push('/app/user/transfer');
              }}>Test</button>
          </div>
      </div>
    );
  }
}

export default TestForm;
