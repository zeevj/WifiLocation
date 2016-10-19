'use strict';
const fs = require('fs')
const brain = require('brain')
const dbToFloat = require('./learnLocation').dbToFloat
const guessLocation = require('./learnLocation').guessLocation

var neuralNetwork = new brain.NeuralNetwork();

function checkNetwork(input){
  return new Promise( (resolve, reject) => {
    let file = __dirname+'/../data/net.json'
    fs.readFile(file, 'utf8', function (err,data) {
      neuralNetwork.fromJSON(JSON.parse(data))
      var output = neuralNetwork.run(input)
      console.log(output)

      let name = ''
      let winner = 0.0
      for (let elm in output){

        if  (winner < output[elm]){
          winner = output[elm]
          name = elm

        }
      }

      console.log('\nTHE WINNER IS: ' + name  + ' ' + winner);
      resolve()
    })
  })
}


function checkLocation(){
  return new Promise( (resolve, reject) => {

    guessLocation()
    .then(guessLocation)
    .then(checkNetwork)
    .then(guessLocation)
    .then(checkNetwork)
    .then(guessLocation)
    .then(checkNetwork)
    .then(guessLocation)
    .then(checkNetwork)
    .then(guessLocation)
    .then(checkNetwork)
    .then(guessLocation)
    .then(checkNetwork)
    .then(()=>{
      resolve()
    })
  })
}

module.exports={
  checkLocation: checkLocation
}
