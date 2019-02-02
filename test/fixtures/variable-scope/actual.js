import { message } from 'antd';

message('xxx');

const testIf = (message) => {
  if (message) return message
}

const testIf2 = () => {
  if (message) return message
}

const testExpression = message => message + 'test'
const testExpression2 = () => message + 'test'

const testNestFunction = message => a => message
const testNestFunction2 = () => a => message

function App() {
  const message = 'xxx';
  return <div>{message}</div>;
}
