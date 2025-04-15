import { certificateController } from '../../../../../src/certification/results/application/certificate-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/results/application/certificate-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Certification | Results | Unit | Application | Certification Route', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(certificateController, 'findUserCertificates').returns('ok');
    sinon.stub(certificateController, 'getCertificate').callsFake((request, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api/certifications/{certificationCourseId}', function () {
    it('should exist', async function () {
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      // when
      const response = await httpTestServer.request('GET', '/api/certifications/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/certifications', function () {
    it('should exist', async function () {
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      // when
      const response = await httpTestServer.request('GET', '/api/certifications');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/sessions/{sessionId}/attestations', function () {
    it('return forbidden access if user has METIER role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
        ])
        .callsFake(
          () => (request, h) =>
            h
              .response({ errors: new Error('forbidden') })
              .code(403)
              .takeover(),
        );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/sessions/1/attestations');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
