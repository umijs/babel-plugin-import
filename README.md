# babel-plugin-antd

[![NPM version](https://img.shields.io/npm/v/babel-plugin-antd.svg?style=flat)](https://npmjs.org/package/babel-plugin-antd)
[![Build Status](https://img.shields.io/travis/ant-design/babel-plugin-antd.svg?style=flat)](https://travis-ci.org/ant-design/babel-plugin-antd)

----

## CHANGELOG

0.5.0

- [#50](https://github.com/ant-design/babel-plugin-antd/pull/50) - Support both antd and antd-mobile
- [#51](https://github.com/ant-design/babel-plugin-antd/pull/51) - Support export import

## Example

Converts

```javascript
import { Button } from 'antd';
import { Button as ButtonMobile } from 'antd-mobile';

ReactDOM.render(<div>
  <Button>xxxx</Button>
  <ButtonMobile>xxxx</ButtonMobile>
</div>);
```

(roughly) to

```javascript
var _button = require('antd/lib/button');
var _buttonMobile = require('antd-mobile/lib/button');

ReactDOM.render(<div>
  <_button>xxxx</_button>
  <_buttonMobile>xxxx</_buttonMobile>
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

### options.style

- `["antd"]`: import js modularly
- `["antd", { "style": true }]`: import js and css modularly (less source files)
- `["antd", { "style": "css" }]`: import style css modularly (css built files)
