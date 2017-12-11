"use strict";

var _react = _interopRequireDefault(require("react"));

require("antd/lib/button/style");

var _Button = _interopRequireDefault(require("antd/lib/button")).default;

require("antd/lib/message/style");

var _message = _interopRequireDefault(require("antd/lib/message")).default;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_message('xxx');

ReactDOM.render(_react.default.createElement("div", null, _react.default.createElement(_Button, null, "xxxx")));
