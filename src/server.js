'use strict';

let socket = undefined

module.exports = {
  setSocket: (sock)=>{
    socket = sock
  },
  getSocket: ()=>{
    return socket
  }
};
