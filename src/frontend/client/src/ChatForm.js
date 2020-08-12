import React, { Component } from "react";

class ChatForm extends Component {
	constructor(props) {
			super(props);

			this.state = {
					chatInputText: '',
					user: null,
			};

			this.onUpdateInput = e => {
					this.setState({
							chatInputText: e.target.value,
					});
			};

			this.sendMsg = e => {
					e.preventDefault();

					props.onSend(this.state.chatInputText, props.chatInfo.userID);

					this.setState({
							chatInputText: '',
					});
			};
	}
	componentDidMount() {
		console.log(this.props.chatInfo);
	}

  render() {
    const {
				user,
				chatInfo,
				messages = [],
		} = this.props;

		console.log(chatInfo.displayName);

	  var dispMsgs = [];

		messages.forEach((msg) => {
			if ((msg.rcp == user.userID || msg.rcp == chatInfo.userID) &&
					(msg.sender == user.userID || msg.sender == chatInfo.userID)) {
						if (msg.sender == user.userID) {
							dispMsgs.push({sender: user.displayName, text: msg.text});
						} else {
							dispMsgs.push({sender: chatInfo.displayName, text: msg.text});
						}

					}
		});

		const { chatInputText } = this.state;

    if (!user || !user.displayName) {
      return (
        <div>
          <h2>Loading...</h2>
        </div>
      );
    }
    return (
      <div>
				<div>
						<h2>{ chatInfo.displayName }</h2>
						<div>
								{
										dispMsgs.map((msg, index) => (
												<div key={ index }>
														<p>{ msg.sender }: { msg.text }</p>
												</div>
										))
								}
								<form onSubmit={ this.sendMsg }>
										<input
												onChange={ this.onUpdateInput }
												value={ chatInputText }
										/>
								</form>
						</div>
				</div>
      </div>
    );
  }
}

export default ChatForm;
