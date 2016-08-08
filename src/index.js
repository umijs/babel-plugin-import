import Plugin from './Plugin';

export default function ({ types }) {
  let instances = null;

  // For test
  global.__clearBabelAntdPlugin = () => {
    instances = null;
  };

  function applyInstance(method, args, context) {
    for (const instance of instances) {
      if (instance[method]) {
        instance[method].apply(instance, [...args, context]);
      }
    }
  }

  return {
    visitor: {
      Program(path, { opts }) {
        if (!instances) {
          instances = opts.map(({ libraryName, libraryDirectory, style }) =>
            new Plugin(libraryName, libraryDirectory, style, types)
          );
        }
        applyInstance('Program', arguments, this);
      },
      ImportDeclaration() {
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
