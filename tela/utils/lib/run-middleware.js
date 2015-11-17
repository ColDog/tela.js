function run(ctx, middleware) {
  (function next(){
    if (middleware.length > 0) {
      var f = middleware.shift();
      f.apply(ctx, [next])
    }
  })()
}

module.exports = run
