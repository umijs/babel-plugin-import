# babel-plugin-antd

[![NPM version](https://img.shields.io/npm/v/babel-plugin-antd.svg?style=flat)](https://npmjs.org/package/babel-plugin-antd)
[![Build Status](https://img.shields.io/travis/ant-design/babel-plugin-antd.svg?style=flat)](https://travis-ci.org/ant-design/babel-plugin-antd)

----

## CHANGELOG

0.5.1

- [#50](https://github.com/ant-design/babel-plugin-antd/pull/50) - Support both antd and antd-mobile
- [#51](https://github.com/ant-design/babel-plugin-antd/pull/51) - Support export import

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
npm install babel-plugin-antd --save-dev
```

Via `.babelrc` or babel-loader.

```js
{
  "plugins": [["antd", options]]
}
```

### options

`options` can be object.

```javascript
{
  style: true,
  libraryDirectory: "component",  // default: lib
  libraryName: "antd",            // default: antd
}
```

`options` can be an array.

For Example: 

```javascript
[
  {
    libraryName: "antd",
    libraryDirectory: "lib",   // default: lib
    style: true,
  },
  {
    libraryName: "antd-mobile",
    libraryDirectory: "component",
  },
]
```

### style

- `["antd", [{ "libraryName": "antd" }]]`: import js modularly
- `["antd", [{ "libraryName": "antd", "style": true }]]`: import js and css modularly (less source files)
- `["antd", [{ "libraryName": "antd", "style": "css" }]]`: import style css modularly (css built files)
