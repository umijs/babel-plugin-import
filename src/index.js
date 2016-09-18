import Plugin from './Plugin';

export default function ({ types }) {
  let plugins = null;

  // For test
  global.__clearBabelAntdPlugin = () => {
    plugins = null;
  };

  function applyInstance(method, args, context) {
    for (const plugin of plugins) {
      if (plugin[method]) {
        plugin[method].apply(plugin, [...args, context]);
      }
    }
  }

  return {
    visitor: {
      Program(path, { opts }) {
        if (!plugins) {
          if (Array.isArray(opts)) {
            plugins = opts.map(({ libraryName, libraryDirectory, style }) =>
              new Plugin(libraryName, libraryDirectory, style, types)
            );
          } else {
            opts = opts || {};
            plugins = [
              new Plugin(opts.libraryName || 'antd', opts.libraryDirectory || opts.libDir, opts.style, types)
            ];
          }
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
      ExpressionStatement(){
        applyInstance('ExpressionStatement', arguments, this);
      },
      ExportDefaultDeclaration() {
        applyInstance('ExportDefaultDeclaration', arguments, this);
      },
    },
  };

}
