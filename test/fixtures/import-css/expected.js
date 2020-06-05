"use strict";

var _react = _interopRequireDefault(require("react"));

require("antd/lib/message/style");

var _message = _interopRequireDefault(require("antd/lib/message"));

require("antd/lib/button/style");

var _button = _interopRequireDefault(require("antd/lib/button"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _message.default)('xxx');
ReactDOM.render(_react.default.createElement("div", null, _react.default.createElement(_button.default, null, "xxxx")));
