import { transformFileSync } from 'babel-core';
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

      if (caseName === 'import-theme') {
        cssPlugin = [plugin, [
          {
            libraryName: 'element-ui',
            styleLibraryName: 'theme-default',
          },
        ]];
      }

      if (caseName === 'import-theme-all-compo') {
        cssPlugin = [plugin, [
          {
            libraryName: 'element-ui2',
            styleLibraryName: 'theme-default',
          },
        ]];
      }

      if (caseName === 'independent-theme-package') {
        cssPlugin = [plugin, [
          {
            libraryName: 'element-ui3',
            styleLibraryName: '~theme',
          },
        ]];
      }

      if (caseName === 'custom-css-filename') {
        cssPlugin = [plugin, { style: 'style.css' }];
      }

      if (caseName === 'multiple-module') {
        cssPlugin = [plugin, [
          {
            libraryName: 'antd',
            style: true,
          },
          {
            libraryName: 'test-module',
            style: true,
          },
        ]];
      }

      const actual = transformFileSync(actualFile, {
        presets: ['react'],
        plugins: [cssPlugin || plugin],
      }).code;

      if (onlyFixtures.length) {
        console.warn();
        console.warn(actual);
      }

      expect(actual.trim()).toEqual(expected.trim());
    });
  });
});
