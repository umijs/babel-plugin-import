var _message = _interopRequireDefault(require("antd/lib/message")).default;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_message('xxx');

function App() {
  var message = 'xxx';
  return React.createElement("div", null, message);
}
