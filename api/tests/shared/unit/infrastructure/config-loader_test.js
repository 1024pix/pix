import { expect, sinon } from '../../../test-helper.js';
import { ConfigLoader } from '../../../../src/shared/infrastructure/config-loader.js';
import * as url from 'url';
import { logger } from '../../../../src/shared/infrastructure/utils/logger.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Unit | Shared | infrastructure | config-loader', function () {
  let configLoader;
  describe('given no config file', function () {
    beforeEach(async function () {
      configLoader = new ConfigLoader({ configDirectoryPath: '' });
    });
    it('should log with level info the fact that no config file has been loaded', async function () {
      // given
      sinon.stub(logger, 'info');

      // when
      await configLoader.loadConfigFile();

      // then
      expect(logger.info).to.have.been.calledOnce;
    });

    describe('given an environment variable KEYTHREE=kiwi', function () {
      it("should return 'kiwi' on get('KEYTHREE')", async function () {
        // given
        await configLoader.loadConfigFile();
        process.env.KEYTHREE = 'kiwi';

        // when
        const result = configLoader.get('KEYTHREE');

        // then
        expect(result).to.equal('kiwi');
      });
    });

    describe('given no environment variable for KEYFOUR=tropfort', function () {
      it("should return undefined on get('KEYFOUR')", async function () {
        // given
        await configLoader.loadConfigFile();
        delete process.env.KEYFOUR;

        // when
        const result = configLoader.get('KEYFOUR');

        // then
        expect(result).to.be.undefined;
      });
    });
  });
  describe('given a config file', function () {
    beforeEach(async function () {
      configLoader = new ConfigLoader({ configDirectoryPath: __dirname });
      await configLoader.loadConfigFile();
    });

    describe('given a test.env file with properties KEY=one, KEYTWO=kiloutou', function () {
      it("should return 'one' on get('KEY')", function () {
        // given, when
        const result = configLoader.get('KEY');

        // then
        expect(result).to.equal('one');
      });

      it("should return 'kiloutou' on get('KEYTWO')", function () {
        // given, when
        const result = configLoader.get('KEYTWO');

        // then
        expect(result).to.equal('kiloutou');
      });

      describe('given an environment variable KEYTHREE=kiwi', function () {
        it("should return 'kiwi' on get('KEYTHREE')", function () {
          // given
          process.env.KEYTHREE = 'kiwi';

          // when
          const result = configLoader.get('KEYTHREE');

          // then
          expect(result).to.equal('kiwi');
        });
      });

      describe('given no environment variable for KEYFOUR=tropfort', function () {
        it("should return undefined on get('KEYFOUR')", function () {
          // given
          delete process.env.KEYFOUR;

          // when
          const result = configLoader.get('KEYFOUR');

          // then
          expect(result).to.be.undefined;
        });
      });
    });

    describe('given a test.env file with properties KEY=one and environment variable KEY=two', function () {
      it("should return 'two' on get('KEY')", function () {
        // given
        process.env.KEY = 'two';

        // when
        const result = configLoader.get('KEY');

        // then
        expect(result).to.equal('two');
      });
    });
  });
});
