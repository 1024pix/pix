import sinon from 'sinon';

import { certificationFrameworkController } from '../../../../../src/certification/configuration/application/certification-framework-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/configuration/application/certification-framework-route.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Integration | Certification | Configuration | Application | Router | certification-framework-route', function () {
  describe('GET /api/admin/certification-frameworks/{scope}/active-consolidated-framework', function () {
    describe('Error cases', function () {
      let httpTestServer;

      beforeEach(async function () {
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
      });

      it('should return 404 when no active version exists for the given scope', async function () {
        sinon
          .stub(certificationFrameworkController, 'getActiveConsolidatedFramework')
          .rejects(new NotFoundError('There is no framework for complementary CORE'));

        const response = await httpTestServer.request(
          'GET',
          `/api/admin/certification-frameworks/${SCOPES.CORE}/active-consolidated-framework`,
        );

        expect(response.statusCode).to.equal(404);
      });

      it('should return 400 when scope parameter is not valid', async function () {
        sinon.stub(certificationFrameworkController, 'getActiveConsolidatedFramework').returns('ok');

        const response = await httpTestServer.request(
          'GET',
          '/api/admin/certification-frameworks/INVALID_SCOPE/active-consolidated-framework',
        );

        expect(response.statusCode).to.equal(400);
      });
    });
  });
  describe('GET /api/admin/certification-frameworks/{scope}/framework-history', function () {
    describe('Error cases', function () {
      let httpTestServer;

      beforeEach(async function () {
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
      });

      it('should return 400 when scope parameter is not valid', async function () {
        sinon.stub(certificationFrameworkController, 'getFrameworkHistory').returns('ok');

        const response = await httpTestServer.request(
          'GET',
          '/api/admin/certification-frameworks/INVALID_SCOPE/framework-history',
        );

        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
