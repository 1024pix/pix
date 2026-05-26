import sinon from 'sinon';

import { certificationVersionController } from '../../../../../src/certification/configuration/application/certification-version-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/configuration/application/certification-version-route.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Certification | Configuration | Application | Router | certification-version-route', function () {
  describe('GET /api/admin/certification-versions/{certificationVersionId}', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(certificationVersionController, 'getVersionById').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', `/api/admin/certification-versions/1`);

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(certificationVersionController.getVersionById);
      });
    });

    const authorizedRoles = ['SuperAdmin', 'Certif', 'Metier', 'Support'];
    authorizedRoles.forEach((role) => {
      describe(`when the user has ${role} role`, function () {
        it('should return 200 HTTP status code', async function () {
          // given
          sinon.stub(securityPreHandlers, `checkAdminMemberHasRole${role}`).returns(true);
          sinon.stub(certificationVersionController, 'getVersionById').returns('ok');

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('GET', `/api/admin/certification-versions/1`);

          // then
          expect(response.statusCode).to.equal(200);
          sinon.assert.calledOnce(certificationVersionController.getVersionById);
        });
      });
    });

    describe('when the id parameter is invalid', function () {
      it('should return 400 HTTP status code when id is not valid', async function () {
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        sinon.stub(certificationVersionController, 'getVersionById').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('GET', '/api/admin/certification-versions/NOT_AN_ID');

        expect(response.statusCode).to.equal(400);
        sinon.assert.notCalled(certificationVersionController.getVersionById);
      });
    });
  });

  describe('PATCH /api/admin/certification-versions/{certificationVersionId}', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(certificationVersionController, 'update').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('PATCH', `/api/admin/certification-versions/1`, {
          data: {
            id: '1',
            attributes: {
              'assessment-duration': 120,
              'minimum-answers-required-for-validation': 20,
              'maximum-assessment-length': 30,
              comments: 'Newly updated comments',
            },
            type: 'certification-versions',
          },
        });

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(certificationVersionController.update);
      });
    });

    const authorizedRoles = ['SuperAdmin', 'Certif', 'Metier', 'Support'];
    authorizedRoles.forEach((role) => {
      describe(`when the user has ${role} role`, function () {
        it('should return 204 HTTP status code', async function () {
          // given
          sinon.stub(securityPreHandlers, `checkAdminMemberHasRole${role}`).returns(true);
          sinon.stub(certificationVersionController, 'update').callsFake((request, h) => h.response().code(204));

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('PATCH', `/api/admin/certification-versions/1`, {
            data: {
              id: '1',
              attributes: {
                'assessment-duration': 120,
                'minimum-answers-required-for-validation': 20,
                'maximum-assessment-length': 30,
                comments: 'Newly updated comments',
              },
              type: 'certification-versions',
            },
          });

          // then
          expect(response.statusCode).to.equal(204);
          sinon.assert.calledOnce(certificationVersionController.update);
        });
      });
    });

    describe('when the version ID parameter is invalid', function () {
      it('returns a 400 HTTP status', async function () {
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        sinon.stub(certificationVersionController, 'update').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('GET', '/api/admin/certification-versions/NOT_AN_ID');

        expect(response.statusCode).to.equal(400);
        sinon.assert.notCalled(certificationVersionController.update);
      });
    });
  });

  describe('DELETE /api/admin/certification-version/{id}', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      sinon.stub(securityPreHandlers, `checkAdminMemberHasRoleSuperAdmin`).returns(true);
      sinon
        .stub(certificationVersionController, 'deleteCertificationVersion')
        .callsFake((request, h) => h.response().code(204));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/admin/certification-versions/1');

      // then
      expect(response.statusCode).to.equal(204);
      sinon.assert.calledOnce(certificationVersionController.deleteCertificationVersion);
    });

    it('should return 403 HTTP status code when user is not SuperAdmin', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .returns((request, h) => h.response().code(403).takeover());
      sinon.stub(certificationVersionController, 'deleteCertificationVersion').returns('ok');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/admin/certification-versions/1');

      // then
      expect(response.statusCode).to.equal(403);
      sinon.assert.notCalled(certificationVersionController.deleteCertificationVersion);
    });

    it('should return 400 HTTP status code when id is not valid', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
      sinon.stub(certificationVersionController, 'deleteCertificationVersion').returns('ok');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/admin/certification-versions/NOT_AN_ID');

      // then
      expect(response.statusCode).to.equal(400);
      sinon.assert.notCalled(certificationVersionController.deleteCertificationVersion);
    });
  });

  describe('POST /api/admin/frameworks/{scope}/new-version', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(certificationVersionController, 'createCertificationVersion').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', `/api/admin/frameworks/${SCOPES.CORE}/new-version`, {
          data: { attributes: { tubeIds: ['tubeId'] } },
        });

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(certificationVersionController.createCertificationVersion);
      });
    });

    describe('when the scope is invalid', function () {
      it('should return 400 HTTP status code', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').callsFake(() => () => true);
        sinon.stub(certificationVersionController, 'createCertificationVersion').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/frameworks/INVALID_SCOPE/new-version', {
          data: { attributes: { tubeIds: ['tubeId'] } },
        });

        // then
        expect(response.statusCode).to.equal(400);
        sinon.assert.notCalled(certificationVersionController.createCertificationVersion);
      });
    });
  });
});
