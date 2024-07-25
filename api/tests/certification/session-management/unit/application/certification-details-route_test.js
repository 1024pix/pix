import { certificationDetailsController } from '../../../../../src/certification/session-management/application/certification-details-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/session-management/application/certification-details-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Routes | Certification Details', function () {
  describe('GET /api/admin/certifications/{id}/details', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(certificationDetailsController, 'getCertificationDetails').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/certifications/1234/details');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
