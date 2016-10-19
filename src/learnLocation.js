'use strict';
const fs = require('fs')
const scanner = require('node-wifi-scanner')
let logStream

function scanForWifi(){
  return new Promise( (resolve, reject) => {
    console.log('log: scanning...');
    scanner.scan((err, networks) => {
      if (err) {
        console.error(err)
        return
      }

      console.log('number of wifis detected: ' + networks.length);
      resolve(networks.sort(sortWifiByName))
    });
  })
}

function saveTrain(rssiList){
  return new Promise( (resolve, reject) => {
    createTrainArray(rssiList)
    .then(rssiTrainList =>{
      resolve(rssiTrainList)
    })
  })
}

function createTrainArray(wifiArray) {
  return new Promise( (resolve, reject) => {
    resolve( wifiArray.reduce( (prev,elm)=>{
      prev[elm.mac] = dbToFloat(elm.rssi)
      return prev
    },{}) )
  })
}

function renderScanInfo(wifiArray) {
  return new Promise( (resolve, reject) => {

    let rssiList = wifiArray.reduce( (prev,elm)=>{
      prev[elm.ssid] = dbToFloat(elm.rssi)
      return prev
    },{})


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


    console.log(textRender)
    console.log('totalRssiCount: ' + wifiArray.reduce((prev,cur)=>{
      return prev + 100 + cur.rssi
    },0))

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
    collectWifis()
    .then(addToFile)
    .then(scanForWifi)
    .then(addToFile)
    .then(scanForWifi)
    .then(addToFile)
    .then(scanForWifi)
    .then(addToFile)
    .then(scanForWifi)
    .then(addToFile)
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
  console.log(numberOfNetworks);
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
  scan: scanForWifi,
  showRSSI: showRSSI
};
