'use strict'

const Stream    = require('./stream').Stream
const request   = require('./stream').request
const pluralize = require('pluralize')

class Model {
  constructor() {
  }

  static all() {
    return new Stream(this.name, 'where', {}, pluralize(this.name) + ':all')
  }

  static find(id) {
    return new Stream(this.name, 'where', {id: id}, pluralize(this.name) + ':find:' + id)
  }

  static where(qry) {
    return new Stream(this.name, 'where', qry, pluralize(this.name) + ':where:' + JSON.stringify(qry))
  }

  static create(params) {
    return request(this.name, 'create', params)
  }

  static update(params) {
    return request(this.name, 'update', params)
  }

  update(params) {
    return request(this.name, 'update', params)
  }

  static destroy(id) {
    return request(this.name, 'destroy', {id: id})
  }

  destroy(id) {
    return request(this.name, 'destroy', {id: id})
  }

}

module.exports = Model
