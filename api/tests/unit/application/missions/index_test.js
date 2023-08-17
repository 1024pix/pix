import * as moduleUnderTest from '../../../../lib/application/missions/index.js';
import { missionController } from '../../../../lib/application/missions/mission-controller.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Router | mission-router', function () {
  describe('GET /api/pix1d/missions/${missionId}', function () {
    it('should return 200 if the mission is found', async function () {
      // given
      sinon.stub(missionController, 'getById').callsFake((request, h) => h.response('ok'));

      sinon.stub(securityPreHandlers, 'checkPix1dActivated').callsFake((request, h) => h.response());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/pix1d/missions/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
