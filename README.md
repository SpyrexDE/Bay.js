# Bay.js
![](https://img.shields.io/badge/HTML-red?style=for-the-badge&logo=html5&logoColor=white) ![](https://img.shields.io/badge/CSS-blue?&style=for-the-badge&logo=css3&logoColor=white) ![](https://img.shields.io/badge/Vanilla&nbsp;JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

Bay.is is a *vanilla* javascript framework for educational and personal purposes.
Special about this framework is its module's script handling. Instead of adding all functions and variables to a giant export default object, in Bay.js you can write your code like in normal script tags within a plain html file. **No NodeJS or js packaging needed!**

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
  
  // All reactive variables have to be declared within the 'data' object
  var data = {
    clicks: 0
  }

  // All events can be added by declaring a function with the name "on" + event name (case-insensitive)
  function onClick() {
    data.clicks += 1;
  }

  // All setters for data-variables can be added by declaring a function with the name "$_" + variable name (case-sensitive)
  function $_clicks(val) {
    console.log("Variable 'clicks' has been changed! Requested new value: " + val)

    if (val > 100) {
      // By returning "prevent_default", the value won't change
      return "prevent_default";
    } else if (val > 20) {
      // By returning a value the value will change to the given value
      return val*2;             
    }
    // By returning the val-variable the value of the variable will get updated to the new value
    return val;
  }

  // Getters for data-variables can added work the same way as setters, but use a different function naming: "$$_" + variable name (case-sensitive)
  // e.g. function $$_clicks(val)
  // Be aware: Only access the value by the val argument, otherwise a endless loop will be created.
  
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
The `:`-attributes create or overwrite the initial values of the `data` object. In this case, the initial value of the `clicks` variable (0) gets overwritten by 10. Because of that the counter of the button will start at 10 instead of 0.

<h5><samp>Thanks for reading!</samp></h5>
