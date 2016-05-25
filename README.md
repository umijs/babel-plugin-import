# babel-plugin-component

[![NPM version](https://img.shields.io/npm/v/babel-plugin-component.svg)](https://npmjs.org/package/babel-plugin-component)
[![Build Status](https://travis-ci.org/QingWei-Li/babel-plugin-component.svg?branch=master)](https://travis-ci.org/QingWei-Li/babel-plugin-component)
[![Coverage Status](https://coveralls.io/repos/github/QingWei-Li/babel-plugin-component/badge.svg?branch=master)](https://coveralls.io/github/QingWei-Li/babel-plugin-component?branch=master)

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
- `["component", { "root": "index" }]`: main file dir
