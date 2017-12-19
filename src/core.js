const { addSideEffect, addDefault } = require('@babel/helper-module-imports');
const resolve = require('path').resolve;
const isExist = require('fs').existsSync;
const cache = {};
const cachePath = {};
const importAll = {};

module.exports = function core(defaultLibraryName) {
  return ({ types }) => {
    let specified;
    let libraryObjs;
    let selectedMethods;
    let moduleArr;

    function parseName(_str, camel2Dash) {
      if (!camel2Dash) {
        return _str;
      }
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
          style = true,
          styleLibrary,
          root = '',
          camel2Dash = true,
        } = options;
        let styleLibraryName = options.styleLibraryName;
        let _root = root;
        let isBaseStyle = true;
        let modulePathTpl;
        let styleRoot;
        let mixin = false;

        if (root) {
          _root = `/${root}`;
        }

        if (libraryObjs[methodName]) {
          path = `${libraryName}/${libDir}${_root}`;
          if (!_root) {
            importAll[path] = true;
          }
        } else {
          path = `${libraryName}/${libDir}/${parseName(methodName, camel2Dash)}`;
        }
        const _path = path;

        selectedMethods[methodName] = addDefault(file.path, path, { nameHint: methodName });
        if (styleLibrary && typeof styleLibrary === 'object') {
          styleLibraryName = styleLibrary.name;
          isBaseStyle = styleLibrary.base;
          modulePathTpl = styleLibrary.path;
          mixin = styleLibrary.mixin;
          styleRoot = styleLibrary.root;
        }
        if (styleLibraryName) {
          if (!cachePath[libraryName]) {
            const themeName = styleLibraryName.replace(/^~/, '');
            cachePath[libraryName] = styleLibraryName.indexOf('~') === 0
              ? resolve(process.cwd(), themeName)
              : `${libraryName}/${libDir}/${themeName}`;
          }

          if (libraryObjs[methodName]) {
            /* istanbul ingore next */
            if (cache[libraryName] === 2) {
              throw Error('[babel-plugin-component] If you are using both' +
                'on-demand and importing all, make sure to invoke the' +
                ' importing all first.');
            }
            if (styleRoot) {
              path = `${cachePath[libraryName]}${styleRoot}.css`;
            } else {
              path = `${cachePath[libraryName]}${_root || '/index'}.css`;
            }
            cache[libraryName] = 1;
          } else {
            if (cache[libraryName] !== 1) {
              /* if set styleLibrary.path(format: [module]/module.css) */
              const parsedMethodName = parseName(methodName, camel2Dash);
              if (modulePathTpl) {
                const modulePath = modulePathTpl.replace(/\[module]/ig, parsedMethodName);
                path = `${cachePath[libraryName]}/${modulePath}`;
              } else {
                path = `${cachePath[libraryName]}/${parsedMethodName}.css`;
              }
              if (mixin && !isExist(path)) {
                path = style === true ? `${_path}/style.css` : `${_path}/${style}`;
              }
              if (isBaseStyle) {
                addSideEffect(file.path, `${cachePath[libraryName]}/base.css`);
              }
              cache[libraryName] = 2;
            }
          }

          addDefault(file.path, path, { nameHint: methodName });
        } else {
          if (style === true) {
            addSideEffect(file.path, `${path}/style.css`);
          } else if (style) {
            addSideEffect(file.path, `${path}/${style}`);
          }
        }
      }
      return selectedMethods[methodName];
    }

    function buildExpressionHandler(node, props, path, state) {
      const file = (path && path.hub && path.hub.file) || (state && state.file);
      props.forEach(prop => {
        if (!types.isIdentifier(node[prop])) return;
        if (specified[node[prop].name]) {
          node[prop] = importMethod(node[prop].name, file, state.opts); // eslint-disable-line
        }
      });
    }

    function buildDeclaratorHandler(node, prop, path, state) {
      const file = (path && path.hub && path.hub.file) || (state && state.file);
      if (!types.isIdentifier(node[prop])) return;
      if (specified[node[prop].name]) {
        node[prop] = importMethod(node[prop].name, file, state.opts); // eslint-disable-line
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

            if (!importAll[value]) {
              path.remove();
            }
          }
        },

        CallExpression(path, state) {
          const { node } = path;
          const file = (path && path.hub && path.hub.file) || (state && state.file);
          const { name } = node.callee;

          if (types.isIdentifier(node.callee)) {
            if (specified[name]) {
              node.callee = importMethod(specified[name], file, state.opts);
            }
          } else {
            node.arguments = node.arguments.map(arg => {
              const { name: argName } = arg;
              if (specified[argName]) {
                return importMethod(specified[argName], file, state.opts);
              } else if (libraryObjs[argName]) {
                return importMethod(argName, file, state.opts);
              }
              return arg;
            });
          }
        },

        MemberExpression(path, state) {
          const { node } = path;
          const file = (path && path.hub && path.hub.file) || (state && state.file);

          if (libraryObjs[node.object.name] || specified[node.object.name]) {
            node.object = importMethod(node.object.name, file, state.opts);
          }
        },

        AssignmentExpression(path, { opts }) {
          const { node } = path;
          const { file } = path.hub;

          if (node.operator !== '=') return;
          if (libraryObjs[node.right.name] || specified[node.right.name]) {
            node.right = importMethod(node.right.name, file, opts);
          }
        },

        ArrayExpression(path, { opts }) {
          const { elements } = path.node;
          const { file } = path.hub;

          elements.forEach((item, key) => {
            if (item && (libraryObjs[item.name] || specified[item.name])) {
              elements[key] = importMethod(item.name, file, opts);
            }
          });
        },

        Property(path, state) {
          const { node } = path;
          buildDeclaratorHandler(node, 'value', path, state);
        },

        VariableDeclarator(path, state) {
          const { node } = path;
          buildDeclaratorHandler(node, 'init', path, state);
        },

        LogicalExpression(path, state) {
          const { node } = path;
          buildExpressionHandler(node, ['left', 'right'], path, state);
        },

        ConditionalExpression(path, state) {
          const { node } = path;
          buildExpressionHandler(node, ['test', 'consequent', 'alternate'], path, state);
        },

        IfStatement(path, state) {
          const { node } = path;
          buildExpressionHandler(node, ['test'], path, state);
          buildExpressionHandler(node.test, ['left', 'right'], path, state);
        },
      },
    };
  };
};
