'use strict'

const Stream    = require('./stream').Stream
const parse     = require('./parser')
const Observes  = require('../utils').Observed
const router    = require('./router')

class View extends Observes {
  // Lifecycle
  // 1. initialize registering all streams and their callbacks
  // 2. render the view with placeholders
  // 3. as streams update, re render the view from the state cache.

  constructor(ctx) {
    super(ctx)
    this.ctx = ctx
    this.router = router
    this.template = ''
    this.rendered = null
    this.cache = []
  }

  set state(val) {
    return state[this.ctx.state.path] = val
  }

  get state() {
    return state[this.ctx.state.path]
  }

  stream(str) {
    if (str) {
      var root = str.split('.')[0]
      if (this[root] instanceof Stream) {
        return this[root]
      }
    }
  }

  // gets the property from a name and optionally a context
  // default context is the current view element.
  prop(str, ctx) {
    ctx = ctx || this;
    if (this.stream(str)) {
      var spl = str.split('.');
      var add = ''; if (spl[1]) { add += '.' + spl[1].join('.') }
      return Function('self', 'return self.' + spl[0] + '.data' + add)(ctx)
    } else {
      return Function('self', 'return self.' + str)(ctx);
    }
  }

  get params() {
    return this.ctx.params
  }

  get path() {
    return this.ctx.path
  }

  disconnect() {
    for (var key in this) {
      if (this[key] instanceof Stream) {
        this[key].remove()
      }
    }
  }

  connect() {
    for (var key in this) {
      if (this[key] instanceof Stream) {
        this[key].listen()
      }
    }

    this.cache.forEach((element) => {
      var st = this.stream(element.attrs.stream)
      console.log('each cache', element.attrs.stream)
      if (st) { st.react(this.insert(element)) }
    })
  }

  insert(element) {
    return () => {
      console.log('calling insert', element)
      var res = this.formulas[element.formulaName].render.apply(this, [element]);
      if (res) { document.getElementById(element.id).innerHTML = res }
    }
  }


  render() {
    console.log('rendering...')

    var handleElement = (element) => {
      var formula = (element) => {
        if (this.formulas[element.tag]) {
          element.formula = this.formulas[element.tag]
          element.formulaName = element.tag
          return true
        }

        for (var key in this.formulas) {
          if (this.formulas[key].use(element)) {
            element.formula = this.formulas[key]
            element.formulaName = key
            return true
          }
        }
        return false
      }

      if (formula(element)) {
        // calculate from formula, insert the data into the template.
        var inserted = element.formula.render.apply(this, [element])
        console.log('inserting', inserted)

        if (ENV.server) {
          var placeholder = `<span id="${element.id}">${inserted ? inserted : element.raw}</span>`
          this.template = this.template.substring(0, element.start) + placeholder + this.template.substring(element.end)
        } else {
          console.log(element)
        }

        // push onto the cache, this will bootstrap the new view on start
        this.cache.push(element)

        // check if it is a stream and register a callback.
        if (ENV.client) {
          if (this.stream(element.attrs.stream)) {
            this.stream(element.attrs.stream).react(this.insert(element))
          }
        }

      }
    }

    // check first if things have been cached. If they have, we just
    // re run the cache inserting elements at the correct id. If not
    // we render the template.
    if (!this.cache[0]) {
      parse(this.template, handleElement)
      if (ENV.client) { document.getElementById('main').innerHTML = this.template }
    } else {
      // for each element in the cache insert it into the template.
      document.getElementById('main').innerHTML = this.template
      this.cache.forEach((element) => { this.insert(element)() })
    }

    if (ENV.server) {
      var bootstrap = `

<script>
  var serverCache = { path: "${this.ctx.path}", cache: ${JSON.stringify(this.cache)} }
</script>
`
      this.template += bootstrap
    }

    return this.template
  }

}

module.exports = View;
