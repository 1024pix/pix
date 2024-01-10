import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import * as moduleUnderTest from '../../../../../src/devcomp/application/passages/index.js';
import { passageController } from '../../../../../src/devcomp/application/passages/controller.js';
import { ModuleDoesNotExistError, PassageDoesNotExistError } from '../../../../../src/devcomp/domain/errors.js';

describe('Integration | Devcomp | Application | Passage | Router | passage-router', function () {
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

  describe('POST /api/passages/{passageId}/answers', function () {
    describe('when controller throw a PassageDoesNotExistError', function () {
      it('should return a 422', async function () {
        // given
        sinon.stub(passageController, 'verifyAndSaveAnswer').throws(new PassageDoesNotExistError());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const payload = {
          data: {
            attributes: {
              'element-id': '69257809-d0fe-44c0-9a47-cbd89d9cbdc6',
              'user-response': ['user-response'],
            },
          },
        };

        // when
        const response = await httpTestServer.request('POST', '/api/passages/123/answers', payload);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });
});
