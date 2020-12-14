require('dotenv').config();
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
var base64 = require('base-64');

const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

var flexChannelCreated;

function sendChatMessage(serviceSid, channelSid, chatUserName, body) {
  console.log('Sending new chat message');
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
        Authorization: `Basic ${base64.encode(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        )}`
      }
    }
  );
}

function createNewChannel(flexFlowSid, flexChatService, chatUserName) {
  return client.flexApi.channel
    .create({
      // flexFlowSid: process.env.FLEX_FLOW_SID,
      flexFlowSid: flexFlowSid,
      identity: chatUserName,
      chatUserFriendlyName: chatUserName,
      chatFriendlyName: 'Flex Custom Chat',
      target: chatUserName,
      taskAttributes:{
        conversationSID:"12345"
      },
      longLived: true
    })
    .then(channel => {
      console.log(channel);
      console.log(`Created new channel ${channel.sid}`);
     
      return client.chat
        .services(flexChatService)
        .channels(channel.sid)
        .webhooks.list()
        .then(webhooks =>{
          console.log(webhooks);
          if (webhooks.lenth >0){
            console.log(webhooks.length);
            return
          }
          return client.chat
          .services(flexChatService)
          .channels(channel.sid)
          .webhooks.create({
            type: 'webhook',
            'configuration.method': 'POST',
            'configuration.url': `${process.env.WEBHOOK_BASE_URL}/new-message?channel=${channel.sid}`,
            'configuration.filters': ['onMessageSent']
          })
          .then(() => client.chat
          .services(flexChatService)
          .channels(channel.sid)
          .webhooks.create({
            type: 'webhook',
            'configuration.method': 'POST',
            'configuration.url': `${process.env.WEBHOOK_BASE_URL}/channel-update`,
            'configuration.filters': ['onChannelUpdated']
          }))

        })

 
    })
    .then(webhook => webhook.channelSid)
    .catch(error => {
      console.log(error);
    });
}

async function resetChannel(status) {
  if (status == 'INACTIVE') {
    flexChannelCreated = false;
  }
}

async function sendMessageToFlex(msg) {
  if (!flexChannelCreated) {
    flexChannelCreated = await createNewChannel(
      process.env.FLEX_FLOW_SID,
      process.env.FLEX_CHAT_SERVICE,
      'custom-chat-user'
    );
  }
  console.log("Created channel ", flexChannelCreated);
  sendChatMessage(
    process.env.FLEX_CHAT_SERVICE,
    flexChannelCreated,
    'socketio-chat-user',
    msg
  );
}

exports.sendMessageToFlex = sendMessageToFlex;
exports.resetChannel = resetChannel;
