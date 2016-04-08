import { transformFileSync } from "babel-core";
import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import plugin from '../src/index';
import expect from 'expect';

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

    it(`should work with ${caseName.split('-').join(' ')}`, () => {

      let cssPlugin;
      if (caseName === 'import-css') {
        cssPlugin = [plugin, {
          style: true,
        }];
      }

      const actual = transformFileSync(actualFile, {
        presets: ['react'],
        plugins: [cssPlugin || plugin],
      }).code;

      if (onlyFixtures.length) {
        console.warn();
        console.warn(actual);
      }

      const expected = readFileSync(expectedFile, 'utf-8');
      expect(actual.trim()).toEqual(expected.trim());
    });
  });

  xit(`tmp`, () => {
    const actualFile = join(fixturesDir, `variable-declaration/actual.js`);
    const actual = transformFileSync(actualFile, {
      presets: ['react'],
      plugins: [plugin],
    }).code;
    console.log(actual);
  });
});
