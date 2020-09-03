import { join } from 'path';
import { addSideEffect, addDefault, addNamed } from '@babel/helper-module-imports';

function transCamel(_str, symbol) {
  const str = _str[0].toLowerCase() + _str.substr(1);
  return str.replace(/([A-Z])/g, $1 => `${symbol}${$1.toLowerCase()}`);
}

function winPath(path) {
  return path.replace(/\\/g, '/');
}

function normalizeCustomName(originCustomName) {
  // If set to a string, treat it as a JavaScript source file path.
  if (typeof originCustomName === 'string') {
    // eslint-disable-next-line import/no-dynamic-require
    const customNameExports = require(originCustomName);
    return typeof customNameExports === 'function' ? customNameExports : customNameExports.default;
  }

  return originCustomName;
}

export default class Plugin {
  constructor(
    libraryName,
    libraryDirectory,
    style,
    styleLibraryDirectory,
    customStyleName,
    camel2DashComponentName,
    camel2UnderlineComponentName,
    fileName,
    customName,
    transformToDefaultImport,
    types,
    index = 0,
  ) {
    this.libraryName = libraryName;
    this.libraryDirectory = typeof libraryDirectory === 'undefined' ? 'lib' : libraryDirectory;
    this.camel2DashComponentName =
      typeof camel2DashComponentName === 'undefined' ? true : camel2DashComponentName;
    this.camel2UnderlineComponentName = camel2UnderlineComponentName;
    this.style = style || false;
    this.styleLibraryDirectory = styleLibraryDirectory;
    this.customStyleName = normalizeCustomName(customStyleName);
    this.fileName = fileName || '';
    this.customName = normalizeCustomName(customName);
    this.transformToDefaultImport =
      typeof transformToDefaultImport === 'undefined' ? true : transformToDefaultImport;
    this.types = types;
    this.pluginStateKey = `importPluginState${index}`;
  }

  transformFilename(methodName) {
    // eslint-disable-next-line no-nested-ternary
    return this.camel2UnderlineComponentName
      ? transCamel(methodName, '_')
      : this.camel2DashComponentName
      ? transCamel(methodName, '-')
      : methodName;
  }

  getInjectStylePath(path, file, transformedMethodName) {
    let stylePath;
    const { style } = this;

    if (this.customStyleName) {
      stylePath = winPath(this.customStyleName(transformedMethodName));
    } else if (this.styleLibraryDirectory) {
      stylePath = winPath(
        join(this.libraryName, this.styleLibraryDirectory, transformedMethodName, this.fileName),
      );
    } else if (style === true) {
      stylePath = `${path}/style`;
    } else if (style === 'css') {
      stylePath = `${path}/style/css`;
    } else if (typeof style === 'function') {
      stylePath = style(path, file);
    }
    return stylePath;
  }

  importMethod(methodName, file, pluginState) {
    if (!pluginState.selectedMethods[methodName]) {
      const { style, libraryDirectory } = this;
      const transformedMethodName = this.camel2UnderlineComponentName // eslint-disable-line
        ? transCamel(methodName, '_')
        : this.camel2DashComponentName
        ? transCamel(methodName, '-')
        : methodName;
      const path = winPath(
        this.customName
          ? this.customName(transformedMethodName, file)
          : join(this.libraryName, libraryDirectory, transformedMethodName, this.fileName), // eslint-disable-line
      );
      pluginState.selectedMethods[methodName] = this.transformToDefaultImport // eslint-disable-line
        ? addDefault(file.path, path, { nameHint: methodName })
        : addNamed(file.path, methodName, path);
      if (this.customStyleName) {
        const stylePath = winPath(this.customStyleName(transformedMethodName));
        addSideEffect(file.path, `${stylePath}`);
      } else if (this.styleLibraryDirectory) {
        const stylePath = winPath(
          join(this.libraryName, this.styleLibraryDirectory, transformedMethodName, this.fileName),
        );
        addSideEffect(file.path, `${stylePath}`);
      } else if (style === true) {
        addSideEffect(file.path, `${path}/style`);
      } else if (style === 'css') {
        addSideEffect(file.path, `${path}/style/css`);
      } else if (typeof style === 'function') {
        const stylePath = style(path, file);
        if (stylePath) {
          addSideEffect(file.path, stylePath);
        }
      }
    }
    return { ...pluginState.selectedMethods[methodName] };
  }

  getPluginState(state) {
    if (!state[this.pluginStateKey]) {
      state[this.pluginStateKey] = {}; // eslint-disable-line
    }
    return state[this.pluginStateKey];
  }

  buildExpressionHandler(node, props, path, state) {
    const file = (path && path.hub && path.hub.file) || (state && state.file);
    const { types } = this;
    const pluginState = this.getPluginState(state);
    props.forEach(prop => {
      if (!types.isIdentifier(node[prop])) return;
      if (
        pluginState.specified[node[prop].name] &&
        types.isImportSpecifier(path.scope.getBinding(node[prop].name).path)
      ) {
        node[prop] = this.importMethod(pluginState.specified[node[prop].name], file, pluginState); // eslint-disable-line
      }
    });
  }

  buildDeclaratorHandler(node, prop, path, state) {
    const file = (path && path.hub && path.hub.file) || (state && state.file);
    const { types } = this;
    const pluginState = this.getPluginState(state);
    if (!types.isIdentifier(node[prop])) return;
    if (
      pluginState.specified[node[prop].name] &&
      path.scope.hasBinding(node[prop].name) &&
      path.scope.getBinding(node[prop].name).path.type === 'ImportSpecifier'
    ) {
      node[prop] = this.importMethod(pluginState.specified[node[prop].name], file, pluginState); // eslint-disable-line
    }
  }

  ProgramEnter(path, state) {
    const pluginState = this.getPluginState(state);
    pluginState.specified = Object.create(null);
    pluginState.libraryObjs = Object.create(null);
    pluginState.selectedMethods = Object.create(null);
    pluginState.pathsToRemove = [];
  }

  ProgramExit(path, state) {
    this.getPluginState(state).pathsToRemove.forEach(p => !p.removed && p.remove());
  }

  ImportDeclaration(path, state) {
    const { node } = path;

    // path maybe removed by prev instances.
    if (!node) return;

    const { value } = node.source;
    const { libraryName, libraryDirectory, types } = this;
    const pluginState = this.getPluginState(state);
    if (value === libraryName) {
      const newImports = node.specifiers
        .map(item => {
          /**
           * LibraryObjs for @MemberExpression shaking, like
           * import antd from 'antd'
           * <antd.Button />
           *
           * to
           *
           * var Button =  require("antd/lib/button")
           * <Button />
           */
          if (!types.isImportSpecifier(item)) {
            pluginState.libraryObjs[item.local.name] = true;
            return false;
          }

          const transformedMethodName = this.transformFilename(
            types.isImportSpecifier(item) ? item.imported.name : item.local.name,
          );

          const file = (path && path.hub && path.hub.file) || (state && state.file);
          const importPath = winPath(
            this.customName
              ? this.customName(transformedMethodName, file)
              : join(this.libraryName, libraryDirectory, transformedMethodName, this.fileName), // eslint-disable-line
          );
          const stylePath = this.getInjectStylePath(importPath, file, transformedMethodName);
          // eslint-disable-next-line new-cap
          return [
            stylePath ? types.ImportDeclaration([], types.StringLiteral(stylePath)) : false,
            types.ImportDeclaration(
              [
                this.transformToDefaultImport
                  ? types.importDefaultSpecifier(item.local)
                  : types.ImportNamespaceSpecifier(item.local),
              ],
              // eslint-disable-next-line new-cap
              types.StringLiteral(importPath),
            ),
          ];
        })
        .reduce((acc, val) => acc.concat(val), [])
        .filter(Boolean);
      path.replaceWithMultiple(newImports);
    }
  }

  MemberExpression(path, state) {
    const { node } = path;
    const file = (path && path.hub && path.hub.file) || (state && state.file);
    const pluginState = this.getPluginState(state);

    // multiple instance check.
    if (!node.object || !node.object.name) return;

    if (pluginState.libraryObjs[node.object.name]) {
      // antd.Button -> _Button
      path.replaceWith(this.importMethod(node.property.name, file, pluginState));
    }
  }
}
