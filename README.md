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
var total = 0;

function increase() {
  total += 1;
}
```

</td>
  </tr>
</table>

## How to use

Import the library:
```html
<script src="https://raw.githubusercontent.com/SpyrexDE/Bay.js/main/src/Bay.js"></script>
```

Create your first component in a seperate html file:
```html
<template>
  <div class="box">
    <p><slot/></p>
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
  }

  .box p {
    color: whitesmoke;
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
  }
</style>

<script>
  function onClick() { // <- Events can be added by declaring a function with the name "on" + eventname. (case-insensitive)
    alert( "Box was pressed" );
  }
  
  function onMouseover() {
    this.style.zoom = "1.1";
  }

  function onMouseleave() {
    this.style.zoom = "0.9";
  }
</script>
```
To register this component run:
```js
Bay.loadComponent('path/to/example-element.html');
```

The element's tag is named the same as the file. You can use it like this:
```html
<example-element>This text will be inserted where the <slot/> tag in the template was placed.</example-element>
```
