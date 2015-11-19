import 'jest.automockoff';
import { transformFileSync } from "babel-core";
import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import plugin from '../index';

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
      const actual = transformFileSync(actualFile, {
        presets: ['react'],
        plugins: [plugin],
      }).code;

      if (onlyFixtures.length) {
        console.warn();
        console.warn(actual);
      }

      const expected = readFileSync(expectedFile, 'utf-8');
      expect(actual.trim()).toEqual(expected.trim());
    });
  });
});
