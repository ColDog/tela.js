'use strict'

console.log('hello')

const app = require('../../../tela')
app.config(require('../config'))
module.exports = app

// require all your modules below. The best way to do it is to include an index
// file in each module which loads all of the routes and models into the app. that
// way below you can write something like require('./users')(app), where users is a
// flexible module, it can be stored wherever you like and required with one line in
// a new application.
require('./comments')(app)
require('./home')(app)



if (ENV.client) {
  // this is where you can put client specific code
} else if (ENV.server) {
  // this is where you can put your server specific code
}

app.start()
