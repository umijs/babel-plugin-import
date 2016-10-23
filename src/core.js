const cache = {};

export default function (defaultLibraryName) {
  return ({ types }) => {
    let specified;
    let libraryObjs;
    let selectedMethods;
    let moduleArr;

    function camel2Dash(_str) {
      const str = _str[0].toLowerCase() + _str.substr(1);
      return str.replace(/([A-Z])/g, ($1) => `-${$1.toLowerCase()}`);
    }

    function importMethod(methodName, file, opts) {
      if (!selectedMethods[methodName]) {
        let options;
        let path;

        if (Array.isArray(opts)) {
          options = opts.find(option =>
            moduleArr[methodName] === option.libraryName ||
            libraryObjs[methodName] === option.libraryName
          ); // eslint-disable-line
        }
        options = options || opts;

        const {
          libDir = 'lib',
          libraryName = defaultLibraryName,
          styleLibraryName, style,
          root = '',
        } = options;
        let _root = root;

        if (root) {
          _root = `/${root}`;
        }

        if (libraryObjs[methodName]) {
          path = `${libraryName}/${libDir}${_root}`;
        } else {
          path = `${libraryName}/${libDir}/${camel2Dash(methodName)}`;
        }

        selectedMethods[methodName] = file.addImport(path, 'default');

        if (styleLibraryName) {
          if (libraryObjs[methodName]) {
            /* istanbul ingore next */
            if (cache[libraryName] === 2) {
              throw Error('[babel-plugin-component] If you are using ' +
                'on-demand loading and importing all, make sure to invoke the' +
                ' importing all first.');
            }
            path = `${libraryName}/${libDir}/${styleLibraryName}${_root || '/index'}.css`;
            cache[libraryName] = 1;
          } else {
            if (cache[libraryName] !== 1) {
              path = `${libraryName}/${libDir}/${styleLibraryName}/${camel2Dash(methodName)}.css`;
              file.addImport(`${libraryName}/${libDir}/${styleLibraryName}/base.css`, 'default');
              cache[libraryName] = 2;
            }
          }

          file.addImport(path, 'default');
        } else {
          if (style === true) {
            file.addImport(`${path}/style.css`, 'default');
          } else if (style) {
            file.addImport(`${path}/${style}`, 'default');
          }
        }
      }
      return selectedMethods[methodName];
    }

    function buildExpressionHandler(node, props, path, opts) {
      const { file } = path.hub;
      props.forEach(prop => {
        if (!types.isIdentifier(node[prop])) return;
        if (specified[node[prop].name]) {
          node[prop] = importMethod(node[prop].name, file, opts); // eslint-disable-line
        }
      });
    }

    function buildDeclaratorHandler(node, prop, path, opts) {
      const { file } = path.hub;
      if (!types.isIdentifier(node[prop])) return;
      if (specified[node[prop].name]) {
        node[prop] = importMethod(node[prop].name, file, opts); // eslint-disable-line
      }
    }

    return {
      visitor: {

        Program() {
          specified = Object.create(null);
          libraryObjs = Object.create(null);
          selectedMethods = Object.create(null);
          moduleArr = Object.create(null);
        },

        ImportDeclaration(path, { opts }) {
          const { node } = path;
          const { value } = node.source;
          let result = {};

          if (Array.isArray(opts)) {
            result = opts.find(option => option.libraryName === value) || {};
          }
          const libraryName = result.libraryName || opts.libraryName || defaultLibraryName;

          if (value === libraryName) {
            node.specifiers.forEach(spec => {
              if (types.isImportSpecifier(spec)) {
                specified[spec.local.name] = spec.imported.name;
                moduleArr[spec.imported.name] = value;
              } else {
                libraryObjs[spec.local.name] = value;
              }
            });

            path.remove();
          }
        },

        CallExpression(path, { opts }) {
          const { node } = path;
          const { file } = path.hub;
          const { name } = node.callee;

          if (types.isIdentifier(node.callee)) {
            if (specified[name]) {
              node.callee = importMethod(specified[name], file, opts);
            }
          } else {
            node.arguments = node.arguments.map(arg => {
              const { name: argName } = arg;
              if (specified[argName]) {
                return importMethod(specified[argName], file, opts);
              } else if (libraryObjs[argName]) {
                return importMethod(argName, file, opts);
              }
              return arg;
            });
          }
        },

        MemberExpression(path, { opts }) {
          const { node } = path;
          const { file } = path.hub;

          if (libraryObjs[node.object.name] || specified[node.object.name]) {
            node.object = importMethod(node.object.name, file, opts);
          }
        },

        ArrayExpression(path, { opts }) {
          const { elements } = path.node;
          const { file } = path.hub;

          elements.forEach((item, key) => {
            if (libraryObjs[item.name] || specified[item.name]) {
              elements[key] = importMethod(item.name, file, opts);
            }
          });
        },

        Property(path, { opts }) {
          const { node } = path;
          buildDeclaratorHandler(node, 'value', path, opts);
        },
        VariableDeclarator(path, { opts }) {
          const { node } = path;
          buildDeclaratorHandler(node, 'init', path, opts);
        },

        LogicalExpression(path, { opts }) {
          const { node } = path;
          buildExpressionHandler(node, ['left', 'right'], path, opts);
        },

        ConditionalExpression(path, { opts }) {
          const { node } = path;
          buildExpressionHandler(node, ['test', 'consequent', 'alternate'], path, opts);
        },

        IfStatement(path, { opts }) {
          const { node } = path;
          buildExpressionHandler(node, ['test'], path, opts);
          buildExpressionHandler(node.test, ['left', 'right'], path, opts);
        },
      },
    };
  };
}
