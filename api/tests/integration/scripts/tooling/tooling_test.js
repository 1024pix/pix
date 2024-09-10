import { executeAndLogScript } from '../../../../scripts/tooling/tooling.js';
import { catchErr, expect, knex, sinon } from '../../../test-helper.js';

describe('Integration | Scripts | Tooling', function () {
  describe('#executeAndLog', function () {
    context('when callback is successful', function () {
      it('should log start and end and the command appropriately', async function () {
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
        const res = await executeAndLogScript({ processArgvs, scriptFn: scriptFnWithArgs });

        // then
        const datas = await knex('script-executions').select('*');
        expect(datas).to.have.length(1);
        expect(res).to.equal('Hello Laura, do you like vegetables ?');
        sinon.assert.match(datas[0], {
          id: sinon.match.number,
          startedAt: sinon.match.date,
          endedAt: sinon.match.date,
          scriptName: 'subFolder/mySuperDuperScript.js',
          command: 'subFolder/mySuperDuperScript.js -a oui --topOption 123',
          error: null,
        });
      });
    });
    context('when callback throws an error', function () {
      it('should log start and end and the command appropriately along with the serialized error', async function () {
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
        const err = await catchErr(executeAndLogScript)({ processArgvs, scriptFn: scriptFnWithArgs });

        // then
        const datas = await knex('script-executions').select('*');
        expect(err).to.deep.equal({ some: 'value for some', error: 'value for error' });
        sinon.assert.match(datas[0], {
          id: sinon.match.number,
          startedAt: sinon.match.date,
          endedAt: sinon.match.date,
          scriptName: 'subFolder/mySuperDuperScript.js',
          command: 'subFolder/mySuperDuperScript.js -a oui --topOption 123',
          error: JSON.stringify({ some: 'value for some', error: 'value for error' }),
        });
      });
    });
  });
});
