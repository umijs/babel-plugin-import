'use strict';

var _messageBox = require('antd/lib/message-box');

var _messageBox2 = _interopRequireDefault(_messageBox);

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.$prototype.$message = _messageBox2.default;
