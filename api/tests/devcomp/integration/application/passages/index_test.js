import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import * as moduleUnderTest from '../../../../../src/devcomp/application/passages/index.js';
import { passageController } from '../../../../../src/devcomp/application/passages/controller.js';
import { ModuleDoesNotExistError } from '../../../../../src/devcomp/domain/errors.js';

describe('Unit | Devcomp | Application | Passage | Router | passage-router', function () {
  describe('POST /api/passages/', function () {
    describe('when controller throw a ModuleDoesNotExistError', function () {
      it('should return a 422', async function () {
        // given
        sinon.stub(passageController, 'create').throws(new ModuleDoesNotExistError());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const invalidPayload = {
          data: {
            attributes: {
              'module-id': 'not existing id',
            },
          },
        };

        // when
        const response = await httpTestServer.request('POST', '/api/passages', invalidPayload);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });
});
