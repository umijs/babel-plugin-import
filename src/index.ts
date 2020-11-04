import assert from 'assert';
import { join } from 'path';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { CustomName, NormalizedOptions, Options } from './types';

function transCamel(_str: string, symbol: string) {
  const str = _str[0].toLowerCase() + _str.substr(1);
  return str.replace(/([A-Z])/g, $1 => `${symbol}${$1.toLowerCase()}`);
}

function winPath(path: string) {
  return path.replace(/\\/g, '/');
}

function normalizeCustomName(originCustomName?: CustomName) {
  // If set to a string, treat it as a JavaScript source file path.
  if (typeof originCustomName === 'string') {
    // eslint-disable-next-line import/no-dynamic-require
    const customNameExports = require(originCustomName);
    return typeof customNameExports === 'function' ? customNameExports : customNameExports.default;
  }

  return originCustomName;
}

function normalizeOptions(options: Options): NormalizedOptions {
  return {
    libraryName: options.libraryName as string,
    libraryDirectory: typeof options.libraryDirectory === 'undefined' ? 'lib' : options.libraryDirectory,
    camel2DashComponentName:
      typeof options.camel2DashComponentName === 'undefined' ? true : options.camel2DashComponentName,
    camel2UnderlineComponentName: options.camel2UnderlineComponentName,
    style: options.style || false,
    styleLibraryDirectory: options.styleLibraryDirectory,
    customStyleName: normalizeCustomName(options.customStyleName),
    fileName: options.fileName || '',
    customName: normalizeCustomName(options.customName),
    transformToDefaultImport:
      typeof options.transformToDefaultImport === 'undefined' ? true : options.transformToDefaultImport,
  };
}

export default function () {
  let configurations: NormalizedOptions[] = [];

  // Only for test
  // eslint-disable-next-line no-underscore-dangle
  (global as any).__clearBabelAntdPlugin = () => {
    configurations = [];
  };

  return {
    visitor: {
      Program: {
        enter(path: NodePath, { opts = {} }: { opts: Options | Options[] }) {
          // Init plugin instances once.
          if (configurations.length === 0) {
            if (Array.isArray(opts)) {
              configurations = opts.map(opt => {
                assert(opt.libraryName, 'libraryName should be provided');
                return normalizeOptions(opt);
              });
            } else {
              assert(opts.libraryName, 'libraryName should be provided');
              configurations = [normalizeOptions(opts)];
            }
          }
        },
      },
      ImportDeclaration(path: NodePath<t.ImportDeclaration>, state: any) {
        configurations.forEach(config => {
          const { node } = path;
          const file = (path.hub as any).file || state.file;
          if (path.get('source').isLiteral({ value: config.libraryName })) {
            node.specifiers.forEach(specifier => {
              if (!t.isImportSpecifier(specifier)) {
                throw new Error('babel-plugin-import only support named imports.');
              }
              const importedIdentifier = specifier.imported as t.Identifier;
              const localIdentifier = specifier.local;
              const importedName = importedIdentifier.name;
              const transformedMethodName = config.camel2UnderlineComponentName // eslint-disable-line
                ? transCamel(importedName, '_')
                : config.camel2DashComponentName
                ? transCamel(importedName, '-')
                : importedName;

              const customStyleName = normalizeCustomName(config.customStyleName);
              const customName = normalizeCustomName(config.customName);
              const importPath = winPath(
                customName
                  ? customName(transformedMethodName, file)
                  : join(config.libraryName, config.libraryDirectory, transformedMethodName, config.fileName)
              );
              const newImport = config.transformToDefaultImport
                ? t.importDeclaration([t.importDefaultSpecifier(localIdentifier)], t.stringLiteral(importPath))
                : t.importDeclaration(
                    [t.importSpecifier(localIdentifier, importedIdentifier)],
                    t.stringLiteral(importPath)
                  );

              let stylePath = '';

              path.insertBefore(newImport);

              if (customStyleName) {
                stylePath = winPath(customStyleName(transformedMethodName));
              } else if (config.styleLibraryDirectory) {
                stylePath = winPath(
                  join(config.libraryName, config.styleLibraryDirectory, transformedMethodName, config.fileName)
                );
              } else if (config.style === true) {
                stylePath = `${importPath}/style`;
              } else if (config.style === 'css') {
                stylePath = `${importPath}/style/css`;
              } else if (typeof config.style === 'function') {
                stylePath = config.style(importPath, file);
              }

              if (stylePath) {
                path.insertBefore(t.importDeclaration([], t.stringLiteral(stylePath)));
              }
            });
            path.remove();
          }
        });
      },
    },
  };
}
