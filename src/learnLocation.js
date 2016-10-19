'use strict';
const fs = require('fs')
const scanner = require('node-wifi-scanner')
let logStream

function scan(){
  return new Promise( (resolve, reject) => {
    console.log('log: scanning...');
    scanner.scan((err, networks) => {
      if (err) {
        console.error(err)
        return
      }

      let rssiList = networks.reduce( (prev,elm)=>{
        prev[elm.mac] = dbToFloat(elm.rssi)
        return prev
      },{})

      resolve(rssiList)
    });

  })
}

function addToFile(data){
  console.log('log: adding to file');
  return new Promise( (resolve, reject) => {
    let sample = {
      timeStamp: Date.now(),
      locationName: locationName,
      data: data
    }
    // console.log(sample)
    logStream.write(',\n' + JSON.stringify(sample))
    console.log(sample.timeStamp)
    resolve()
  })
}

let locationName = 'none'

function learnLocation(loc){
  return new Promise( (resolve, reject) => {
    locationName = loc
    logStream = fs.createWriteStream(__dirname+'/../data/rssi.txt', {'flags': 'a'})
    scan()
    .then(scan)
    .then(addToFile)
    .then(scan)
    .then(addToFile)
    .then(scan)
    .then(addToFile)
    .then(scan)
    .then(addToFile)
    .then(scan)
    .then(addToFile)
    .then(scan)
    .then(addToFile)
    .then(scan)
    .then(addToFile)
    .then(scan)
    .then(addToFile)
    .then(()=>{
      logStream.end()
      resolve()
    })
  })
}


function dbToFloat(num){
  return num / 100.0 + 1
}

module.exports = {
  dbToFloat: dbToFloat,
  learnLocation: learnLocation,
  scan: scan
};

if (process.argv[2] !== undefined){
  learnLocation(process.argv[2])
}
