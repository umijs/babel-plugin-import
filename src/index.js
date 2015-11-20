
export default function({ types }) {
  let specified;
  let antdObjs;
  let selectedMethods;

  function importMethod(methodName, file) {
    if (!selectedMethods[methodName]) {
      const path = `antd/lib/${methodName.toLowerCase()}`;
      selectedMethods[methodName] = file.addImport(path, 'default');
    }
    return selectedMethods[methodName];
  }

  return {
    visitor: {

      Program() {
        specified = Object.create(null);
        antdObjs = Object.create(null);
        selectedMethods = Object.create(null);
      },

      ImportDeclaration(path) {
        const { node } = path;
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
        const { node } = path;
        const { file } = path.hub;
        const { name, object, property } = node.callee;

        if (types.isIdentifier(node.callee)) {
          if (specified[name]) {
            node.callee = importMethod(specified[name], file);
          }
        } else {
          // React.createElement(Button) -> React.createElement(_Button)
          if (object.name === 'React' && property.name === 'createElement' && node.arguments) {
            node.arguments = node.arguments.map(arg => {
              const { name: argName } = arg;
              if (specified[argName]) {
                return importMethod(specified[argName], file);
              }
              return arg;
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
