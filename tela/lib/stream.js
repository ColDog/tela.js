'use strict'

class Stream {
  constructor(model, query, id) {
    this.id = id
    this.model = model
    this.query = query
    this._reactions = []
    this.data = null
    this.handler = this.handler.bind(this)
  }

  react(fn) {
    this._reactions.push(fn)
    return this
  }

  listen() {
    console.log('stream listening')
    socket.emit('stream', this.msg)
    socket.on(this.id, this.handler)
    return this
  }

  remove() {
    console.log('stream not listening')
    socket.removeListener(this.id, this.handler)
  }

  handler(data) {
    console.log('got stream data', data)
    this.data = data
    this._reactions.forEach(function(fn){
      fn(data)
    })
  }

  get msg() {
    return {
      id: this.id,
      query: this.query,
      model: this.model
    }
  }

}

function request(model, action, params) {
  var id = Math.random().toString(36).substr(2, 36);
  socket.emit('request', {
    id: id,
    model: model,
    action: action,
    params: params
  });

  return new Promise(function(resolve, reject){
    socket.on('response'+id, function(data){
      if (data && data.error) {
        reject(data)
      } else {
        resolve(data)
      }
    })
  })
}

module.exports.Stream = Stream
module.exports.request = request
