import { modulesController } from '../../../../../src/devcomp/application/modules/controller.js';
import * as moduleUnderTest from '../../../../../src/devcomp/application/modules/index.js';
import { ElementInstantiationError, ModuleInstantiationError } from '../../../../../src/devcomp/domain/errors.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Devcomp | Application | Module | Router | modules-router', function () {
  describe('GET /api/modules/{slug}', function () {
    describe('when controller throws a ModuleInstantiationError', function () {
      it('should return an HTTP 502 error', async function () {
        // given
        sinon.stub(modulesController, 'getBySlug').throws(new ModuleInstantiationError());
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
        const response = await httpTestServer.request('GET', '/api/modules/module', invalidPayload);

        // then
        expect(response.statusCode).to.equal(502);
      });
    });

    describe('when controller throws an ElementInstantiationError', function () {
      it('should return an HTTP 502 error', async function () {
        // given
        sinon.stub(modulesController, 'getBySlug').throws(new ElementInstantiationError());
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
        const response = await httpTestServer.request('GET', '/api/modules/module', invalidPayload);

        // then
        expect(response.statusCode).to.equal(502);
      });
    });
  });
});
