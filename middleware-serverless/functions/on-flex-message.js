
const flex = require('./on-custom-message');
exports.handler = async function(context, event, callback) {
  const response = new Twilio.Response();

  console.log('Twilio new message webhook fired', event);
  if (event.Source === 'SDK' ) {
    console.log('chat message from Flex:', event.Body);
  }

  return callback(null, {msg:"ok"})
};

