import { campaignParticipationController } from '../../../../lib/application/campaign-participations/campaign-participation-controller.js';
import * as moduleUnderTest from '../../../../lib/application/campaign-participations/index.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Application | Router | campaign-participation-router ', function () {
  describe('GET /api/campaign-participations/{id}/trainings', function () {
    it('should return an HTTP status code 200', async function () {
      // given
      sinon.stub(campaignParticipationController, 'findTrainings').resolves('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/campaign-participations/2/trainings');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
