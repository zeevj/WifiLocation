'use strict';
const fs = require('fs')
const brain = require('brain')
const socket = require('./server').getSocket


function openRssiFile(){
  return new Promise( (resolve, reject) => {
    fs.readFile(__dirname+'/../data/rssi.txt', 'utf8', function (err,data) {
      if (err) { reject (console.log(err)) }

      let jsFile = '[' + ( data.substr(0, 1) === ','  ? data.substr(1) : data ) + ']'
      jsFile = JSON.parse(jsFile)
      resolve(jsFile)
    })
  })
}

function createArrayFromJson(jsFile){
  return new Promise( (resolve, reject) => {

    let inputPerSample = {};

    for (let key in jsFile) {
      for (let sample in jsFile[key].data){
        inputPerSample[sample] = 0
        inputPerSample.locationName = 'none'
      }
    }


    let csvArray = []

    for (let key in jsFile) {
      let smp = Object.assign({},inputPerSample)
      smp.locationName = jsFile[key].locationName
      smp.input = {}
      for (let sample in jsFile[key].data){
        Object.assign(smp.input,jsFile[key].data[sample])
      }
      csvArray.push(smp)

    }

    resolve(csvArray)
  })
}

function createCSVStringFromArray(array){

  return new Promise( (resolve, reject) => {
    let csvString = ''
    csvString = array.reduce((prev, curr, index)=>{
      if (index === 0) {
        prev += 'locationName' + ','
        for (let key in curr) {
          if ( key !== 'locationName') {
            prev += key + ','
          }
        }
        prev = prev.substring(0, prev.length - 1)
        prev += '\n'

      }

      prev += curr.locationName + ','
      for (let key in curr) {
        if ( key !== 'locationName') {
          prev += curr[key] + ','
        }
      }
      prev = prev.substring(0, prev.length - 1)
      prev += '\n'

      return  prev
    },'')

    resolve(csvString)
  })
}

function createCSVFile(){
  openRssiFile()
    .then(createArrayFromJson)
    .then(createCSVStringFromArray)
    .then(csvString=>{
      console.log(csvString)
    })
}

function trainNetwork(){
  return new Promise( (resolve, reject) => {
    openRssiFile()
      .then(createArrayFromJson)
      .then(jsFile=>{
        let netDataArray = []

        for (let key in jsFile) {
          let obj = {input: {}, output: {}}

          obj.input = jsFile[key].input,
          obj.output[jsFile[key].locationName] = 1
          netDataArray.push(obj)
        }

        console.log(netDataArray);

        let neuralNetwork = new brain.NeuralNetwork({
          // hiddenLayers: [netDataArray.length, netDataArray.length]
        })

        let trainOut = neuralNetwork.train(netDataArray,{
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

if (process.argv[2] !== undefined){
  // createCSVFile()
  trainNetwork2()
}

module.exports = {
  trainNetwork: trainNetwork
}
