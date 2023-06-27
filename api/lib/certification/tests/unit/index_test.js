import { expect, HttpTestServer, sinon } from '../../../../tests/test-helper.js';
import { sessionController } from '../../../certification/application/session/session-controller.js';
import { authorization } from '../../../../lib/application/preHandlers/authorization.js';
import * as moduleUnderTest from '../../../certification/application/session/index.js';

describe('Unit | Application | Sessions | Routes', function () {
  describe('POST /api/sessions/{id}/certification-candidates', function () {
    it('should exist', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(sessionController, 'addCertificationCandidate').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/sessions/3/certification-candidates');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
