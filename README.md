# Bay.js
Bay.is is a *vanilla* javascript framework for educational and personal purposes.
Special about this framework is it's module's script handling. Instead of adding all functions and variables to a giant export default object, in Bay.js you can write your code like in normal script tags within a plain html file. **No NodeJS needed!**

## Syntax Comparison
<table align="center">
  <tr>
    <th>Vue.js</th>
    <th>Bay.js</th>
  </tr>
  <tr>
    <td>

```js
export default {
  name: "Counter",
  data: {
    total: 0
  },
  methods: {
    increase: function () {
      this.total += 1
    }
  }
}
```

</td>

<td>

```js
var data = {
  clicks: 0
}

function onClick() {
  data.clicks += 1;
}
```

</td>
  </tr>
</table>

## How to use

Import the library:
```html
<script src="https://spyrexde.github.io/Bay.js/src/Bay.js"></script>
```

Create your first component in a seperate html file:
```html
<template>
  <div class="box">
    <p><slot/></p>
    <p> Your clicks: {{ clicks }}</p>
  </div>
</template>
  
<style>
  .box {
    background: darkslategray;
    border-radius: 10px;
    padding: 20px;
    font-size: 20px;
    text-align: center;
    width: 300px;
    margin: 0 auto;
    cursor: pointer;
    user-select: none;
    transform: scale(1);
    transition: all 0.1s ease-out;
  }

  .box:active:hover {
    transform: scale(0.98);
  }

  .box p {
    color: whitesmoke;
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
  }
</style>

<script>

  var data = {
    clicks: 0
  }

  function onClick() { // <- Events can be added by declaring a function with the name "on" + eventname. (case-insensitive)
    data.clicks += 1;
  }

</script>
```
To register this component run:
```js
Bay.loadComponent('path/to/example-element.html');
```

The element's tag is named the same as the file. You can use it like this:
```html
<example-element :clicks=10>This text will be inserted where the slot tag in the template was placed.</example-element>
```
The `:`-attributes create or overwrite the initial values of the `data` object.
