'use strict'

// This is the Model that you can use to access your data. On the client
// the model refers to streams and requests. ie. when you say User.all()
// it returns a stream with all users that updates on new data. The view
// should recognize the stream and automatically update the relevant data.
// When you call User.create({name: ... }) it sends a request to the database
// asking for the 'create' action to be called on User with the specified
// parameters.


var app = require('../main')

class Comment extends app.db.Model {
  constructor(attrs) {
    super(attrs)
  }
}

module.exports = Comment
