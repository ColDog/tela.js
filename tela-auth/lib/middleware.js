'use strict'

var config = require(ENV.config).auth

// config file should look like:
// permissions = {
//    admin: true,  // everything allowed
//    registered: { User: {create: true, edit: true} } // only these functions allowed
//    guest: {
//      User: {
//        edit: function() {  }
//      }
//    }
// }
// where permissions stores different roles ie. admin or guest, and
// each role refers to a model and the allowed methods.

function authMiddleware() {

}
