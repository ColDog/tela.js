'use strict'

const Dom = require('../../tela/lib/parser')
const Benchmark = require('benchmark')

let temp = `
  <h1>Hello World</h1>
  <h2>Hello again</h2>
  <div>
    <react name="hello"></react>
  </div>
  <div>
    <react name="hello"></react>
  </div>

  <div>
    <react name="hello"></react>
  </div>
`
var htmlparser = require('htmlparser')
var handler = new htmlparser.DefaultHandler();
var parser = new htmlparser.Parser(handler);
var suite = new Benchmark.Suite;

suite
  .add('html parser', function(){
    return parser.parseComplete(temp)
  })
  .add('my parser', function(){
    return new Dom(temp)
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'))
  })
  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .run({ 'async': true });
