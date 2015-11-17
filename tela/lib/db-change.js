'use strict'

module.exports = function(app) {
  app.db.on('change', function(update){
    console.log('update called', update);

    for (var sockId in app.clients) {
      if (app.clients.hasOwnProperty(sockId)) {

        (function(sockId, queries){
          console.log('updates:', update.model, queries);

          queries.forEach(function(msg){
            if (update.model === msg.model) {
              app.db.models[msg.model].where(msg.query, function(res){
                console.log('emitting update', res);
                app.io.to(sockId).emit(msg.id, res)
              })
            }
          })

        })(
          sockId,
          app.clients[sockId]
        )

      }
    }

  });
}