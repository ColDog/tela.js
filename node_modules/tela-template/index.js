function render(tpl, components) {
  var dom = parse(tpl)
  components.forEach((component) => {
    dom.search( (el) => { el.tag == component.tag } ).map( (el) => {
      el.html = component.render()
    })
  })
}