'use strict'

class ObservePromises {
  constructor() {
    // these aren't observed
    this._changes = {}
    this._events = {}
    this._requirements = []
    this._isReady = false

    Object.observe(this, (update)=> {
      update.forEach((changed) => {

        if (this[changed.name] instanceof Promise) {

          // set a requirement with a random id to be false, when the promise
          // is resolved, this will be set to true.
          var reqid = this._requirements.length
          this._requirements.push(false)

          // set a listener that updates this attribute with the promise data
          // on completion. It also sets the requirement to true, and calls
          // the _checkIfReady() function.
          this[changed.name].then((data) => {
            this[changed.name] = data
            this._requirements[reqid] = true
            this._checkIfReady()
          }).catch((err) => {
            this.emit('error', err)
          })
        }

        if (this._changes[changed.name]) {
          this._changes[changed.name].forEach(function(cb){
            cb(changed)
          })
        }

      })

      this._checkIfReady()
    });
  }

  returnPromise() {
    return new Promise((resolve) => {
      this.on('ready', (self) => {
        resolve.apply(self, [self])
      })
    })
  }

  ready() {}

  listenTo(attr, cb) {
    (this.listeners[attr] = this.listeners[attr] || []).push(cb)
  }

  on(event, cb) {
    (this._events[event] = this._events[event] || []).push(cb)
  }

  changed(attr, cb) {
    (this._changes[attr] = this._changes[attr] || []).push(cb)
  }

  emit(event, data) {
    if (this._events[event]) {
      this._events[event].forEach((listener)=>{
        listener.apply(this, [data])
      })
    }
  }

  _checkIfReady() {
    // the 'ready' event will be only fired once, assured by this line below
    if (this._isReady) return true

    // loop through the requirements. If any are false, we are not ready.
    for (var key in this._requirements) {
      if (!this._requirements[key]) {
        return false
      }
    }
    // if we reach here, the class is ready but
    // has not been indicated as so.
    this.emit('ready', this)
    this.ready()
    this._isReady = true
  }

}

module.exports = ObservePromises
