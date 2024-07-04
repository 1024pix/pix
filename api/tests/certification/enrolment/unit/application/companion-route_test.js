import { companionController } from '../../../../../src/certification/enrolment/application/companion-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/enrolment/application/companion-route.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Router | companion-route', function () {
  describe('GET /api/companion/ping', function () {
    it('should return 204', async function () {
      // when
      sinon.stub(companionController, 'savePing').callsFake((_, h) => h.response().code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const auth = { credentials: { userId: 99 }, strategy: {} };

      const response = await httpTestServer.request('POST', '/api/companion/ping', {}, auth);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
