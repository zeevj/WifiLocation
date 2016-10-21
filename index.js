'use strict';

let app = require('express')();
let server = require('http').Server(app);
const io = require('socket.io')(server);

const readline = require('readline');
const scan = require('./src/learnLocation').scan
const learnLocation = require('./src/learnLocation').learnLocation
const trainNetwork = require('./src/trainNetwork').trainNetwork
const checkLocation = require('./src/checkLocation').checkLocation
const showRSSI = require('./src/learnLocation').showRSSI
let socket = require('./src/server').getSocket
let setSocket = require('./src/server').setSocket


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


let navStack = ['home']

rl.on('line', onLineInput);

function onLineInput(line){
  switch (getLast(navStack)) {
    case 'home':
      switch (parseInt(line)) {
        case 1:
          navStack.push('trainLocation')
          renderGui()
          break;
        case 2:
          navStack.push('calculateNetwork')

          navStack.pop()
          navStack.push('startCalculateNetwork')
          renderGui()
          trainNetwork()
            .then(()=>{
              navStack.pop()
              navStack.push('calculateNetworkDone')
              renderGui()

              setTimeout(function () {
                if  (getLast(navStack) === 'calculateNetworkDone'){
                  navStack.pop()
                  renderGui()
                }
              }, 500);
            })

          break;
        case 3:
          navStack.push('guessLocation')
          renderGui()

          checkLocation().then(()=>{
            navStack.pop()
            navStack.push('guessLocationEnd')
            renderGui()

            setTimeout(function () {
              if  (getLast(navStack) === 'guessLocationEnd'){
                navStack.pop()
                renderGui()
              }
            }, 500)
          })
          break

        case 4:
          socket().emit('text', 'starting RSSI realtime list')
          showRSSI().then(()=>{
            setTimeout(function () {
              renderGui()
            }, 500)
          })
          break
        default:
          rl.close()
      }
      break
    case 'trainLocation':
        if ( line.length > 0 ){
          navStack.pop()
          navStack.push('startingToTrain')
          renderGui(line)
          learnLocation(line)
            .then(()=>{
              navStack.pop()
              navStack.push('trainDone')
              renderGui()

              setTimeout(function () {
                if  (getLast(navStack) === 'trainDone'){
                  navStack.pop()
                  renderGui()
                }

              }, 500);
            })
        }
      break
    case 'startingToTrain':
      break

    case 'trainDone':
      break
    case 'calculateNetwork':
      break
    case 'startCalculateNetwork':
      break
    case 'calculateNetworkDone':
      break
    case 'guessLocation':
      break
    default:

  }
}


function renderGui(line){

  let text = ''
  switch (getLast(navStack)) {
    case 'home':
      text = `Walcome to The Mega super wifi location tracker
  Please choose what you want to do:
  [1] train a new location
  [2] calculate a new networks
  [3] guess where you are
  [4] see RSSI realtime list
      `
      break
    case 'trainLocation':
      text = 'What is the name of the location?'
      break
    case 'startingToTrain':
      text = 'sampling rssi stregnth for location: ' + line
      break
    case 'trainDone':
      text = '\ntraining completed'
      break
    case 'calculateNetwork':
      break
    case 'startCalculateNetwork':
      text = '\nstart Calculate Network'
      break
    case 'calculateNetworkDone':
      text = '\nCalculate Network done\n'
      break
    case 'guessLocation':
    text = '\nguessLocation starting'
      break
    case 'guessLocationEnd':
    text = '\nguessLocation ended\n'
      break
    default:
  }


  console.log(text)
  
  if ( text !== '' && socket() ) {
    socket().emit('text', text)
  }
  return text
}



function getLast(arr){
  return arr.slice(-1).pop()
}



io.on('connection', function (_socket) {
  console.log('got connection');
  setSocket(_socket)
  renderGui()

  socket().on("userSend",onLineInput)

});

console.log('server starting to listen');
server.listen(8080)

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
