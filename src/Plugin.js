import { join } from 'path';

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
    types
  ) {
    this.specified = null;
    this.libraryObjs = null;
    this.selectedMethods = null;
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
    this.types = types;
  }

  importMethod(methodName, file) {
    if (!this.selectedMethods[methodName]) {
      const libraryDirectory = this.libraryDirectory;
      const style = this.style;
      const transformedMethodName = this.camel2UnderlineComponentName  // eslint-disable-line
        ? camel2Underline(methodName)
        : this.camel2DashComponentName
          ? camel2Dash(methodName)
          : methodName;
      const path = winPath(
        join(this.libraryName, libraryDirectory, transformedMethodName, this.fileName)
      );
      this.selectedMethods[methodName] = file.addImport(path, 'default');
      if (style === true) {
        file.addImport(`${path}/style`, 'style');
      } else if (style === 'css') {
        file.addImport(`${path}/style/css`, 'style');
      }
    }
    return this.selectedMethods[methodName];
  }

  buildExpressionHandler(node, props, path) {
    const { file } = path.hub;
    const types = this.types;
    props.forEach(prop => {
      if (!types.isIdentifier(node[prop])) return;
      if (this.specified[node[prop].name]) {
        node[prop] = this.importMethod(this.specified[node[prop].name], file);  // eslint-disable-line
      }
    });
  }

  buildDeclaratorHandler(node, prop, path) {
    const { file } = path.hub;
    const types = this.types;
    if (!types.isIdentifier(node[prop])) return;
    if (this.specified[node[prop].name] &&
      path.scope.hasBinding(node[prop].name) &&
      path.scope.getBinding(node[prop].name).path.type === 'ImportSpecifier') {
      node[prop] = this.importMethod(node[prop].name, file);  // eslint-disable-line
    }
  }

  Program() {
    this.specified = Object.create(null);
    this.libraryObjs = Object.create(null);
    this.selectedMethods = Object.create(null);
  }

  ImportDeclaration(path) {
    const { node } = path;

    // path maybe removed by prev instances.
    if (!node) return;

    const { value } = node.source;
    const libraryName = this.libraryName;
    const types = this.types;
    if (value === libraryName) {
      node.specifiers.forEach(spec => {
        if (types.isImportSpecifier(spec)) {
          this.specified[spec.local.name] = spec.imported.name;
        } else {
          this.libraryObjs[spec.local.name] = true;
        }
      });
      path.remove();
    }
  }

  CallExpression(path) {
    const { node } = path;
    const { file } = path.hub;
    const { name } = node.callee;
    const types = this.types;

    if (types.isIdentifier(node.callee)) {
      if (this.specified[name]) {
        node.callee = this.importMethod(this.specified[name], file);
      }
    }

    node.arguments = node.arguments.map(arg => {
      const { name: argName } = arg;
      if (this.specified[argName] &&
        path.scope.hasBinding(argName) &&
        path.scope.getBinding(argName).path.type === 'ImportSpecifier') {
        return this.importMethod(this.specified[argName], file);
      }
      return arg;
    });
  }

  MemberExpression(path) {
    const { node } = path;
    const { file } = path.hub;

    // multiple instance check.
    if (!node.object || !node.object.name) return;

    if (this.libraryObjs[node.object.name]) {
      // antd.Button -> _Button
      path.replaceWith(this.importMethod(node.property.name, file));
    } else if (this.specified[node.object.name]) {
      node.object = this.importMethod(this.specified[node.object.name], file);
    }
  }

  Property(path, { opts }) {
    const { node } = path;
    this.buildDeclaratorHandler(node, 'value', path, opts);
  }

  VariableDeclarator(path, { opts }) {
    const { node } = path;
    this.buildDeclaratorHandler(node, 'init', path, opts);
  }

  LogicalExpression(path, { opts }) {
    const { node } = path;
    this.buildExpressionHandler(node, ['left', 'right'], path, opts);
  }

  ConditionalExpression(path, { opts }) {
    const { node } = path;
    this.buildExpressionHandler(node, ['test', 'consequent', 'alternate'], path, opts);
  }

  IfStatement(path, { opts }) {
    const { node } = path;
    this.buildExpressionHandler(node, ['test'], path, opts);
    this.buildExpressionHandler(node.test, ['left', 'right'], path, opts);
  }

  ExpressionStatement(path, { opts }) {
    const { node } = path;
    const { types } = this;
    if (types.isAssignmentExpression(node.expression)) {
      this.buildExpressionHandler(node.expression, ['right'], path, opts);
    }
  }

  ReturnStatement(path) {
    const types = this.types;
    const { node, hub: { file } } = path;
    if (node.argument && types.isIdentifier(node.argument) && this.specified[node.argument.name]) {
      node.argument = this.importMethod(node.argument.name, file);
    }
  }

  ExportDefaultDeclaration(path, { opts }) {
    const { node } = path;
    this.buildExpressionHandler(node, ['declaration'], path, opts);
  }

  BinaryExpression(path, { opts }) {
    const { node } = path;
    this.buildExpressionHandler(node, ['left', 'right'], path, opts);
  }
}
