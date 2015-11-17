'use strict'

module.exports = function(app) {
  app.db.on('change', function(update){
    for (var sockId in app.clients) {

      (function(sockId, queries){

        queries.forEach(function(msg){
          if (update.model === msg.model) {
            app.models[msg.model].where(msg.query)
              .then((res) => { app.io.to(sockId).emit(msg.id, res) })
          }
        })

      })(
        sockId,
        app.clients[sockId]
      )

    }
  })
}