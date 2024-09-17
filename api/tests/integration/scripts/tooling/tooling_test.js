import { executeScript } from '../../../../scripts/tooling/tooling.js';
import { logger } from '../../../../src/shared/infrastructure/utils/logger.js';
import { expect, knex, sinon } from '../../../test-helper.js';

describe('Integration | Scripts | Tooling', function () {
  describe('#executeScript', function () {
    let loggerErrorSpy;
    let loggerInfoSpy;

    beforeEach(function () {
      loggerErrorSpy = sinon.spy(logger, 'error');
      loggerInfoSpy = sinon.spy(logger, 'info');
    });

    context('when callback is successful', function () {
      it('should log start and end and the command appropriately both in database and logger', async function () {
        // given
        const processArgvs = [
          '/path/to/node',
          '/path/to/scripts/subFolder/mySuperDuperScript.js',
          '-a',
          'oui',
          '--topOption',
          '123',
        ];
        const scriptFn = (arg1, arg2) => {
          return `Hello ${arg1}, do you like ${arg2} ?`;
        };
        const scriptFnWithArgs = scriptFn.bind(this, 'Laura', 'vegetables');

        // when
        await executeScript({ processArgvs, scriptFn: scriptFnWithArgs, disconnectAndExit: false });

        // then
        // log in DB
        const datas = await knex('script-executions').select('*');
        expect(datas).to.have.length(1);
        sinon.assert.match(datas[0], {
          id: sinon.match.number,
          startedAt: sinon.match.date,
          endedAt: sinon.match.date,
          scriptName: 'subFolder/mySuperDuperScript.js',
          command: 'subFolder/mySuperDuperScript.js -a oui --topOption 123',
          error: null,
        });
        // log in logger
        expect(loggerInfoSpy.firstCall.args).to.deepEqualArray([
          'Script "subFolder/mySuperDuperScript.js -a oui --topOption 123" has started.',
        ]);
        expect(loggerInfoSpy.secondCall.args).to.deepEqualArray(['Script executed successfully !']);
        expect(loggerInfoSpy.thirdCall.args[0].startsWith('Script has ended')).to.be.true;
        expect(loggerErrorSpy.notCalled).to.be.true;
        expect(loggerInfoSpy.calledThrice).to.be.true;
      });
    });

    context('when callback throws an error', function () {
      it('should log start and end and the command appropriately along with the serialized error both in database and logger', async function () {
        // given
        const processArgvs = [
          '/path/to/node',
          '/path/to/scripts/subFolder/mySuperDuperScript.js',
          '-a',
          'oui',
          '--topOption',
          '123',
        ];
        const scriptFn = async (arg1, arg2) => {
          throw { some: arg1, error: arg2 };
        };
        const scriptFnWithArgs = scriptFn.bind(this, 'value for some', 'value for error');

        // when
        await executeScript({
          processArgvs,
          scriptFn: scriptFnWithArgs,
          disconnectAndExit: false,
        });

        // then
        // log in DB
        const datas = await knex('script-executions').select('*');
        sinon.assert.match(datas[0], {
          id: sinon.match.number,
          startedAt: sinon.match.date,
          endedAt: sinon.match.date,
          scriptName: 'subFolder/mySuperDuperScript.js',
          command: 'subFolder/mySuperDuperScript.js -a oui --topOption 123',
          error: JSON.stringify({ some: 'value for some', error: 'value for error' }),
        });
        // log in logger
        expect(loggerInfoSpy.firstCall.args).to.deepEqualArray([
          'Script "subFolder/mySuperDuperScript.js -a oui --topOption 123" has started.',
        ]);
        expect(loggerInfoSpy.secondCall.args[0].startsWith('Script has ended')).to.be.true;
        expect(loggerErrorSpy.firstCall.args).to.deepEqualArray([
          'Script encountered an error : \n' + '{"some":"value for some","error":"value for error"}.',
        ]);
        expect(loggerErrorSpy.calledOnce).to.be.true;
        expect(loggerInfoSpy.calledTwice).to.be.true;
      });
    });
  });
});
