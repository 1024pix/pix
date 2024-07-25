import { sessionForSupervisingController } from '../../../../../src/certification/session-management/application/session-for-supervising-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/session-management/application/session-for-supervising-route.js';
import { assessmentSupervisorAuthorization as sessionSupervisorAuthorization } from '../../../../../src/certification/shared/application/pre-handlers/session-supervisor-authorization.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Routes | Session For Supervising', function () {
  describe('GET /api/sessions/{id}/supervising', function () {
    it('should return 200 if the user is a supervisor of the session', async function () {
      //given
      sinon.stub(sessionSupervisorAuthorization, 'verifyBySessionId').callsFake((request, h) => h.response(true));
      sinon.stub(sessionForSupervisingController, 'get').returns('ok');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/sessions/3/supervising');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 401 if the user is not a supervisor of the session', async function () {
      //given
      sinon
        .stub(sessionSupervisorAuthorization, 'verifyBySessionId')
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
