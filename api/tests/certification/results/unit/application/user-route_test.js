import sinon from 'sinon';

import { userController } from '../../../../../src/certification/results/application/user-controller.js';
import { userRoute as moduleUnderTest } from '../../../../../src/certification/results/application/user-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Certification | Results | Unit | Router | user', function () {
  describe('GET /api/admin/users/{userId}/certification-courses', function () {
    it('should return OK when everything does as expected', async function () {
      // given
      sinon.stub(userController, 'findAllCertificationCourses').returns('ok');
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      /// when
      const response = await httpTestServer.request('GET', '/api/admin/users/123/certification-courses');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should reject when admin user role is not accepted', async function () {
      // given
      sinon.stub(userController, 'findAllCertificationCourses').returns('ok');
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns((request, h) =>
        h
          .response({ errors: new Error('') })
          .code(403)
          .takeover(),
      );

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      /// when
      const response = await httpTestServer.request('GET', '/api/admin/users/123/certification-courses');

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should reject an invalid user id', async function () {
      //given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/users/invalid/certification-courses');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
