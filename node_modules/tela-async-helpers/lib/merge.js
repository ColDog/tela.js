function merge(obj1, obj2) {
  for (var k in obj2) {
    if (obj2.hasOwnProperty(k)) {
      obj1[k] = obj2[k]
    }
  }
  return obj1
}

module.exports = merge
