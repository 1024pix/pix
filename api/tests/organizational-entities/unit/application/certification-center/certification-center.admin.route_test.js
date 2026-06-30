import sinon from 'sinon';

import { certificationCenterAdminController } from '../../../../../src/organizational-entities/application/certification-center/certification-center.admin.controller.js';
import { certificationCenterAdminRoute as moduleUnderTest } from '../../../../../src/organizational-entities/application/certification-center/certification-center.admin.route.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Organizational Entities | Application | Route | Admin | Certification Center', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/admin/certification-centers/{certificationCenterId}/archive', function () {
    describe('when the authenticated user has one of the accepted roles', function () {
      [
        'checkAdminMemberHasRoleSuperAdmin',
        'checkAdminMemberHasRoleCertif',
        'checkAdminMemberHasRoleSupport',
        'checkAdminMemberHasRoleMetier',
      ].forEach((roleMethod) => {
        it('should call archiveCertificationCenter controller method', async function () {
          // given
          sinon.stub(securityPreHandlers, roleMethod).returns(() => true);
          securityPreHandlers.hasAtLeastOneAccessOf.callsFake((_handlers) => {
            return () => true;
          });
          sinon.stub(usecases, 'archiveCertificationCenter').returns('ok');
          sinon.stub(certificationCenterAdminController, 'archiveCertificationCenter').returns('ok');

          // when
          await httpTestServer.request('POST', '/api/admin/certification-centers/1/archive');

          // then
          sinon.assert.called(certificationCenterAdminController.archiveCertificationCenter);
        });
      });
    });

    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf.returns((request, h) => h.response().code(403).takeover());
        sinon.stub(usecases, 'archiveCertificationCenter').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        sinon.stub(certificationCenterAdminController, 'archiveCertificationCenter').returns('ok');

        // when
        const response = await httpTestServer.request('POST', '/api/admin/certification-centers/1/archive');

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(certificationCenterAdminController.archiveCertificationCenter);
      });
    });
  });

  describe('GET /api/admin/certification-centers/{id}/organizations', function () {
    describe('when the user authenticated has no role', function () {
      it('returns a 403 HTTP status code', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf.returns((request, h) => h.response().code(403).takeover());

        sinon.stub(certificationCenterAdminController, 'findAttachedOrganizationsForAdmin');

        // when
        const response = await httpTestServer.request('GET', '/api/admin/certification-centers/1/organizations');

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(certificationCenterAdminController.findAttachedOrganizationsForAdmin);
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
          sinon.stub(certificationCenterAdminController, 'findAttachedOrganizationsForAdmin').returns('ok');

          // when
          const response = await httpTestServer.request('GET', '/api/admin/certification-centers/1/organizations');

          // then
          expect(response.statusCode).to.equal(200);
          sinon.assert.calledOnce(certificationCenterAdminController.findAttachedOrganizationsForAdmin);
        });
      });
    });
  });
});
