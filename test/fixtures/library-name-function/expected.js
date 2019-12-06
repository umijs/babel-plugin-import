"use strict";

var _icon = _interopRequireDefault(require("@library-name-function/components/icon"));

var _tab = _interopRequireDefault(require("@library-name-function/components/tab"));

var _select = _interopRequireDefault(require("antd/lib/select"));

var _button = _interopRequireDefault(require("antd/lib/button"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (_button.default) {
  console.log('Button');
}

if (_select.default) {
  console.log('Select');
}

if (_tab.default) {
  console.log('Tab');
}

if (_icon.default) {
  console.log('Icon');
}