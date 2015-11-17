function all(list) {
  var ready = []

  return new Promise((resolve, reject) => {
    var check = () => {
      for (var i=0;i<ready.length;i++) { if (!ready[i]) return false }
      resolve(ready)
    }

    list.forEach((item) => {
      if (item instanceof Promise) {
        var id = ready.length
        ready.push(false)

        item.then(
          (data) => {
            ready[id] = true
            check()
          },
          (err) => {
            reject(err)
          }
        )

      }
    })

    check()
  })
}

module.exports = all
