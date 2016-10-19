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

      let rssiList = networks.sort(sortWifiByName).reduce( (prev,elm)=>{
        prev[elm.mac] = dbToFloat(elm.rssi)
        return prev
      },{})

      resolve(rssiList)
    });

  })
}


function sortWifiByName(a,b){
  var nameA = a.ssid.toUpperCase(); // ignore upper and lowercase
  var nameB = b.ssid.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1
  }
  if (nameA > nameB) {
    return 1
  }
  return 0
}

function scanRSSIDisplay(){
  return new Promise( (resolve, reject) => {
    console.log('log: scanning...');
    scanner.scan((err, networks) => {
      if (err) {
        console.error(err)
        return
      }


      let textRender = ''

      let rssiList = networks.sort(sortWifiByName).reduce( (prev,elm)=>{
        prev[elm.ssid] = dbToFloat(elm.rssi)
        let textLine = ''
        textLine += elm.ssid + ':' + elm.rssi

        while (textLine.length < 40){
          textLine += ' '
        }

        for (let i = 0; i < 100 + elm.rssi; i++){
          textLine += '*'
        }

        textLine += '\n'

        textRender += textLine

        return prev

      },{})


      console.log(textRender)


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

function showRSSI(){
  return new Promise( (resolve, reject) => {
    scanRSSIDisplay()
    .then(scanRSSIDisplay)
    .then(scanRSSIDisplay)
    .then(scanRSSIDisplay)
    .then(scanRSSIDisplay)
    .then(scanRSSIDisplay)
    .then(scanRSSIDisplay)
    .then(()=>{
      resolve()
    })
  })
}

function dbToFloat(num){
  return num / 100.0 + 1
}

if (process.argv[2] !== undefined){
  learnLocation(process.argv[2])
}

module.exports = {
  dbToFloat: dbToFloat,
  learnLocation: learnLocation,
  scan: scan,
  showRSSI: showRSSI
};
