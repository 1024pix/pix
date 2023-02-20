import { expect, HttpTestServer, sinon } from '../../../test-helper';
import moduleUnderTest from '../../../../lib/application/complementary-certifications';
import complementaryCertificationController from '../../../../lib/application/complementary-certifications/complementary-certification-controller';
import securityPreHandlers from '../../../../lib/application/security-pre-handlers';

describe('Unit | Application | Router | complementary-certifications-router', function () {
  describe('GET /api/habilitations', function () {
    it('should return 403 HTTP status code when the user authenticated is not SuperAdmin', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkUserIsAdminInOrganization')
        .callsFake((request, h) => h.response().code(403).takeover());
      sinon.stub(complementaryCertificationController, 'findComplementaryCertifications').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/habilitations');

      // then
      expect(response.statusCode).to.equal(403);
      sinon.assert.notCalled(complementaryCertificationController.findComplementaryCertifications);
    });
  });
});
