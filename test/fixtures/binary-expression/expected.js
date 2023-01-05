import _Button from "antd/lib/button";
const extraProps = undefined === _Button ? {
  type: 'primary'
} : {};
console.log(extraProps);