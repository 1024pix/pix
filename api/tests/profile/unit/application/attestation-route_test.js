import sinon from 'sinon';

import { attestationController } from '../../../../src/profile/application/attestation-controller.js';
import { attestationRoute as moduleUnderTest } from '../../../../src/profile/application/attestation-route.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../test-helper.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';

describe('Unit | Router | user-router', function () {
  describe('GET /api/admin/attestations', function () {
    it('should call hasAtLeastOneAccessOf with the correct prehandlers', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(attestationController, 'getAll').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/admin/attestations');

      // then
      expect(securityPreHandlers.hasAtLeastOneAccessOf).to.have.been.calledOnceWithExactly([
        securityPreHandlers.checkAdminMemberHasRoleCertif,
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
        securityPreHandlers.checkAdminMemberHasRoleMetier,
        securityPreHandlers.checkAdminMemberHasRoleSupport,
      ]);
    });

    describe('when the user has no admin role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns((request, h) =>
          h
            .response({ errors: new Error('forbidden') })
            .code(403)
            .takeover(),
        );
        sinon.stub(attestationController, 'getAll').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/attestations');

        // then
        expect(response.statusCode).to.equal(403);
        expect(attestationController.getAll.called).to.be.false;
      });
    });
  });

  describe('GET /api/users/{userId}/attestations-details', function () {
    const method = 'GET';
    const url = '/api/users/12/attestation-details';

    it('should not call controller when user connected is not requested user', async function () {
      // given
      sinon.stub(attestationController, 'getUserAttestationsDetails').returns('ok');
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) =>
        h
          .response({ errors: new Error('forbidden') })
          .code(403)
          .takeover(),
      );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request(method, url);

      // then
      expect(attestationController.getUserAttestationsDetails.called).to.be.false;
    });
  });
});
