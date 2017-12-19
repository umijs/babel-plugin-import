require("antd/lib/alert2/style.css");

var _Alert2 = _interopRequireDefault(require("antd/lib/alert2")).default;

require("test-module/lib/alert/style.css");

var _Alert = _interopRequireDefault(require("test-module/lib/alert")).default;

require("antd/lib/button/style.css");

var _Button = _interopRequireDefault(require("antd/lib/button")).default;

require("antd/lib/message/style.css");

var _message = _interopRequireDefault(require("antd/lib/message")).default;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_message('xxx');

ReactDOM.render(React.createElement("div", null, React.createElement(_Button, null, "xxxx"), React.createElement(_Alert, null, "xxxx"), React.createElement(_Alert2, null, "xxx")));
