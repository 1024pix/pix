import { complementaryCertificationController } from '../../../../../src/certification/configuration/application/complementary-certification-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/configuration/application/complementary-certification-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Certification | Configuration | Unit | Application | Router | complementary-certifications-route', function () {
  describe('GET /api/admin/complementary-certifications', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
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

  describe('GET /api/admin/complementary-certifications/attachable-target-profiles', function () {
    describe('when the user authenticated has certif role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif').callsFake((request, h) => h.response(true));
        sinon
          .stub(complementaryCertificationController, 'searchAttachableTargetProfilesForComplementaryCertifications')
          .returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/admin/complementary-certifications/attachable-target-profiles',
        );

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(
          complementaryCertificationController.searchAttachableTargetProfilesForComplementaryCertifications,
        );
      });
    });

    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon
          .stub(complementaryCertificationController, 'searchAttachableTargetProfilesForComplementaryCertifications')
          .returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/admin/complementary-certifications/attachable-target-profiles',
        );

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(
          complementaryCertificationController.searchAttachableTargetProfilesForComplementaryCertifications,
        );
      });
    });
  });
});
