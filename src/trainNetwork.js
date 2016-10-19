'use strict';
const fs = require('fs')
const brain = require('brain')


function trainNetwork(){
  return new Promise( (resolve, reject) => {
    fs.readFile(__dirname+'/../data/rssi.txt', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }

      let s = data

      if ( s.substr(0, 1) === ',' ) {
        s = '[' + s.substr(1)
      }else{
        s = '[' + s
      }

      let jsFile = s + ']'

      jsFile = JSON.parse(jsFile)

      let netData = []

      for (let key in jsFile) {
        let obj = {input: {}, output: {}}

        obj.input = jsFile[key].data,
        obj.output[jsFile[key].locationName] = 1
        netData.push(obj)
      }

      let neuralNetwork = new brain.NeuralNetwork({
        // hiddenLayers: [netData.length, netData.length]
      })

      let trainOut = neuralNetwork.train(netData,{
      errorThresh: 0.005,  // error threshold to reach
      iterations: 20000,   // maximum training iterations
      log: true,           // console.log() progress periodically
      logPeriod: 10,       // number of iterations between logging
      learningRate: 0.3    // learning rate
      })

      console.log(trainOut);

      writeNetworkToFile(neuralNetwork.toJSON())
        .then(()=>{
          resolve()
        })
    })
  })
}

function writeNetworkToFile(jsObj){
  return new Promise( (resolve, reject) => {
    const file = __dirname+'/../data/net.json'
    fs.writeFile(file, JSON.stringify(jsObj), function (err) {
      if (err)
          return console.log(err);
      resolve()
    })
  })
}

module.exports = {
  trainNetwork: trainNetwork
};
