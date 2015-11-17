const Benchmark = require('benchmark')
var suite = new Benchmark.Suite

var router = require('../../tela/lib/router')
var crossr = require('crossroads')


router.route('/',               function() { return 'hello' })
router.route('/users/:id',      function() { return 'hello' })
router.route('/users/new',      function() { return 'hello' })
router.route('/home/hello',     function() { return 'hello' })
router.route('/hello',          function() { return 'hello' })

crossr.addRoute('/',            function() { return 'hello' })
crossr.addRoute('/users/{id}',  function() { return 'hello' })
crossr.addRoute('/users/new',   function() { return 'hello' })
crossr.addRoute('/home/hello',  function() { return 'hello' })
crossr.addRoute('/hello',       function() { return 'hello' })

console.log(router._routes)

console.log(crossr.parse('/users/123'), true)
console.log(crossr.parse('/hello/123'), false)
console.log(crossr.parse('/home/hello'), true)
console.log(crossr.parse('/'), true)
console.log(crossr.parse('/something'), false)
console.log(crossr.parse('/nothing'), false)

console.log(router.match('/users/123'), true)
console.log(router.match('/hello/123'), false)
console.log(router.match('/home/hello'), true)
console.log(router.match('/'), true)
console.log(router.match('/something'), false)
console.log(router.match('/nothing'), false)

//suite
//  .add('crossroads', function(){
//    crossr.parse('/users/123')
//    crossr.parse('/hello/123')
//    crossr.parse('/home/hello')
//    crossr.parse('/')
//    crossr.parse('/something')
//    crossr.parse('/nothing')
//  })
//  .add('router', function(){
//    router.match('/users/123')
//    router.match('/hello/123')
//    router.match('/home/hello')
//    router.match('/')
//    router.match('/something')
//    router.match('/nothing')
//  })
//  .on('complete', function() {
//    console.log('Fastest is ' + this.filter('fastest').pluck('name'))
//  })
//  .on('cycle', function(event) {
//    console.log(String(event.target))
//  })
//  .run({ 'async': true });
