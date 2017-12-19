import { transformFileSync } from '@babel/core';
import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import plugin from '../src/index';
import expect from 'expect';
import { resolve } from 'path';

describe('index', () => {
  const fixturesDir = join(__dirname, 'fixtures');
  let fixtures = readdirSync(fixturesDir);
  const onlyFixtures = fixtures.filter(fixture => fixture.indexOf('-only') > -1);

  if (onlyFixtures.length) {
    fixtures = onlyFixtures;
  }

  fixtures.map(caseName => {
    const fixtureDir = join(fixturesDir, caseName);
    const actualFile = join(fixtureDir, 'actual.js');
    const expectedFile = join(fixtureDir, 'expected.js');
    let expected = readFileSync(expectedFile, 'utf-8');

    it(`should work with ${caseName.split('-').join(' ')}`, () => {

      let cssPlugin;
      if (caseName === 'import-css') {
        cssPlugin = [plugin, {
          style: true,
        }];
      }

      if (caseName === 'import-module') {
        cssPlugin = [plugin, {
          style: true,
          root: 'abc',
        }];
      }

      if (caseName === 'import-all-css') {
        cssPlugin = [plugin, {
          style: true,
        }];
      }

      if (caseName === 'import-theme') {
        cssPlugin = [plugin, {
          libraryName: 'element-ui',
          styleLibraryName: 'theme-default',
        }];
      }

      if (caseName === 'import-theme-custom') {
        cssPlugin = [plugin, {
          libraryName: 'element-ui4',
          styleLibrary: {
            base: false,
            name: 'theme-custom',
          },
        }];
      }

      if (caseName === 'import-theme-custom-path') {
        cssPlugin = [plugin, {
          libraryName: 'element-ui5',
          styleLibrary: {
            base: false,
            name: 'theme-custom-path',
            path: '[module]/[module].css',
          },
        }];
      }

      if (caseName === 'import-theme-all-compo') {
        cssPlugin = [plugin, {
          libraryName: 'element-ui2',
          styleLibraryName: 'theme-default',
        }];
      }

      if (caseName === 'independent-theme-package') {
        expected = expected.replace(/__theme__/g, process.cwd());
        cssPlugin = [plugin, {
          libraryName: 'element-ui3',
          styleLibraryName: '~theme',
        }];
      }

      if (caseName === 'independent-theme-package-custom') {
        expected = expected.replace(/__theme__/g, process.cwd());
        cssPlugin = [plugin, {
          libraryName: 'element-ui6',
          styleLibrary: {
            base: true,
            name: '~theme',
            path: '[module]/[module].css',
          },
        }];
      }

      if (caseName === 'independent-theme-package-mixin') {
        cssPlugin = [plugin, {
          libraryName: 'element-ui7',
          styleLibrary: {
            mixin: true,
            name: '~theme',
            path: '[module]/[module].css',
          },
          style: true,
        }];
      }

      if (caseName === 'custom-css-filename') {
        cssPlugin = [plugin, { style: 'style.css' }];
      }

      if (caseName === 'multiple-module') {
        cssPlugin = [
          [plugin, {
            libraryName: 'antd',
            style: true,
          }, 'antd'],
          [plugin, {
            libraryName: 'test-module',
            style: true,
          }, 'test-module'],
        ];
      }

      if (caseName === 'camel-to-dash-option') {
        cssPlugin = [plugin, {
          libraryName: 'antd',
          camel2Dash: false,
        }];
      }

      const actual = transformFileSync(actualFile, {
        presets: ['@babel/react'],
        plugins: cssPlugin && Array.isArray(cssPlugin[1]) ? cssPlugin : [cssPlugin || plugin],
      }).code;


      if (onlyFixtures.length) {
        console.warn();
        console.warn(actual);
      }

      expect(actual.trim()).toEqual(expected.trim());
    });
  });
});
