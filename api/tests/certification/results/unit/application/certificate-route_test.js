import sinon from 'sinon';

import { certificateController } from '../../../../../src/certification/results/application/certificate-controller.js';
import { certificateRoute as moduleUnderTest } from '../../../../../src/certification/results/application/certificate-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Certification | Results | Unit | Application | Certification Route', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(certificateController, 'findUserCertificateSummaries').returns('ok');
    sinon.stub(certificateController, 'getCertificate').callsFake((request, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api/certifications/{certificationCourseId}', function () {
    it('should reject access if not authenticated', async function () {
      // given
      const certificationCourseId = 3695;
      sinon
        .stub(securityPreHandlers, 'checkUserOwnsCertificationCourse')
        .callsFake((_, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when

      const response = await httpTestServer.request('GET', `/api/certifications/${certificationCourseId}`);

      // then
      sinon.assert.calledOnce(securityPreHandlers.checkUserOwnsCertificationCourse);
      expect(response.statusCode).to.equal(403);
    });

    it('should reject access to a certification that does not belong to the current user', async function () {
      // given
      const userId = 123;
      const certificationCourseId = 3695;
      sinon
        .stub(securityPreHandlers, 'checkUserOwnsCertificationCourse')
        .callsFake((_, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when

      const response = await httpTestServer.request('GET', `/api/certifications/${certificationCourseId}`, {
        auth: { credentials: { userId } },
      });

      // then
      sinon.assert.calledOnce(securityPreHandlers.checkUserOwnsCertificationCourse);
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/certificate-summaries', function () {
    it('should exist', async function () {
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      // when
      const response = await httpTestServer.request('GET', '/api/certificate-summaries');

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

  describe('GET /api/shared-certifications', function () {
    it('return 400 when the verification code is missing', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);

      // when
      const response = await httpTestServer.request('POST', '/api/shared-certifications');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/attestation/{certificationCourseId}', function () {
    it('should reject access if not authenticated', async function () {
      // given
      const certificationCourseId = 3695;
      sinon
        .stub(securityPreHandlers, 'checkUserOwnsCertificationCourse')
        .callsFake((_, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when

      const response = await httpTestServer.request(
        'GET',
        `/api/attestation/${certificationCourseId}?isFrenchDomainExtension=true&lang=fr`,
      );

      // then
      sinon.assert.calledOnce(securityPreHandlers.checkUserOwnsCertificationCourse);
      expect(response.statusCode).to.equal(403);
    });

    it('should reject access to a certification that does not belong to the current user', async function () {
      // given
      const userId = 123;
      const certificationCourseId = 3695;
      sinon
        .stub(securityPreHandlers, 'checkUserOwnsCertificationCourse')
        .callsFake((_, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when

      const response = await httpTestServer.request(
        'GET',
        `/api/attestation/${certificationCourseId}?isFrenchDomainExtension=true&lang=fr`,
        {
          auth: { credentials: { userId } },
        },
      );

      // then
      sinon.assert.calledOnce(securityPreHandlers.checkUserOwnsCertificationCourse);
      expect(response.statusCode).to.equal(403);
    });
  });
});
