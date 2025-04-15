import { profileController } from '../../../../src/profile/application/profile-controller.js';
import * as moduleUnderTest from '../../../../src/profile/application/profile-route.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Router | user-router', function () {
  describe('GET /api/users/{userId}/profile', function () {
    const method = 'GET';
    const url = '/api/users/42/profile';

    it('exists', async function () {
      // given
      sinon.stub(profileController, 'getProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request(method, url);

      // then
      sinon.assert.calledOnce(profileController.getProfile);
    });
  });
});
