import { certificationCandidateController } from '../../../../../src/certification/session-management/application/certification-candidate-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/session-management/application/certification-candidate-route.js';
import { assessmentSupervisorAuthorization as sessionSupervisorAuthorization } from '../../../../../src/certification/shared/application/pre-handlers/session-supervisor-authorization.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Sessions | Routes', function () {
  describe('POST certification-candidates/{id}/authorize-to-start', function () {
    it('should return 200 if the user is a supervisor of the session linked to the candidate', async function () {
      //given
      sinon
        .stub(sessionSupervisorAuthorization, 'verifyByCertificationCandidateId')
        .callsFake((request, h) => h.response(true));
      sinon.stub(certificationCandidateController, 'authorizeToStart').returns('ok');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = { 'authorized-to-start': true };

      // when
      const response = await httpTestServer.request(
        'POST',
        '/api/certification-candidates/1/authorize-to-start',
        payload,
      );

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 401 if the user is not a supervisor of the session linked to the candidate and certification center is in the whitelist', async function () {
      //given
      sinon
        .stub(sessionSupervisorAuthorization, 'verifyByCertificationCandidateId')
        .callsFake((request, h) => h.response().code(401).takeover());

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = { 'authorized-to-start': true };

      // when
      const response = await httpTestServer.request(
        'POST',
        '/api/certification-candidates/1/authorize-to-start',
        payload,
      );

      // then
      expect(response.statusCode).to.equal(401);
    });
  });
});
