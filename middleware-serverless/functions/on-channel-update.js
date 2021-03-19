const flex = require('./on-custom-message'); 

exports.handler = async function(context, event, callback) {
  console.log('Twilio channel update webhook fired');
  let status = JSON.parse(event.body.Attributes).status;
  console.log('Channel Status: ' + status);
  flex.resetChannel(status);
  callback(null, 200);
};