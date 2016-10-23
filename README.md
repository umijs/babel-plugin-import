# babel-plugin-component

[![NPM version](https://img.shields.io/npm/v/babel-plugin-component.svg)](https://npmjs.org/package/babel-plugin-component)
[![Build Status](https://travis-ci.org/QingWei-Li/babel-plugin-component.svg?branch=master)](https://travis-ci.org/QingWei-Li/babel-plugin-component)
[![Coverage Status](https://coveralls.io/repos/github/QingWei-Li/babel-plugin-component/badge.svg?branch=master)](https://coveralls.io/github/QingWei-Li/babel-plugin-component?branch=master)

## Install

```shell
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

## styleLibraryName Example

Converts

```javascript
import Components from 'components'
import { Button } from 'components'
```

to

```javascript
require('components/lib/styleLibraryName/index.css')
var button = require('components/lib/styleLibraryName/button.css')
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

### Component directory structure
```
- lib // 'libDir'
  - index.js // or custom 'root' relative path
  - style.css // or custom 'style' relative path
  - componentA
    - index.js
    - style.css
  - componentB
    - index.js
    - style.css
```

### Theme library directory structure
```
- lib
  - theme-default // 'styleLibraryName'
    - base.css // required
    - index.css // required
    - componentA.css
    - componentB.css
  - theme-material
    - ...
  - componentA
    - index.js
  - componentB
    - index.js
```

### options

- `["component"]`: import js modularly
- `["component", { "libraryName": "component" }]`: module name
- `["component", { "styleLibraryName": "theme_package" }]`: style module name
- `["component", { "styleLibraryName": "~independent_theme_package" }]`: Import a independent theme package
- `["component", { "style": true }]`: import js and css from 'style.css'
- `["component", { "style": cssFilePath }]`: import style css from filePath
- `["component", { "libDir": "lib" }]`: lib directory
- `["component", { "root": "index" }]`: main file dir
