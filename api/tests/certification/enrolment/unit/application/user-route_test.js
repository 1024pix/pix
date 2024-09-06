import { userController } from '../../../../../src/certification/enrolment/application/user-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/enrolment/application/user-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Router | user', function () {
  describe('GET /api/users/{userId}/is-certifiable', function () {
    it('should return OK when everything does as expected', async function () {
      // given
      sinon.stub(userController, 'isCertifiable').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      /// when
      const response = await httpTestServer.request('GET', '/api/users/123/is-certifiable');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should reject an invalid user id', async function () {
      //given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/users/invalid/is-certifiable');

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 403 if user is not authenticated', async function () {
      //given
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) =>
        h
          .response({ errors: new Error('forbidden') })
          .code(403)
          .takeover(),
      );

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/users/123/is-certifiable');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
