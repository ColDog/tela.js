'use strict'

const run = require('../utils').run

module.exports = function(app) {
  app.io = require('socket.io').listen(app.server);

  app.io.on('connection', function(socket){
    app.clients[socket.id] = []

    socket.on('stream', function(msg){
      console.log('receiving stream', msg)
      app.clients[socket.id].push(msg)
      var model = app.models[msg.model]
      var middleware = app.middleware.concat([
        function() {
          if (!(model) || msg.notAllowed) { return }
          model.where(msg.query).then(
            (data)  => { console.log('sending stream') ; socket.emit(msg.id, data) },
            (err)   => { console.log('sending stream') ; socket.emit(msg.id, {error: err}) }
          )
        }
      ])

      run(msg, middleware)
    })

    socket.on('request', function(msg){
      var model = app.models[msg.model]
      console.log('received request', msg)
      var middleware = app.middleware.concat([
        function() {
          if (!(model) || msg.notAllowed) { return }
          model[msg.action](msg.params).then(
            (data)  => { console.log('responding', data) ; socket.emit('response'+msg.id, data) },
            (err)   => { console.log('responding err', err) ; socket.emit('response'+msg.id, {error: err}) }
          )
        }
      ])
      console.log(middleware)
      run(msg, middleware)
    })

    socket.on('disconnect', function(){
      delete app.clients[socket.id]
    })

  })
}
