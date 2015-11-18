

function render(tpl, onelement) {
  var match;
  var rehtml = /<([^>]*)>([^>]*)<\/([^>]*)>/g
  while(match = rehtml.exec(tpl)) {
    console.log(match)
  }
}