import sinon from 'sinon';

import { certificationFrameworkController } from '../../../../../src/certification/configuration/application/certification-framework-controller.js';
import { certificationFrameworkRoute as moduleUnderTest } from '../../../../../src/certification/configuration/application/certification-framework-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

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

  describe('GET /api/admin/certification-frameworks/{framework}', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(certificationFrameworkController, 'findCertificationFramework').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/certification-frameworks/CLEA');

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(certificationFrameworkController.findCertificationFramework);
      });
    });

    context('when framework param is invalid', function () {
      it('should return 400 HTTP status code', async function () {
        // given
        sinon.stub(securityPreHandlers, `checkAdminMemberHasRoleSuperAdmin`).returns(true);
        sinon.stub(certificationFrameworkController, 'findCertificationFramework').returns('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', `/api/admin/certification-frameworks/BOUBOU`);

        // then
        expect(response.statusCode).to.equal(400);
        sinon.assert.notCalled(certificationFrameworkController.findCertificationFramework);
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
          sinon.stub(certificationFrameworkController, 'findCertificationFramework').returns('ok');

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('GET', '/api/admin/certification-frameworks/CLEA');

          // then
          expect(response.statusCode).to.equal(200);
          sinon.assert.calledOnce(certificationFrameworkController.findCertificationFramework);
        });
      });
    });
  });
});
