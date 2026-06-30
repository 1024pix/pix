import sinon from 'sinon';

import { organizationAdminController } from '../../../../../src/organizational-entities/application/organization/organization.admin.controller.js';
import { organizationAdminRoute as moduleUnderTest } from '../../../../../src/organizational-entities/application/organization/organization.admin.route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Organizational Entities | Application | route | Admin | organization', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/admin/organizations/{childOrganizationId}/detach-parent-organization', function () {
    describe('error case', function () {
      describe('when the authenticated user is not super admin', function () {
        it('should return 403 HTTP status code', async function () {
          // given
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) =>
            h
              .response({ errors: new Error('forbidden') })
              .code(403)
              .takeover(),
          );
          sinon.stub(organizationAdminController, 'detachParentOrganization');

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/admin/organizations/123/detach-parent-organization',
          );

          // then
          expect(response.statusCode).to.equal(403);
          sinon.assert.notCalled(organizationAdminController.detachParentOrganization);
        });
      });

      describe('when childOrganizationId is not a number', function () {
        it('should return 400 HTTP status code', async function () {
          // given
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').resolves(true);
          sinon.stub(organizationAdminController, 'detachParentOrganization');

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/admin/organizations/mqlksdmdlk/detach-parent-organization',
          );

          // then
          expect(response.statusCode).to.equal(400);
          sinon.assert.notCalled(organizationAdminController.detachParentOrganization);
        });
      });
    });
  });

  describe('GET /api/admin/organizations/{id}/places-statistics', function () {
    describe('when the user authenticated has no role', function () {
      it('returns a 403 HTTP status code', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf.returns((request, h) => h.response().code(403).takeover());
        sinon.stub(organizationAdminController, 'getOrganizationPlacesStatistics');

        // when
        const response = await httpTestServer.request('GET', '/api/admin/organizations/1/places-statistics');

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(organizationAdminController.getOrganizationPlacesStatistics);
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
        it('returns a 200 HTTP status code', async function () {
          // given
          sinon.stub(securityPreHandlers, stub).callsFake((request, h) => h.response(true));
          securityPreHandlers.hasAtLeastOneAccessOf.callsFake((_handlers) => {
            return () => true;
          });
          sinon.stub(organizationAdminController, 'getOrganizationPlacesStatistics').returns('ok');

          // when
          const response = await httpTestServer.request('GET', '/api/admin/organizations/1/places-statistics');

          // then
          expect(response.statusCode).to.equal(200);
          sinon.assert.calledOnce(organizationAdminController.getOrganizationPlacesStatistics);
        });
      });
    });
  });

  describe('GET /api/admin/organizations/{id}/statistics', function () {
    describe('when the user authenticated has no role', function () {
      it('returns a 403 HTTP status code', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf.returns((request, h) => h.response().code(403).takeover());
        sinon.stub(organizationAdminController, 'getOrganizationStatistics');

        // when
        const response = await httpTestServer.request('GET', '/api/admin/organizations/1/statistics');

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(organizationAdminController.getOrganizationStatistics);
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
        it('returns a 200 HTTP status code', async function () {
          // given
          sinon.stub(securityPreHandlers, stub).callsFake((request, h) => h.response(true));
          securityPreHandlers.hasAtLeastOneAccessOf.callsFake((_handlers) => {
            return () => true;
          });
          sinon.stub(organizationAdminController, 'getOrganizationStatistics').returns('ok');

          // when
          const response = await httpTestServer.request('GET', '/api/admin/organizations/1/statistics');

          // then
          expect(response.statusCode).to.equal(200);
          sinon.assert.calledOnce(organizationAdminController.getOrganizationStatistics);
        });
      });
    });
  });

  describe('GET /api/admin/organizations/{id}/certification-centers', function () {
    describe('when the user authenticated has no role', function () {
      it('returns a 403 HTTP status code', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf.returns((request, h) => h.response().code(403).takeover());

        sinon.stub(organizationAdminController, 'findAttachedCertificationCenterForAdmin');

        // when
        const response = await httpTestServer.request('GET', '/api/admin/organizations/1/certification-centers');

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(organizationAdminController.findAttachedCertificationCenterForAdmin);
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
        it('returns a 200 HTTP status code', async function () {
          // given
          sinon.stub(securityPreHandlers, stub).callsFake((request, h) => h.response(true));
          securityPreHandlers.hasAtLeastOneAccessOf.callsFake((_handlers) => {
            return () => true;
          });
          sinon.stub(organizationAdminController, 'findAttachedCertificationCenterForAdmin').returns('ok');

          // when
          const response = await httpTestServer.request('GET', '/api/admin/organizations/1/certification-centers');

          // then
          expect(response.statusCode).to.equal(200);
          sinon.assert.calledOnce(organizationAdminController.findAttachedCertificationCenterForAdmin);
        });
      });
    });
  });

  describe('POST /api/admin/organizations/{id}/attach-certification-centers', function () {
    describe('when the user authenticated has no role', function () {
      it('returns a 403 HTTP status code', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf.returns((request, h) => h.response().code(403).takeover());

        sinon.stub(organizationAdminController, 'attachCertificationCenter');

        const payload = { certificationCenterId: 42 };

        // when
        const response = await httpTestServer.request(
          'POST',
          '/api/admin/organizations/1/attach-certification-centers',
          payload,
        );

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(organizationAdminController.attachCertificationCenter);
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
        it('should call controller method', async function () {
          // given
          sinon.stub(securityPreHandlers, stub).callsFake((request, h) => h.response(true));
          securityPreHandlers.hasAtLeastOneAccessOf.callsFake((_handlers) => {
            return () => true;
          });
          sinon.stub(organizationAdminController, 'attachCertificationCenter').returns('ok');

          const payload = { certificationCenterId: 42 };

          // when
          await httpTestServer.request('POST', '/api/admin/organizations/1/attach-certification-centers', payload);

          // then
          sinon.assert.called(organizationAdminController.attachCertificationCenter);
        });
      });
    });
  });

  describe('POST /api/admin/organizations/{id}/detach-certification-center', function () {
    describe('when the user authenticated has no role', function () {
      it('returns a 403 HTTP status code', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf.returns((request, h) => h.response().code(403).takeover());

        sinon.stub(organizationAdminController, 'detachCertificationCenter');

        // when
        const response = await httpTestServer.request('POST', '/api/admin/organizations/1/detach-certification-center');

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(organizationAdminController.detachCertificationCenter);
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
        it('should call controller method', async function () {
          // given
          sinon.stub(securityPreHandlers, stub).callsFake((request, h) => h.response(true));
          securityPreHandlers.hasAtLeastOneAccessOf.callsFake((_handlers) => {
            return () => true;
          });
          sinon.stub(organizationAdminController, 'detachCertificationCenter').returns('ok');

          // when
          await httpTestServer.request('POST', '/api/admin/organizations/1/detach-certification-center');

          // then
          sinon.assert.called(organizationAdminController.detachCertificationCenter);
        });
      });
    });
  });
});
