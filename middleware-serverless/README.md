

## Twilio Functions backend to handle custom channels into Flex

### Currently working
- create a chat into flexx using call to a function `/on-custom-message` and supplying url-form encoded `from_number` (e.164) and `content` as the body of the message
- agent can view the message and reply, the response will trigger `/on-flex-message`, where you can add a request to your own service
- when the agent finishes the chat, they can **Complete** the interaction, it will call `/on-channel-updated` and remove the session key from our Sync map storage. The chat will still be present in Twilio and be seen as inactive. A new message will reactivate the chat.



### ToDo:
- add ability to update webhook urls on the channel.