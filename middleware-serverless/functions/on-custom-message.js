// This is your new function. To start, set the name and path on the left.

var base64 = require("base-64");
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");

const flexFlowSid = process.env.FLEX_FLOW_SID;
const flexChatService = process.env.FLEX_CHAT_SERVICE;
const syncServiceSid = process.env.SYNC_SID;
const syncMapSid = process.env.SYNC_MAP_SID;

exports.handler = async function (context, event, callback) {
  let client = context.getTwilioClient();

  const fromNumber = event.from_number;
  const msg = event.content;
  console.log(fromNumber, msg);
  var flexChannelCreated; // needs to be handled outside the function (perhaps Sync)

  const flexChannelSid = await getChannelSid(fromNumber, client);
  console.log(flexChannelSid);

  let resp = await sendChatMessage(
    flexChatService,
    flexChannelSid,
    fromNumber,
    msg
  );
  console.log(resp);

  callback(null, { msg: "ok" });
};

async function getChannelSid(fromNumber, client) {
  console.log("Getting channel SID for ", fromNumber);

  let sync_map_item = await client.sync
    .services(syncServiceSid)
    .syncMaps(syncMapSid)
    .syncMapItems(fromNumber)
    .fetch();

  let channelSid;
  if (sync_map_item.key) {
    console.log("Sync key found", sync_map_item.key);
    channelSid = sync_map_item.data.channelSid;
  } else {
    flexChannelCreated = await createNewChannel(
      flexFlowSid,
      flexChatService,
      fromNumber,
      client
    );
    console.log(flexChannelCreated);
    const syncMapItem = await saveChannelSid(
      fromNumber,
      flexChannelCreated,
      client
    );
    if (!syncMapItem) {
      console.log("Error occurred saving channel Sid", syncMapItem);
      return;
    }
    channelSid = flexChannelCreated;
  }
  return channelSid;
}

async function saveChannelSid(fromNumber, flexChannelCreated, client) {
  client.sync
    .services(syncServiceSid)
    .syncMaps(syncMapSid)
    .syncMapItems.create({
      key: fromNumber,
      data: {
        channelSid: flexChannelCreated,
      },
    })
    .then((sync_map_item) => {
      console.log("Successfully created ", sync_map_item);
      return sync_map_item;
    })
    .catch((err) => {
      console.log("Couldn't create sync item", err);
      return;
    });
}

async function createNewChannel(
  flexFlowSid,
  flexChatService,
  chatUserName,
  client
) {
  return (
    client.flexApi.channel
      .create({
        // flexFlowSid: process.env.FLEX_FLOW_SID,
        flexFlowSid: flexFlowSid,
        identity: chatUserName,
        chatUserFriendlyName: chatUserName,
        chatFriendlyName: "Flex Custom Chat",
        target: chatUserName,
      })
      .then(async (channel) => {
        console.log(`Created new channel ${channel.sid}`);
        return client.chat
          .services(flexChatService)
          .channels(channel.sid)
          .webhooks.create({
            type: "webhook",
            "configuration.method": "POST",
            "configuration.url": `${process.env.WEBHOOK_BASE_URL}/on-flex-message?channel=${channel.sid}`,
            "configuration.filters": ["onMessageSent"],
          })
          .then((data) => {
            console.log("data", data);
          })
          .then(() =>
            client.chat
              .services(flexChatService)
              .channels(channel.sid)
              .webhooks.create({
                type: "webhook",
                "configuration.method": "POST",
                "configuration.url": `${process.env.WEBHOOK_BASE_URL}/on-channel-update`,
                "configuration.filters": ["onChannelUpdated"],
              })
          )
          .catch((err) => {
            return channel.sid;
          });
      })
      // .then(webhook => webhook.channelSid)
      .catch((error) => {
        console.log(error);
      })
  );
}

async function sendChatMessage(serviceSid, channelSid, chatUserName, body) {
  console.log("Sending new chat message");
  const params = new URLSearchParams();
  params.append("Body", body);
  params.append("From", chatUserName);
  return fetch(
    `https://chat.twilio.com/v2/Services/${serviceSid}/Channels/${channelSid}/Messages`,
    {
      method: "post",
      body: params,
      headers: {
        "X-Twilio-Webhook-Enabled": "true",
        Authorization: `Basic ${base64.encode(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        )}`,
      },
    }
  );
}

async function resetChannel(status) {
  if (status == "INACTIVE") {
    flexChannelCreated = false;
  }
}
