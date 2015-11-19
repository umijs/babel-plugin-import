
export default function({ types }) {
  let specified;
  let antdObjs;
  let selectedMethods;

  function importMethod(methodName, file) {
    if (!selectedMethods[methodName]) {
      let path =  `antd/lib/${methodName.toLowerCase()}`; // resolveModule(methodName);
      selectedMethods[methodName] = file.addImport(path, 'default');
    }
    return selectedMethods[methodName];
  }

  return {
    visitor: {

      Program: {
        enter() {
          specified = Object.create(null);
          antdObjs = Object.create(null);
          selectedMethods = Object.create(null);
        },
        exit({hub, node}) {
        },
      },

      ImportDeclaration(path) {
        const { node, scope } = path;
        const { value } = node.source;

        if (value === 'antd') {
          node.specifiers.forEach(spec => {
            if (types.isImportSpecifier(spec)) {
              specified[spec.local.name] = spec.imported.name;
            } else {
              antdObjs[spec.local.name] = true;
            }
          });
          path.remove();
        }
      },

      CallExpression(path) {
        let { node } = path;
        let { file } = path.hub;
        let { name, object, property } = node.callee;

        if (types.isIdentifier(node.callee)) {
          if (specified[name]) {
            node.callee = importMethod(specified[name], file);
          }
        } else {
          // React.createElement(Button) -> React.createElement(_Button)
          if (object.name === 'React' && property.name === 'createElement' && node.arguments) {
            node.arguments = node.arguments.map(arg => {
              const { name } = arg;
              if (specified[name]) {
                return importMethod(specified[name], file);
              } else {
                return arg;
              }
            });
          }
        }
      },

      MemberExpression(path) {
        const { node } = path;
        const { file } = path.hub;

        if (antdObjs[node.object.name]) {
          // antd.Button -> _Button
          path.replaceWith(importMethod(node.property.name, file));
        } else if (specified[node.object.name]) {
          node.object = importMethod(node.object.name, file);
        }
      },
    },
  };
}
