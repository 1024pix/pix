import sinon from 'sinon';

import { modulesController } from '../../../../../src/devcomp/application/modules/module-controller.js';
import * as moduleUnderTest from '../../../../../src/devcomp/application/modules/module-route.js';
import { ElementInstantiationError, ModuleInstantiationError } from '../../../../../src/devcomp/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Integration | Devcomp | Application | Module | Router | module-router', function () {
  describe('GET /api/modules/v2/{shortId}', function () {
    describe('when controller throws a ModuleInstantiationError', function () {
      it('should return an HTTP 502 error', async function () {
        // given
        sinon.stub(modulesController, 'getByShortId').throws(new ModuleInstantiationError());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const notExistingShortId = 'not-existing-short-id';
        const invalidPayload = {
          data: {
            attributes: {
              'module-id': 'not existing id',
            },
          },
        };

        // when
        const response = await httpTestServer.request('GET', `/api/modules/v2/${notExistingShortId}`, invalidPayload);

        // then
        expect(response.statusCode).to.equal(502);
      });
    });

    describe('when controller throws an ElementInstantiationError', function () {
      it('should return an HTTP 502 error', async function () {
        // given
        sinon.stub(modulesController, 'getByShortId').throws(new ElementInstantiationError());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const notExistingShortId = 'not-existing-short-id';
        const invalidPayload = {
          data: {
            attributes: {
              'module-id': 'not existing id',
            },
          },
        };

        // when
        const response = await httpTestServer.request('GET', `/api/modules/v2/${notExistingShortId}`, invalidPayload);

        // then
        expect(response.statusCode).to.equal(502);
      });
    });
  });
});
