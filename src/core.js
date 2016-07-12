
export default function(defaultLibraryName) {
  return ({ types }) => {
    let specified;
    let libraryObjs;
    let selectedMethods;

    function camel2Dash(_str) {
      const str = _str[0].toLowerCase() + _str.substr(1);
      return str.replace(/([A-Z])/g, function camel2DashReplace($1) {
        return '-' + $1.toLowerCase();
      });
    }

    function importMethod(methodName, file, opts) {
      if (!selectedMethods[methodName]) {
        const { libDir = 'lib', libraryName = defaultLibraryName, style } = opts;
        const path = `${libraryName}/${libDir}/${camel2Dash(methodName)}`;
        selectedMethods[methodName] = file.addImport(path, 'default');
        if (style === true) {
          file.addImport(`${path}/style`);
        } else if(style === 'css') {
          file.addImport(`${path}/style/css`);
        }
      }
      return selectedMethods[methodName];
    }

    function buildExpressionHandler(node, props, path, opts) {
      const { file } = path.hub;
      props.forEach(prop => {
        if (!types.isIdentifier(node[prop])) return;
        if (specified[node[prop].name]) {
          node[prop] = importMethod(node[prop].name, file, opts);
        }
      });
    }

    function buildDeclaratorHandler(node, prop, path, opts) {
      const { file } = path.hub;
      if (!types.isIdentifier(node[prop])) return;
      if (specified[node[prop].name]) {
        node[prop] = importMethod(node[prop].name, file, opts);
      }
    }

    return {
      visitor: {

        Program() {
          specified = Object.create(null);
          libraryObjs = Object.create(null);
          selectedMethods = Object.create(null);
        },

        ImportDeclaration(path, { opts }) {
          const { node } = path;
          const { value } = node.source;
          const { libraryName = defaultLibraryName } = opts;
          if (value === libraryName) {
            node.specifiers.forEach(spec => {
              if (types.isImportSpecifier(spec)) {
                specified[spec.local.name] = spec.imported.name;
              } else {
                libraryObjs[spec.local.name] = true;
              }
            });
            path.remove();
          }
        },

        CallExpression(path, { opts }) {
          const { node } = path;
          const { file } = path.hub;
          const { name, object, property } = node.callee;

          if (types.isIdentifier(node.callee)) {
            if (specified[name]) {
              node.callee = importMethod(specified[name], file, opts);
            }
          } else {
            // React.createElement(Button) -> React.createElement(_Button)
            // if (object && object.name === 'React' && property && property.name === 'createElement' && node.arguments) {
              node.arguments = node.arguments.map(arg => {
                const { name: argName } = arg;
                if (specified[argName] &&
                    path.scope.hasBinding(argName) &&
                    path.scope.getBinding(argName).path.type === 'ImportSpecifier') {
                  return importMethod(specified[argName], file, opts);
                }
                return arg;
              });
            // }
          }
        },

        MemberExpression(path, { opts }) {
          const { node } = path;
          const { file } = path.hub;

          if (libraryObjs[node.object.name]) {
            // antd.Button -> _Button
            path.replaceWith(importMethod(node.property.name, file, opts));
          } else if (specified[node.object.name]) {
            node.object = importMethod(specified[node.object.name], file, opts);
          }
        },

        Property(path, {opts}) {
          const { node } = path;
          buildDeclaratorHandler(node, 'value', path, opts);
        },
        VariableDeclarator(path, {opts}) {
          const { node } = path;
          buildDeclaratorHandler(node, 'init', path, opts);
        },

        LogicalExpression(path, {opts}) {
          const { node } = path;
          buildExpressionHandler(node, ['left', 'right'], path, opts);
        },

        ConditionalExpression(path, {opts}) {
          const { node } = path;
          buildExpressionHandler(node, ['test', 'consequent', 'alternate'], path, opts);
        },

        IfStatement(path, {opts}) {
          const { node } = path;
          buildExpressionHandler(node, ['test'], path, opts);
          buildExpressionHandler(node.test, ['left', 'right'], path, opts);
        }
      },
    };

  };
}
