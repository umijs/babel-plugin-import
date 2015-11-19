# babel-plugin-antd

[![NPM version](https://img.shields.io/npm/v/babel-plugin-antd.svg?style=flat)](https://npmjs.org/package/babel-plugin-antd)
[![Build Status](https://img.shields.io/travis/ant-design/babel-plugin-antd.svg?style=flat)](https://travis-ci.org/ant-design/babel-plugin-antd)

----

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

### Via `.babelrc`

```json
{
  "plugins": ["antd"]
}
```
