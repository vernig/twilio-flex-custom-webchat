// This is your new function. To start, set the name and path on the left.

var base64 = require("base-64");
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");
const {saveChannelSid, getChannelSid} = require('./helpers/index');

const flexFlowSid = process.env.FLEX_FLOW_SID;
const flexChatService = process.env.FLEX_CHAT_SERVICE;
const syncServiceSid = process.env.SYNC_SID;
const syncMapSid = process.env.SYNC_MAP_SID;

exports.handler = async function (context, event, callback) {
  let client = context.getTwilioClient();

  const fromNumber = event.from_number;
  const msg = event.content;
  console.log(fromNumber, msg);

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
          `${process.env.ACCOUNT_SID}:${process.env.AUTH_TOKEN}`
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
