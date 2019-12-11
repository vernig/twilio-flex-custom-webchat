var socket = io();

document.querySelector('form').onsubmit = function(e) {
  let messageText = document.getElementById('m');
  e.preventDefault(); // prevents page reloading
  socket.emit('chat message', messageText.value);
  messageText.value = '';
  return false;
};

socket.on('chat message', function(msg){
  document.querySelector('#messages').innerHTML += `<li>${msg}</li>`;
});
