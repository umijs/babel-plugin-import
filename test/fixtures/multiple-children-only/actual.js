import { Component } from 'react';
import { List, TextareaItem } from 'antd-mobile';
import { createForm } from 'rc-form';

class Test extends Component {
  render() {
    const { getFieldProps } = this.props.form;
    return (
      <List>
        <TextareaItem
          {...getFieldProps('a')}
          placeholder="a"
          autoHeight
          labelNumber={5}
          />
        <TextareaItem
          {...getFieldProps('b')}
          rows={3}
          placeholder="b"
            />
      </List>
  );
  }
}

export default createForm()(Test);
