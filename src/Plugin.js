import { join } from 'path';
import { addSideEffect, addDefault, addNamed } from '@babel/helper-module-imports';

function camel2Dash(_str) {
  const str = _str[0].toLowerCase() + _str.substr(1);
  return str.replace(/([A-Z])/g, ($1) => `-${$1.toLowerCase()}`);
}

function camel2Underline(_str) {
  const str = _str[0].toLowerCase() + _str.substr(1);
  return str.replace(/([A-Z])/g, ($1) => `_${$1.toLowerCase()}`);
}

function winPath(path) {
  return path.replace(/\\/g, '/');
}

export default class Plugin {
  constructor(
    libraryName,
    libraryDirectory,
    style,
    camel2DashComponentName,
    camel2UnderlineComponentName,
    fileName,
    customName,
    transformToDefaultImport,
    types
  ) {
    this.libraryName = libraryName;
    this.libraryDirectory = typeof libraryDirectory === 'undefined'
      ? 'lib'
      : libraryDirectory;
    this.camel2DashComponentName = typeof camel2DashComponentName === 'undefined'
      ? true
      : camel2DashComponentName;
    this.camel2UnderlineComponentName = camel2UnderlineComponentName;
    this.style = style || false;
    this.fileName = fileName || '';
    this.customName = customName;
    this.transformToDefaultImport = typeof transformToDefaultImport === 'undefined'
      ? true
      : transformToDefaultImport;
    this.types = types;
  }

  isInGlobalScope(path, name, state) {
    const parentPath = path.findParent((_path) =>
    _path.scope.hasOwnBinding(state.specified[name]));
    return !!parentPath && parentPath.isProgram();
  }

  importMethod(methodName, file, state) {
    if (!state.selectedMethods[methodName]) {
      const libraryDirectory = this.libraryDirectory;
      const style = this.style;
      const transformedMethodName = this.camel2UnderlineComponentName  // eslint-disable-line
        ? camel2Underline(methodName)
        : this.camel2DashComponentName
          ? camel2Dash(methodName)
          : methodName;
      const path = winPath(
        this.customName ? this.customName(transformedMethodName) : join(this.libraryName, libraryDirectory, transformedMethodName, this.fileName) // eslint-disable-line
      );
      state.selectedMethods[methodName] = this.transformToDefaultImport
        ? addDefault(file.path, path, { nameHint: methodName })
        : addNamed(file.path, methodName, path);
      if (style === true) {
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
    return Object.assign({}, state.selectedMethods[methodName]);
  }

  buildExpressionHandler(node, props, path, state) {
    const file = (path && path.hub && path.hub.file) || (state && state.file);
    const types = this.types;
    props.forEach(prop => {
      if (!types.isIdentifier(node[prop])) return;
      if (state.specified[node[prop].name]) {
        node[prop] = this.importMethod(state.specified[node[prop].name], file, state);  // eslint-disable-line
      }
    });
  }

  buildDeclaratorHandler(node, prop, path, state) {
    const file = (path && path.hub && path.hub.file) || (state && state.file);
    const types = this.types;
    if (!types.isIdentifier(node[prop])) return;
    if (state.specified[node[prop].name] &&
      path.scope.hasBinding(node[prop].name) &&
      path.scope.getBinding(node[prop].name).path.type === 'ImportSpecifier') {
      node[prop] = this.importMethod(node[prop].name, file, state);  // eslint-disable-line
    }
  }

  ProgramEnter(path, state) {
    state.specified = Object.create(null);
    state.libraryObjs = Object.create(null);
    state.selectedMethods = Object.create(null);
    state.pathsToRemove = [];
  }

  ProgramExit(path, state) {
    state.pathsToRemove.forEach(p => !p.removed && p.remove());
  }

  ImportDeclaration(path, state) {
    const { node } = path;

    // path maybe removed by prev instances.
    if (!node) return;

    const { value } = node.source;
    const libraryName = this.libraryName;
    const types = this.types;
    if (value === libraryName) {
      node.specifiers.forEach(spec => {
        if (types.isImportSpecifier(spec)) {
          state.specified[spec.local.name] = spec.imported.name;
        } else {
          state.libraryObjs[spec.local.name] = true;
        }
      });
      state.pathsToRemove.push(path);
    }
  }

  CallExpression(path, state) {
    const { node } = path;
    const file = (path && path.hub && path.hub.file) || (state && state.file);
    const { name } = node.callee;
    const types = this.types;

    if (types.isIdentifier(node.callee)) {
      if (state.specified[name]) {
        node.callee = this.importMethod(state.specified[name], file, state);
      }
    }

    node.arguments = node.arguments.map(arg => {
      const { name: argName } = arg;
      if (state.specified[argName] &&
        path.scope.hasBinding(argName) &&
        path.scope.getBinding(argName).path.type === 'ImportSpecifier') {
        return this.importMethod(state.specified[argName], file, state);
      }
      return arg;
    });
  }

  MemberExpression(path, state) {
    const { node } = path;
    const file = (path && path.hub && path.hub.file) || (state && state.file);

    // multiple instance check.
    if (!node.object || !node.object.name) return;

    if (state.libraryObjs[node.object.name]) {
      // antd.Button -> _Button
      path.replaceWith(this.importMethod(node.property.name, file, state));
    } else if (state.specified[node.object.name]) {
      node.object = this.importMethod(state.specified[node.object.name], file, state);
    }
  }

  Property(path, state) {
    const { node } = path;
    this.buildDeclaratorHandler(node, 'value', path, state);
  }

  VariableDeclarator(path, state) {
    const { node } = path;
    this.buildDeclaratorHandler(node, 'init', path, state);
  }

  ArrayExpression(path, state) {
    const { node } = path;
    const props = node.elements.map((_, index) => index);
    this.buildExpressionHandler(node.elements, props, path, state);
  }

  LogicalExpression(path, state) {
    const { node } = path;
    this.buildExpressionHandler(node, ['left', 'right'], path, state);
  }

  ConditionalExpression(path, state) {
    const { node } = path;
    this.buildExpressionHandler(node, ['test', 'consequent', 'alternate'], path, state);
  }

  IfStatement(path, state) {
    const { node } = path;
    this.buildExpressionHandler(node, ['test'], path, state);
    this.buildExpressionHandler(node.test, ['left', 'right'], path, state);
  }

  ExpressionStatement(path, state) {
    const { node } = path;
    const { types } = this;
    if (types.isAssignmentExpression(node.expression)) {
      this.buildExpressionHandler(node.expression, ['right'], path, state);
    }
  }

  ReturnStatement(path, state) {
    const types = this.types;
    const file = (path && path.hub && path.hub.file) || (state && state.file);
    const { node } = path;

    if (node.argument && types.isIdentifier(node.argument) && state.specified[node.argument.name] &&
    this.isInGlobalScope(path, node.argument.name, state)) {
      node.argument = this.importMethod(node.argument.name, file, state);
    }
  }

  ExportDefaultDeclaration(path, state) {
    const { node } = path;
    this.buildExpressionHandler(node, ['declaration'], path, state);
  }

  BinaryExpression(path, state) {
    const { node } = path;
    this.buildExpressionHandler(node, ['left', 'right'], path, state);
  }

  NewExpression(path, state) {
    const { node } = path;
    this.buildExpressionHandler(node, ['callee', 'arguments'], path, state);
  }
}
