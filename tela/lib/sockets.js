/**
 * WebSocket Request Handler
 *
 * This module provides the available socket methods to respond
 * to streams and requests. Requests simply take parameters and
 * an action and respond with the data. A stream caches the query
 * and keeps new results coming down the pipeline.
 *
 * Both are run through the app.middleware stack where you can
 * perform authentication.
 * */


'use strict'

const run = require('../utils').run

module.exports = function(app) {

  // initialize socket.io todo make this socket client agnostic
  app.io = require('socket.io').listen(app.server);

  /**
   * Socket connection
   *
   * This function below handles the main requests and responses for all of the apps
   * socket communication. Each request and stream is routed through middleware in the
   * respond function above.
   * */
  app.io.on('connection', function(socket){
    app.clients[socket.id] = []

    /**
     * Respond takes in the message from the sockets, runs the middleware
     * and routes to the appropriate function, returning the result.
     *
     * The parameters for a stream request:
     *    var msg = { query: {}, model: 'Comment', id: 'Comments' }
     *
     * this would return all comments, querying where with {}, and
     * send the data to the 'Comments' event handler.
     *
     *
     * The parameters for a request:
     *    var msg = { params: {name: 'Colin'}, action: 'create', model: 'Comments' }
     *
     * this would call create on the model 'Comments' with the parameters provided.
     *
     * todo make this function editable and configurable for different db clients
     * */
    function respond(msg) {

      // special helper function to convert tela-db
      // objects into normal javascript objects.
      function toObject(res) {
        if (typeof res === 'object') {
          return res.map((rec) => { return rec._attrs })
        } else {
          try { return res._attrs } catch (e) {}
        }
      }

      // add the main response function to the middleware. and run it.
      var middleware = app.middleware.concat([
        function() {
          var model = app.models[msg.model]
          if (!(model) || msg.notAllowed) { return } //todo send error?

          try {

            // runs the action and returns the result
            model[msg.action](msg.params).then(
              (data)  => { socket.emit(msg.id, toObject(data)) },
              (err)   => { socket.emit(msg.id, {error: err}) }
            )

            // catch any errors and send them back the stream
          } catch (err) {
            socket.emit(msg.id, {error: err})
          }
        }
      ])

      // run the middleware with msg as the context.
      run(msg, middleware)
    }

    /**
     * Database update logic
     *
     * Takes in an update event from the database, and decides whether the
     * current sockets data is stale or not. If it is stale, it runs the
     * response logic again sending it to the client if the middleware passes.
     * This means tokens must stay valid for a decent period of time. They
     * will be cached in the messages array which will be essentially read only.
     * */
    function isStale(update) {
      // iterates through all messages
      app.clients[socket.id].forEach((msg) => {

        // TODO: more advanced algorithm here to detect when queries should be rerun
        // currently this function just looks at whether the messages model has been overwritten
        // if it has, then it re-runs the query.
        if (msg.model === update.model) { respond(msg) }
      })
    }

    // responds to streams from the client.
    socket.on('stream', (msg) => {

      // adds the message to the list of messages.
      app.clients[socket.id] = app.clients[socket.id] || []
      app.clients[socket.id].push(msg)

      // register an event listener for database changes.
      app.db.on('change', isStale)

      // responds to the message.
      respond(msg, socket)
    })

    // responds to requests from the client
    socket.on('request', (msg) => { respond(msg, socket) })

    // removes client from the cache on disconnect, as well as
    // removes the database listener.
    socket.on('disconnect', () => {
      app.db.removeListener('change', isStale)
      delete app.clients[socket.id]
    })

  })
}
