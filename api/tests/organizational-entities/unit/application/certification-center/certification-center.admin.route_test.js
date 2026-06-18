import sinon from 'sinon';

import { certificationCenterAdminController } from '../../../../../src/organizational-entities/application/certification-center/certification-center.admin.controller.js';
import { certificationCenterAdminRoute as moduleUnderTest } from '../../../../../src/organizational-entities/application/certification-center/certification-center.admin.route.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Certification Center | Application | Route | Admin', function () {
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
        sinon.stub(usecases, 'archiveCertificationCenter').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
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
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .returns((request, h) => h.response().code(403).takeover());
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
