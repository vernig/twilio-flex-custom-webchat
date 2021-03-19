
const flex = require('./on-custom-message');
exports.handler = async function(context, event, callback) {

  console.log('Twilio new message webhook fired');
  if (event.body.Source === 'SDK' ) {
    console.log('chat message from Flex:', event.body.Body);
  }
  response.sendStatus(200);
};

