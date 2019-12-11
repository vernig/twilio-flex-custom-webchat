require('dotenv').config();
const Inquirer = require('inquirer');
const fs = require('fs');

Inquirer.prompt([
  {
    type: 'string',
    name: 'twilioAccountSID',
    message: 'Twilio Account SID'
  },
  {
    type: 'password',
    name: 'twilioAuthToken',
    message: 'Twilio Auth Token'
  },
  {
    type: 'string',
    name: 'studioFlowSid',
    message: 'Studio Flow SID'
  },
  {
    type: 'string',
    name: 'flexChatServiceSid',
    message: 'Flex Chat Service SID'
  }
]).then(answers => {
  const client = require('twilio')(
    answers.twilioAccountSid,
    answers.twilioAuthToken
  );

  var flowOptions = {
    integrationType: 'studio',
    channelType: 'custom',
    enabled: true,
    'integration.flowSid': answers.studioFlowSid,
    contactIdentity: 'contact-identity',
    friendlyName: 'Flex Custom Channel Flow',
    chatServiceSid: answers.flexChatServiceSid
  };

  client.flexApi.flexFlow
    .create(flowOptions)
    .then(flexFlow => {
      console.log(`Created Flex Flow ${flexFlow.sid}`);
      envFileContent = `TWILIO_ACCOUNT_SID=${answers.twilioAccountSID}\n` 
        + `TWILIO_AUTH_TOKEN=${answers.twilioAuthToken}\n`
        + `FLEX_FLOW_SID=${flexFlow.sid}\n`
        + `FLEX_CHAT_SERVICE=${answers.flexChatServiceSid}`

      fs.writeFileSync('middleware/.env',envFileContent)
    })
    .catch(error => {
      console.log(error);
    });
});
