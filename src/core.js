
export default function(libraryName) {
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
        const path = `${libraryName}/lib/${camel2Dash(methodName)}`;
        selectedMethods[methodName] = file.addImport(path, 'default');
        if (opts.style) {
          file.addImport(`${path}/style`);
        }
      }
      return selectedMethods[methodName];
    }

    return {
      visitor: {

        Program() {
          specified = Object.create(null);
          libraryObjs = Object.create(null);
          selectedMethods = Object.create(null);
        },

        ImportDeclaration(path) {
          const { node } = path;
          const { value } = node.source;

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
            if (object && object.name === 'React' && property && property.name === 'createElement' && node.arguments) {
              node.arguments = node.arguments.map(arg => {
                const { name: argName } = arg;
                if (specified[argName]) {
                  return importMethod(specified[argName], file, opts);
                }
                return arg;
              });
            }
          }
        },

        MemberExpression(path, { opts }) {
          const { node } = path;
          const { file } = path.hub;

          if (libraryObjs[node.object.name]) {
            // antd.Button -> _Button
            path.replaceWith(importMethod(node.property.name, file, opts));
          } else if (specified[node.object.name]) {
            node.object = importMethod(node.object.name, file, opts);
          }
        },
      },
    };
  };
}
