import sinon from 'sinon';

import { sessionForSupervisingController } from '../../../../../src/certification/session-management/application/session-for-supervising-controller.js';
import { sessionForSupervisingRoute as moduleUnderTest } from '../../../../../src/certification/session-management/application/session-for-supervising-route.js';
import { assessmentInvigilatorAuthorization as sessionInvigilatorAuthorization } from '../../../../../src/certification/shared/application/pre-handlers/session-invigilator-authorization.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Certification | Session Management | Unit | Application | Routes | Session For Supervising', function () {
  describe('GET /api/sessions/{sessionId}/supervising', function () {
    it('should return 200 if the user is an invigilator of the session', async function () {
      //given
      sinon.stub(sessionInvigilatorAuthorization, 'verifyBySessionId').callsFake((request, h) => h.response(true));
      sinon.stub(sessionForSupervisingController, 'get').returns('ok');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/sessions/3/supervising');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 401 if the user is not an invigilator of the session', async function () {
      //given
      sinon
        .stub(sessionInvigilatorAuthorization, 'verifyBySessionId')
        .callsFake((request, h) => h.response().code(401).takeover());
      sinon.stub(sessionForSupervisingController, 'get').returns('ok');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/sessions/3/supervising');

      // then
      expect(response.statusCode).to.equal(401);
    });
  });
});
