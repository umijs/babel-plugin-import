import _toast from "antd/lib/toast";
function a() {
  return _toast;
}
function b(toast) {
  return toast;
}
function c() {
  var toast = 'toast';
  return toast;
}
function d() {
  var toast = 'toast';
  return function () {
    return toast;
  };
}
const e = () => {
  return _toast;
};