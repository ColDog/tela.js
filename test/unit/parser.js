'use strict'
const Dom = require('../../tela/lib/parser')
const assert = require('assert')

let temp = `
  <h1>Hello World</h1>
  <h2>Hello again</h2>
  <p>
    Hello there everyone, this is a pretty cool thing <small>hello</small>{{ hello }}.
    <a href="hello">This is some cool stuff</a>
  </p>
  <ul>
    <li each="users"></li>
  </ul>

`

var dom = new Dom(temp)

describe('DOM', function(){
  it('selects those elements with bindings', function(done){
    dom.search((el) => { return el.binding }).map((el) => { assert(el.binding) })
    done()
  })
  it('selects those elements by name', function(done){
    dom.search((el) => { return el.tag == 'p' }).map((el) => { assert(el.tag === 'p') })
    done()
  })
  it('selects those elements by attribute', function(done){
    dom.search((el) => { return el.href == 'hello' }).map((el) => { assert(el.attrs.href === 'hello') })
    done()
  })
  it('can set the html of an element', function(done){
    dom.search((el) => { return el.attrs.each == 'users' })[0].setHtml('<p>This is the new inner html</p>')
    assert( dom.search((el) => { return el.attrs.each == 'users' })[0].children[0].tag == 'p' )
    done()
  })
  it('can traverse', function(done){
    dom.search( (el) => { return el.tag === 'h2' } )[0].each( (child) => {  } )
    var c = 0
    dom.dom.each((el) => { c++ })
    assert(c == 15)
    done()
  })
  it('can set the html beside an element', function(done){
    var each = dom.search((el) => { return el.attrs.each == 'users' })[0]
    each.parent.addHtml("<li>This is some new html</li>")
    done()
  })
})