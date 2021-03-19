
// This is your new function. To start, set the name and path on the left.

var base64 = require('base-64');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

const flexFlowSid = process.env.FLEX_FLOW_SID;
const flexChatService = process.env.FLEX_CHAT_SERVICE;

const flex = require('./utils');

exports.handler = async function(context, event, callback) {
  let client = context.getTwilioClient();
  
    const fromNumber = event.from_number;
    const msg = event.content;
    console.log(fromNumber, msg);
    var flexChannelCreated; // needs to be handled outside the function (perhaps Sync)

    if (!flexChannelCreated) {
        flexChannelCreated = await createNewChannel(
          flexFlowSid,
          flexChatService,
          fromNumber,
          client
          );
        console.log(flexChannelCreated);
    }
    let resp = await sendChatMessage(
        flexChatService,
        flexChannelCreated,
        fromNumber,
        msg
        );
    console.log(resp);

    callback(null, {msg:'ok'})
};



function createNewChannel(flexFlowSid, flexChatService, chatUserName, client) {
  return client.flexApi.channel
    .create({
      // flexFlowSid: process.env.FLEX_FLOW_SID,
      flexFlowSid: flexFlowSid,
      identity: chatUserName,
      chatUserFriendlyName: chatUserName,
      chatFriendlyName: 'Flex Custom Chat',
      target: chatUserName
    })
    .then(channel => {
      console.log(`Created new channel ${channel.sid}`);
      return client.chat
        .services(flexChatService)
        .channels(channel.sid)
        .webhooks.create({
          type: 'webhook',
          'configuration.method': 'POST',
          'configuration.url': `${process.env.WEBHOOK_BASE_URL}/on-flex-message?channel=${channel.sid}`,
          'configuration.filters': ['onMessageSent']
        })
        .then(() => client.chat
        .services(flexChatService)
        .channels(channel.sid)
        .webhooks.create({
          type: 'webhook',
          'configuration.method': 'POST',
          'configuration.url': `${process.env.WEBHOOK_BASE_URL}/on-channel-update`,
          'configuration.filters': ['onChannelUpdated']
        }))
        .catch((err)=>{
          return channel.sid
        })
    })
    .then(webhook => webhook.channelSid)
    .catch(error => {
      console.log(error);
    });
}

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

async function resetChannel(status) {
  if (status == 'INACTIVE') {
    flexChannelCreated = false;
  }
}

