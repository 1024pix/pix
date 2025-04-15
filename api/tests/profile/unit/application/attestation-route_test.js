import { attestationController } from '../../../../src/profile/application/attestation-controller.js';
import * as moduleUnderTest from '../../../../src/profile/application/attestation-route.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Router | user-router', function () {
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
