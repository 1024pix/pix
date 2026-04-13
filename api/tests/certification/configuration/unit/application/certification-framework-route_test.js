import { certificationFrameworkController } from '../../../../../src/certification/configuration/application/certification-framework-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/configuration/application/certification-framework-route.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Certification | Configuration | Application | Router | certification-framework-route', function () {
  describe('GET /api/admin/certification-frameworks', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(certificationFrameworkController, 'findCertificationFrameworks').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/certification-frameworks');

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(certificationFrameworkController.findCertificationFrameworks);
      });
    });

    const authorizedRoles = [
      { role: 'SuperAdmin', stub: 'checkAdminMemberHasRoleSuperAdmin' },
      { role: 'Support', stub: 'checkAdminMemberHasRoleSupport' },
      { role: 'Certif', stub: 'checkAdminMemberHasRoleCertif' },
      { role: 'Metier', stub: 'checkAdminMemberHasRoleMetier' },
    ];

    authorizedRoles.forEach(({ role, stub }) => {
      describe(`when the user has ${role} role`, function () {
        it('should return 200 HTTP status code', async function () {
          // given
          sinon.stub(securityPreHandlers, stub).callsFake((request, h) => h.response(true));
          sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').callsFake((_handlers) => {
            return () => true;
          });
          sinon.stub(certificationFrameworkController, 'findCertificationFrameworks').returns('ok');

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('GET', '/api/admin/certification-frameworks');

          // then
          expect(response.statusCode).to.equal(200);
          sinon.assert.calledOnce(certificationFrameworkController.findCertificationFrameworks);
        });
      });
    });
  });

  describe('GET /api/admin/certification-frameworks/{scope}/active-consolidated-framework', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(certificationFrameworkController, 'getActiveConsolidatedFramework').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'GET',
          `/api/admin/certification-frameworks/${SCOPES.CORE}/active-consolidated-framework`,
        );

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(certificationFrameworkController.getActiveConsolidatedFramework);
      });
    });

    describe('when the user has an authorized role', function () {
      const authorizedRoles = ['SuperAdmin', 'Support', 'Certif', 'Metier'];

      authorizedRoles.forEach((role) => {
        it(`should return 200 HTTP status code when user has ${role} role`, async function () {
          // given
          sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').callsFake(() => (request, h) => h.response(true));
          sinon.stub(certificationFrameworkController, 'getActiveConsolidatedFramework').returns('ok');
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request(
            'GET',
            `/api/admin/certification-frameworks/${SCOPES.CORE}/active-consolidated-framework`,
          );

          // then
          expect(response.statusCode).to.equal(200);
          sinon.assert.calledOnce(certificationFrameworkController.getActiveConsolidatedFramework);
        });
      });
    });
  });

  describe('GET /api/admin/certification-frameworks/{complementaryCertificationKey}/framework-history', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(certificationFrameworkController, 'getFrameworkHistory').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'GET',
          `/api/admin/certification-frameworks/${SCOPES.CORE}/framework-history`,
        );

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(certificationFrameworkController.getFrameworkHistory);
      });
    });

    const authorizedRoles = ['SuperAdmin', 'Certif', 'Metier', 'Support'];
    authorizedRoles.forEach((role) => {
      describe(`when the user has ${role} role`, function () {
        it('should return 200 HTTP status code', async function () {
          // given
          sinon.stub(securityPreHandlers, `checkAdminMemberHasRole${role}`).returns(true);
          sinon.stub(certificationFrameworkController, 'getFrameworkHistory').returns('ok');

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request(
            'GET',
            `/api/admin/certification-frameworks/${SCOPES.PIX_PLUS_DROIT}/framework-history`,
          );

          // then
          expect(response.statusCode).to.equal(200);
          sinon.assert.calledOnce(certificationFrameworkController.getFrameworkHistory);
        });
      });
    });
  });

  describe('GET /api/v2/admin/certification-frameworks/{complementaryCertificationKey}/framework-history', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(certificationFrameworkController, 'getFrameworkHistory').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'GET',
          `/api/v2/admin/certification-frameworks/${SCOPES.CORE}/framework-history`,
        );

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(certificationFrameworkController.getFrameworkHistory);
      });
    });

    const authorizedRoles = ['SuperAdmin', 'Certif', 'Metier', 'Support'];
    authorizedRoles.forEach((role) => {
      describe(`when the user has ${role} role`, function () {
        it('should return 200 HTTP status code', async function () {
          // given
          sinon.stub(securityPreHandlers, `checkAdminMemberHasRole${role}`).returns(true);
          sinon.stub(certificationFrameworkController, 'getFrameworkHistory').returns('ok');

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request(
            'GET',
            `/api/v2/admin/certification-frameworks/${SCOPES.PIX_PLUS_DROIT}/framework-history`,
          );

          // then
          expect(response.statusCode).to.equal(200);
          sinon.assert.calledOnce(certificationFrameworkController.getFrameworkHistory);
        });
      });
    });
  });

  describe('POST /api/admin/frameworks/{scope}/new-version', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(certificationFrameworkController, 'createCertificationVersion').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', `/api/admin/frameworks/${SCOPES.CORE}/new-version`, {
          data: { attributes: { tubeIds: ['tubeId'] } },
        });

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(certificationFrameworkController.createCertificationVersion);
      });
    });

    describe('when the scope is invalid', function () {
      it('should return 400 HTTP status code', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').callsFake(() => () => true);
        sinon.stub(certificationFrameworkController, 'createCertificationVersion').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/frameworks/INVALID_SCOPE/new-version', {
          data: { attributes: { tubeIds: ['tubeId'] } },
        });

        // then
        expect(response.statusCode).to.equal(400);
        sinon.assert.notCalled(certificationFrameworkController.createCertificationVersion);
      });
    });
  });
});
