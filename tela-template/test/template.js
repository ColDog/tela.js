var temp = `
  <h1>Hello World</h1>
  <h2>Hello again</h2>
  <p>
    Hello there everyone, this is a pretty cool thing <small>hello</small>{{ hello }}.
    <a href="hello">This is some cool stuff</a>
  </p>
  <ul>
    <li each="user in users">{{ user.name }}</li>
  </ul>

  <p stream="user">{{ user }}</p>

`

