import sinon from 'sinon';

import { campaignParticipationController } from '../../../../../src/devcomp/application/campaign-participations/campaign-participation-controller.js';
import { campaignParticipationRoute as moduleUnderTest } from '../../../../../src/devcomp/application/campaign-participations/campaign-participation-route.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

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
