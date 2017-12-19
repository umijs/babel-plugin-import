require("element-ui/lib/button/style.css");

var _Button = _interopRequireDefault(require("element-ui/lib/button")).default;

require("element-ui/lib/message/style.css");

var _message = _interopRequireDefault(require("element-ui/lib/message")).default;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_message('xxx');

ReactDOM.render(React.createElement("div", null, React.createElement(_Button, null, "xxxx")));
