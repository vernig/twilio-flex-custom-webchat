require('dotenv').config();
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
var base64 = require('base-64');

const chatUserName = 'guest';
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

var flexChannel;

function sendChatMessage(serviceSid, channelSid, body) {
  const params = new URLSearchParams();
  params.append('Body', body);
  params.append('From', chatUserName);
  return fetch(
    `https://chat.twilio.com/v2/Services/${serviceSid}/Channels/${channelSid}/Messages`,
    {
      method: 'post',
      body: params,
      headers: {
        'X-Twilio-Webhook-Enabled': 'true',
        Authorization: `Basic ${base64.encode(`${ process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`)}`
      }
    }
  )
}

function createNewChannel() {
  return client.flexApi.channel
    .create({
      flexFlowSid: process.env.FLEX_FLOW_SID,
      identity: chatUserName,
      chatUserFriendlyName: chatUserName,
      chatFriendlyName: 'Flex Custom Chat',
      target: 'custom-' + (new Date()).getTime() // Using Date() to randomize Flexh Flow Channel name
    })
    .then(channel => {
      console.log(`Created new channel ${channel.sid}`);
      return client.chat
        .services(process.env.FLEX_CHAT_SERVICE)
        .channels(channel.sid)
        .webhooks.create({
          type: 'webhook',
          'configuration.method': 'POST',
          'configuration.url': `${process.env.WEBHOOK_BASE_URL}/new-message?channel=${channel.sid}`,
          'configuration.filters': ['onMessageSent']
        });
    })
    .then(webhook => webhook.channelSid)
    .catch(error => {console.log(error)})
}

async function sendMessageToFlex(msg) {
  if (!flexChannel) {
    flexChannel = await createNewChannel();
  }
  sendChatMessage(process.env.FLEX_CHAT_SERVICE, flexChannel, msg);
}

module.exports = sendMessageToFlex;
