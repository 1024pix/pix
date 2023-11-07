import { expect } from '../../../test-helper.js';
import { ConfigLoader } from '../../../../src/shared/infrastructure/config-loader.js';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Unit | Shared | infrastructure | config-loader', function () {
  describe('test.env file with properties KEY=one, KEYTWO=kiloutou', function () {
    let configLoader;
    beforeEach(async function () {
      configLoader = new ConfigLoader({ configDirectoryPath: __dirname });
      await configLoader.loadConfigFile();
    });

    it('should return one', function () {
      // given, when
      const result = configLoader.get('KEY');

      // then
      expect(result).to.equal('one');
    });

    it('should return kiloutou', function () {
      // given, when
      const result = configLoader.get('KEYTWO');

      // then
      expect(result).to.equal('kiloutou');
    });
  });
});
