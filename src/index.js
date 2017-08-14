import assert from 'assert';
import Plugin from './Plugin';

export default function ({ types }) {
  let plugins = null;

  // Only for test
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

  function Program(path, { opts = {} }) {
    // Init plugin instances once.
    if (!plugins) {
      if (Array.isArray(opts)) {
        plugins = opts.map(({
          libraryName,
          libraryDirectory,
          style,
          camel2DashComponentName,
          camel2UnderlineComponentName,
          fileName,
          customName,
        }) => {
          assert(libraryName, 'libraryName should be provided');
          return new Plugin(
            libraryName,
            libraryDirectory,
            style,
            camel2DashComponentName,
            camel2UnderlineComponentName,
            fileName,
            customName,
            types
          );
        });
      } else {
        assert(opts.libraryName, 'libraryName should be provided');
        plugins = [
          new Plugin(
            opts.libraryName,
            opts.libraryDirectory,
            opts.style,
            opts.camel2DashComponentName,
            opts.camel2UnderlineComponentName,
            opts.fileName,
            opts.customName,
            types
          ),
        ];
      }
    }
    applyInstance('Program', arguments, this);  // eslint-disable-line
  }

  const methods = [
    'ImportDeclaration',
    'CallExpression',
    'MemberExpression',
    'Property',
    'VariableDeclarator',
    'LogicalExpression',
    'ConditionalExpression',
    'IfStatement',
    'ExpressionStatement',
    'ReturnStatement',
    'ExportDefaultDeclaration',
    'BinaryExpression',
  ];

  const ret = {
    visitor: { Program },
  };

  for (const method of methods) {
    ret.visitor[method] = function () { // eslint-disable-line
      applyInstance(method, arguments, ret.visitor);  // eslint-disable-line
    };
  }

  return ret;
}
