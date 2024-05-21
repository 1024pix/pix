import { campaignStatsController } from '../../../../../src/prescription/campaign/application/campaign-stats-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/campaign/application/campaign-stats-route.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Router | campaign-router ', function () {
  describe('GET /api/campaigns/{id}/stats/participations-by-stage', function () {
    it('should return 200', async function () {
      // given
      sinon
        .stub(campaignStatsController, 'getParticipationsByStage')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/stats/participations-by-stage');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/invalid/stats/participations-by-stage');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/campaigns/{id}/stats/participations-by-status', function () {
    it('should return 200', async function () {
      sinon
        .stub(campaignStatsController, 'getParticipationsByStatus')
        .callsFake((request, h) => h.response('ok').code(200));

      // when
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const result = await httpTestServer.request('GET', '/api/campaigns/1/stats/participations-by-status');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // when
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const result = await httpTestServer.request('GET', '/api/campaigns/invalid/stats/participations-by-status');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/campaigns/{id}/stats/participations-by-mastery-rate', function () {
    beforeEach(function () {
      sinon
        .stub(campaignStatsController, 'getParticipationsCountByMasteryRate')
        .callsFake((request, h) => h.response('ok').code(200));
    });

    it('should return 200', async function () {
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const result = await httpTestServer.request('GET', '/api/campaigns/1/stats/participations-by-mastery-rate');

      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const result = await httpTestServer.request('GET', '/api/campaigns/invalid/stats/participations-by-mastery-rate');

      expect(result.statusCode).to.equal(400);
    });
  });
});
