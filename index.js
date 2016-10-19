'use strict';

const readline = require('readline');
const scan = require('./src/learnLocation').scan
const learnLocation = require('./src/learnLocation').learnLocation
const trainNetwork = require('./src/trainNetwork').trainNetwork
const checkLocation = require('./src/checkLocation').checkLocation

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});



let navStack = ['home']

rl.on('line', (line) => {

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
            }, 500);
          })
          break;
        default:
          rl.close();
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

});


function renderGui(line){
  switch (getLast(navStack)) {
    case 'home':
      console.log(`Walcome to The Mega super wifi location tracker
  Please choose what you want to do:
  [1] train a new location
  [2] calculate a new networks
  [3] guess where you are
      `)
      break
    case 'trainLocation':
      console.log('What is the name of the location?')
      break
    case 'startingToTrain':
      console.log('sampling rssi stregnth for location: ' + line)
      break
    case 'trainDone':
      console.log('\ntraining completed')
      break
    case 'calculateNetwork':
      break
    case 'startCalculateNetwork':
      console.log('\nstart Calculate Network')
      break
    case 'calculateNetworkDone':
      console.log('\nCalculate Network done\n')
      break
    case 'guessLocation':
    console.log('\nguessLocation starting');
      break
    case 'guessLocationEnd':
    console.log('\nguessLocation ended\n');
      break
    default:
  }
}

renderGui()

function getLast(arr){
  return arr.slice(-1).pop()
}
