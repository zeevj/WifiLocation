'use strict';
const fs = require('fs')

fs.readFile(__dirname+'/../data/rssi.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  let s = data
  var index = 0;
  s = s.substr(0, index) + '[' + s.substr(index + 1)

  let jsFile = s + ']'

  jsFile = JSON.parse(jsFile)

  jsFile = jsFile.filter(sample => {
    return sample.locationName === 'bar'
  })

  let macToCheck = jsFile[0].data[3].mac
  jsFile.map(sample=>{

      sample.data.map((meas,index)=>{
        if (meas.mac === macToCheck){
          console.log(meas)
        }
      })
      console.log('------------');
    //}

    // console.log('-------');
  })




});
