/**
  *
  * main() will be invoked when you Run This Action.
  * 
  * @param Whisk actions accept a single parameter,
  *        which must be a JSON object.
  *
  * In this case, the params variable will look like:
  *     { "message": "xxxx" }
  *
  * @return which must be a JSON object.
  *         It will be the output of this action.
  *
  */
function main(params) {
    var messages = params.messages
    var messageList = [];    

    console.log("received " +  messages.length + " messages");

    for (i = 0; i < messages.length; i++) {
        console.log("message " + i + ": " + messages[i].value);
        messageList.push(messages[i].value);
    }

	return { "messages": messageList };
}
