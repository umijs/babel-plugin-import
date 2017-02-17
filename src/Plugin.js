import { join } from 'path';

export default class Plugin {
  constructor(libraryName, libraryDirectory, style, camel2DashComponentName, camel2UnderlineComponentName, types) {
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
    this.types = types;
  }

  importMethod(methodName, file, opts) {
    if (!this.selectedMethods[methodName]) {
      const libraryDirectory = this.libraryDirectory;
      const style = this.style;
      const transformedMethodName = this.camel2UnderlineComponentName
        ? camel2Underline(methodName)
        : this.camel2DashComponentName
          ? camel2Dash(methodName)
          : methodName;
      const path = winPath(join(this.libraryName, libraryDirectory, transformedMethodName));
      this.selectedMethods[methodName] = file.addImport(path, 'default');
      if (style === true) {
        file.addImport(`${path}/style`, 'style');
      } else if(style === 'css') {
        file.addImport(`${path}/style/css`, 'style');
      }
    }
    return this.selectedMethods[methodName];
  }

  buildExpressionHandler(node, props, path, opts) {
    const { file } = path.hub;
    const types = this.types;
    props.forEach(prop => {
      if (!types.isIdentifier(node[prop])) return;
      if (this.specified[node[prop].name]) {
        node[prop] = this.importMethod(node[prop].name, file, opts);
      }
    });
  }

  buildDeclaratorHandler(node, prop, path, opts) {
    const { file } = path.hub;
    const types = this.types;
    if (!types.isIdentifier(node[prop])) return;
    if (this.specified[node[prop].name]) {
      node[prop] = this.importMethod(node[prop].name, file, opts);
    }
  }

  Program() {
    this.specified = Object.create(null);
    this.libraryObjs = Object.create(null);
    this.selectedMethods = Object.create(null);
  }

  ImportDeclaration(path, { opts }) {
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

  CallExpression(path, { opts }) {
    const { node } = path;
    const { file } = path.hub;
    const { name, object, property } = node.callee;
    const types = this.types;

    if (types.isIdentifier(node.callee)) {
      if (this.specified[name]) {
        node.callee = this.importMethod(this.specified[name], file, opts);
      }
    }

    node.arguments = node.arguments.map(arg => {
      const { name: argName } = arg;
      if (this.specified[argName] &&
        path.scope.hasBinding(argName) &&
        path.scope.getBinding(argName).path.type === 'ImportSpecifier') {
        return this.importMethod(this.specified[argName], file, opts);
      }
      return arg;
    });
  }

  MemberExpression(path, { opts }) {
    const { node } = path;
    const { file } = path.hub;

    // multiple instance check.
    if (!node.object || !node.object.name) return;

    if (this.libraryObjs[node.object.name]) {
      // antd.Button -> _Button
      path.replaceWith(this.importMethod(node.property.name, file, opts));
    } else if (this.specified[node.object.name]) {
      node.object = this.importMethod(this.specified[node.object.name], file, opts);
    }
  }

  Property(path, {opts}) {
    const { node } = path;
    this.buildDeclaratorHandler(node, 'value', path, opts);
  }

  VariableDeclarator(path, {opts}) {
    const { node } = path;
    this.buildDeclaratorHandler(node, 'init', path, opts);
  }

  LogicalExpression(path, {opts}) {
    const { node } = path;
    this.buildExpressionHandler(node, ['left', 'right'], path, opts);
  }

  ConditionalExpression(path, {opts}) {
    const { node } = path;
    this.buildExpressionHandler(node, ['test', 'consequent', 'alternate'], path, opts);
  }

  IfStatement(path, {opts}) {
    const { node } = path;
    this.buildExpressionHandler(node, ['test'], path, opts);
    this.buildExpressionHandler(node.test, ['left', 'right'], path, opts);
  }

  ExpressionStatement(path, {opts}){
    const { node } = path;
    const { types } = this;
    if(types.isAssignmentExpression(node.expression)){
      this.buildExpressionHandler(node.expression, ['right'], path, opts);
    }
  }

  ExportDefaultDeclaration(path, { opts }) {
    const { node } = path;
    this.buildExpressionHandler(node, ['declaration'], path, opts);
  }
}

function camel2Dash(_str) {
  const str = _str[0].toLowerCase() + _str.substr(1);
  return str.replace(/([A-Z])/g, function camel2DashReplace($1) {
    return '-' + $1.toLowerCase();
  });
}

function camel2Underline(_str) {
  const str = _str[0].toLowerCase() + _str.substr(1);
  return str.replace(/([A-Z])/g, function ($1) {
    return '_' + $1.toLowerCase();
  });
}

function winPath(path) {
  return path.replace(/\\/g, '/');
}
