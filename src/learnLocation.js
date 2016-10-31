'use strict';
const fs = require('fs')
const scanner = require('node-wifi-scanner')
const socket = require('./server').getSocket

let logStream

function scanForWifi(){
  return new Promise( (resolve, reject) => {

    let text = 'log: scanForWifi..'
    console.log(text)
    // console.log(socket());

    scanner.scan((err, networks) => {
      if (err) {
        console.error(err)
        return
      }

      let text = 'number of wifis detected: ' + networks.length
      console.log(text)

      let sortedNetworks = networks.sort(sortWifiByName)
      if (socket()) {
        socket().emit('wifiList', sortedNetworks)
      }

      resolve(sortedNetworks)
    });
  })
}

function saveTrain(rssiList){
  return new Promise( (resolve, reject) => {
    convertToTrainArray(rssiList)
    .then(addArrayToFile)
    .then(rssiTrainList =>{
      resolve(rssiTrainList)
    })
  })
}

function addArrayToFile(data){
  console.log('log: adding to file');
  return new Promise( (resolve, reject) => {
    let sample = {
      timeStamp: Date.now(),
      locationName: locationName,
      data: data
    }

    logStream.write(',\n' + JSON.stringify(sample))
    console.log(sample.timeStamp)
    resolve()
  })
}

function convertToTrainArray(wifiArray) {
  return new Promise( (resolve, reject) => {
    resolve(wifiArray.map( elm=>{
      let obj = {}
      obj[elm.mac] = dbToFloat(elm.rssi)
      return obj
    }))
  })
}

function renderScanInfo(wifiArray) {
  return new Promise( (resolve, reject) => {
    let rssiList = wifiArray.map( elm=>(
      {}[elm.ssid] = dbToFloat(elm.rssi)
    ))

    let textRender = wifiArray.reduce( (prev,elm)=>{

      let textLine = ''
      textLine += elm.ssid + ':' + elm.rssi
      while (textLine.length < 40){ textLine += ' ' }

      for (let i = 0; i < 100 + elm.rssi; i++){
        textLine += '*'
      }
      textLine += '\n'

      return prev + textLine
    },'')

    let text = textRender
    text += '\n'
    text += 'totalRssiCount: ' + wifiArray.reduce((prev,cur)=>{
      return prev + 100 + cur.rssi
    },0)

    console.log(text)

    // if (socket()) {
    //   socket().emit('wifiList', text)
    // }

    resolve()
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

    scanForWifi()
    .then(renderScanInfo)
    .then((rssiList)=>{
      resolve(rssiList)
    })
  })
}

let locationName = 'none'

function learnLocation(loc){
  return new Promise( (resolve, reject) => {
    locationName = loc
    logStream = fs.createWriteStream(__dirname+'/../data/rssi.txt', {'flags': 'a'})
    numberOfNetworks = []
    collectWifis()
    .then(saveTrain)
    .then(scanForWifi)
    .then(saveTrain)
    .then(scanForWifi)
    .then(saveTrain)
    .then(scanForWifi)
    .then(saveTrain)
    .then(scanForWifi)
    .then(saveTrain)
    .then(()=>{
      logStream.end()
      resolve()
    })
  })
}

let numberOfNetworks = []


function collectWifis(){
  return new Promise( (resolve, reject) => {
    scanForWifi()
      .then(rssiList=>{
        if (checkIfEnoughWifis(rssiList)){
          resolve(rssiList)
        }else{
          resolve(collectWifis())
        }
      })
  })
}

function checkIfEnoughWifis(rssiList){
  numberOfNetworks.push(rssiList.length)
  console.log(numberOfNetworks)

  if (socket()) {
    socket().emit('text', numberOfNetworks)
  }

  if (numberOfNetworks.length < 4 ){
    return false
  }

  let length = numberOfNetworks.length
  let elm1 = numberOfNetworks[length - 1]
  let elm2 = numberOfNetworks[length - 2]
  let elm3 = numberOfNetworks[length - 3]

  return (elm1 === elm2 && elm2 === elm3)

}

function showRSSI(){
  return new Promise( (resolve, reject) => {
    numberOfNetworks = []
    collectWifis()
    .then(scanRSSIDisplay)
    .then(scanRSSIDisplay)
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

function guessLocation(){
  return new Promise( (resolve, reject) => {
    numberOfNetworks = []
    scanForWifi()
    .then(convertToTrainArray)
    .then(rssiList=>{
      resolve(rssiList)
    })
  })
}

module.exports = {
  dbToFloat: dbToFloat,
  learnLocation: learnLocation,
  guessLocation: guessLocation,
  showRSSI: showRSSI
};
