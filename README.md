# Integrating a custom web chat channel in Flex 

For more information about this repository, have a look at [this blog post](https://www.twilio.com/blog/add-custom-chat-channel-twilio-flex)

## Implementation

### Sending Message

![image](https://user-images.githubusercontent.com/54728384/70634637-7841be00-1c2a-11ea-8326-5a53dc75a2a1.png)

## Provision your instance
* (optional) Create a new Studio Flow that contains your IVR (optional) and terminates with a `Send to Flex` widget. You can clone the default  `Webchat Flow` to start with. 

* Install dependencies
```sh
npm install
```
* Provision your instance with a new Flex Flow:
```sh
node provision
```
* This script will ask the following questions: 
  * Twilio Account SID: can be found in the [Home Page of Twilio console](https://www.twilio.com/console) for your flex project
  * Twilio Auth Token: can be found in the [Home Page of Twilio console](https://www.twilio.com/console) for your flex project
  * Studio Flow SID: this is the SID of the Studio Flow you created. If you haven't created one, you can use the default `Webchat Flow`. The SID can be found [here](https://www.twilio.com/console/studio/dashboard)
  *  Flex Chat Service SID: this is the SID of the `Flex Chat Service` that can be found [here](https://www.twilio.com/console/chat/dashboard)
* The script will:
  * Provision your Twilio Flex instance with a new Flow. You can find it listed [here](https://www.twilio.com/console/flex/messaging) 
  * Generate a new `.env` file in the `middleware` folder

## Start Middleware 
* Change directory to `middleware`
```sh
cd middleware
```
* Install dependencies
```sh
npm install
```
* Execute server
```
npm start
```

## Start frontend

The frontend chat is only provided to test the middleware. If you want to integrate a chat than the best is to use the Twilio Chat SDK

* Open a browser to https://localhost:3000
* Open your Twilio Flex instance and make sure at least one worker is available
* Type a message in the bottom text box
* Click on the [Send] Button
* A new message will appear in the browser and a new reservation will be created in Flex
* Accept the reservation and start chatting... 

![image](https://user-images.githubusercontent.com/54728384/70626271-08c4d200-1c1c-11ea-838c-654ec959e949.png)
