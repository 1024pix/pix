import sinon from 'sinon';

import { userTrainingsController } from '../../../../../src/devcomp/application/user-trainings/user-trainings-controller.js';
import { userTrainingsRoute as moduleUnderTest } from '../../../../../src/devcomp/application/user-trainings/user-trainings-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Router | user-router', function () {
  describe('GET /api/users/{id}/trainings', function () {
    const method = 'GET';

    it('returns 200', async function () {
      // given
      sinon.stub(userTrainingsController, 'findPaginatedUserRecommendedTrainings').returns('ok');
      const securityPreHandlersStub = sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/1/trainings';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(200);
      expect(securityPreHandlersStub).to.have.been.called;
    });

    it('returns 400 when userId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const userId = 'wrongId';
      const url = `/api/users/${userId}/trainings`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });
});
