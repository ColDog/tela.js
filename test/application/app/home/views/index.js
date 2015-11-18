'use strict'

const View = require('../../../../../tela').View
const Stream = require('../../../../../tela').Stream

// This is the View, or ViewModel if you want to call it that. This is
// where you fetch your data and specify the template that will be rendered.
// the render function does different things on the server and the client.
// simply attach your data in the constructor and use it in the matching
// template.

class Home extends View {
  constructor(ctx) {
    super(ctx)
    this.template = require('./index.html')
    this.formulas = require('../../../config').formulas
  }

  static before() {
  }
}


module.exports = Home