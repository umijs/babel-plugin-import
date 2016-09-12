'use strict';

var _style = require('antd/lib/alert2/style.css');

var _style2 = _interopRequireDefault(_style);

var _alert = require('antd/lib/alert2');

var _alert2 = _interopRequireDefault(_alert);

var _style3 = require('test-module/lib/alert/style.css');

var _style4 = _interopRequireDefault(_style3);

var _alert3 = require('test-module/lib/alert');

var _alert4 = _interopRequireDefault(_alert3);

var _style5 = require('antd/lib/button/style.css');

var _style6 = _interopRequireDefault(_style5);

var _button = require('antd/lib/button');

var _button2 = _interopRequireDefault(_button);

var _style7 = require('antd/lib/message/style.css');

var _style8 = _interopRequireDefault(_style7);

var _message = require('antd/lib/message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _message2.default)('xxx');
ReactDOM.render(React.createElement(
  'div',
  null,
  React.createElement(
    _button2.default,
    null,
    'xxxx'
  ),
  React.createElement(
    _alert4.default,
    null,
    'xxxx'
  ),
  React.createElement(
    _alert2.default,
    null,
    'xxx'
  )
));
