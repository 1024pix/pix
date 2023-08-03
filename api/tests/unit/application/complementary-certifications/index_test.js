import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { complementaryCertificationController } from '../../../../lib/application/complementary-certifications/complementary-certification-controller.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import * as moduleUnderTest from '../../../../lib/application/complementary-certifications/index.js';

describe('Unit | Application | Router | complementary-certifications-router', function () {
  describe('GET /api/admin/complementary-certifications', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(complementaryCertificationController, 'findComplementaryCertifications').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/complementary-certifications');

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(complementaryCertificationController.findComplementaryCertifications);
      });
    });
  });
});
