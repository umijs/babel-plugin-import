# babel-plugin-component

[![NPM version](https://img.shields.io/npm/v/babel-plugin-component.svg)](https://npmjs.org/package/babel-plugin-component)
[![Build Status](https://img.shields.io/travis/qingwei-li/babel-plugin-component.svg)](https://travis-ci.org/qingwei-li/babel-plugin-component)

## Install

```bash
npm install babel-plugin-component --save-dev
```

## Example

Converts

```javascript
import { Button } from 'components'
```

to

```javascript
var button = require('components/lib/button')
require('components/lib/button/style.css')
```

## Usage

Via `.babelrc` or babel-loader.

```javascript
{
  "plugins": [["component", options]]
}
```

## Multiple Module
```javascript
{
  "plugins": [xxx, ["component", [
    {
      libraryName: 'antd',
      style: true,
    },
    {
      libraryName: 'test-module',
      style: true,
    }
  ]]]
}
```

### options

- `["component"]`: import js modularly
- `["component", { "libraryName": "componnet" }]`: module name
- `["component", { "style": true }]`: import js and css from 'style.css'
- `["component", { "style": cssFilePath }]`: import style css from filePath
- `["component", { "libDir": "lib" }]`: lib directory
