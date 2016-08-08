import Plugin from './Plugin';

export default function ({ types }) {
  const instances = [
    new Plugin('antd', types),
    new Plugin('antd-mobile', types),
  ];

  function applyInstance(method, args, context) {
    for (const instance of instances) {
      if (instance[method]) {
        instance[method].apply(instance, [...args]);
      }
    }
  }

  return {
    visitor: {
      Program() {
        applyInstance('Program', arguments, this);
      },
      ImportDeclaration(path, node) {
        applyInstance('ImportDeclaration', arguments, this);
      },
      CallExpression() {
        applyInstance('CallExpression', arguments, this);
      },
      MemberExpression() {
        applyInstance('MemberExpression', arguments, this);
      },
      Property() {
        applyInstance('Property', arguments, this);
      },
      VariableDeclarator() {
        applyInstance('VariableDeclarator', arguments, this);
      },
      LogicalExpression() {
        applyInstance('LogicalExpression', arguments, this);
      },
      ConditionalExpression() {
        applyInstance('ConditionalExpression', arguments, this);
      },
      IfStatement() {
        applyInstance('IfStatement', arguments, this);
      },
      ExportDefaultDeclaration() {
        applyInstance('ExportDefaultDeclaration', arguments, this);
      },
    },
  };

}
