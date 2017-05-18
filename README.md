# babel-plugin-import

Modular import plugin for babel, compatible with [antd](https://github.com/ant-design/ant-design), [antd-mobile](https://github.com/ant-design/ant-design-mobile), and so on.

[![NPM version](https://img.shields.io/npm/v/babel-plugin-import.svg?style=flat)](https://npmjs.org/package/babel-plugin-import)
[![Build Status](https://img.shields.io/travis/ant-design/babel-plugin-import.svg?style=flat)](https://travis-ci.org/ant-design/babel-plugin-import)

----

## Why babel-plugin-import

- [English Instruction](https://ant.design/docs/react/getting-started#Import-on-Demand)
- [中文说明](https://ant.design/docs/react/getting-started-cn#%E6%8C%89%E9%9C%80%E5%8A%A0%E8%BD%BD)

## Example

Converts

```javascript
import { Button } from 'antd';

ReactDOM.render(<div>
  <Button>xxxx</Button>
</div>);
```

(roughly) to

```javascript
var _button = require('antd/lib/button');

ReactDOM.render(<div>
  <_button>xxxx</_button>
</div>);
```

## Usage

```bash
npm install babel-plugin-import --save-dev
```

Via `.babelrc` or babel-loader.

```js
{
  "plugins": [["import", options]]
}
```

### options

`options` can be object.

```javascript
{
  "libraryName": "antd",
  "style": true,   // or 'css'
}
```

```javascript
{
  "libraryName": "material-ui",
  "libraryDirectory": "components",  // default: lib
  "camel2DashComponentName": false,  // default: true
}
```

`options` can be an array.

For Example: 

```javascript
[
  {
    "libraryName": "antd",
    "libraryDirectory": "lib",   // default: lib
    "style": true
  },
  {
    "libraryName": "antd-mobile",
    "libraryDirectory": "component",
  },
]
```

### style

- `["import", { "libraryName": "antd" }]`: import js modularly
- `["import", { "libraryName": "antd", "style": true }]`: import js and css modularly (LESS/Sass source files)
- `["import", { "libraryName": "antd", "style": "css" }]`: import js and css modularly (css built files)

### Note

babel-plugin-import will be not working if you add the library in webpack config [vendor](https://webpack.github.io/docs/code-splitting.html#split-app-and-vendor-code). 
