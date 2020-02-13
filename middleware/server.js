'use strict';

/**
 * Load Twilio configuration from .env config file
 */
require('dotenv').load();

const http = require('http');
const express = require('express');
const ngrok = require('ngrok');
const flex = require('./flex-custom-webchat');

// Create Express webapp and connect socket.io
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);

// Static pages goes in ./public folder
app.use(express.static('public'));

var bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/new-message', function(request, response) {
  console.log('Twilio new message webhook fired');
  if (request.body.Source === 'SDK' ) {
    io.emit('chat message', request.body.Body);
  }
  response.sendStatus(200);
});

app.post('/channel-update', function(request, response) {
  console.log('Twilio channel update webhook fired');
  console.log('Channel Status: ' + JSON.parse(request.body.Attributes).status)
  flex.resetChannel();
  response.sendStatus(200);
});

io.on('connection', function(socket) {
  console.log('User connected');
  socket.on('chat message', function(msg) {
    flex.sendMessageToFlex(msg);
    io.emit('chat message', msg);
  });
});

// Create http server and run it.
var port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log('Express server running on *:' + port);
  // Enable ngrok
  ngrok
    .connect({
      addr: port,
      subdomain: process.env.NGROK_SUBDOMAIN
    })
    .then(url => {
      console.log(`ngrok forwarding: ${url} -> http://localhost:${port}`);
      process.env.WEBHOOK_BASE_URL = url
    })
    .catch(e => {
      console.log('ngrok error: ', e);
    });
});
