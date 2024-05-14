import { campaignController } from '../../../../lib/application/campaigns/campaign-controller.js';
import { campaignStatsController } from '../../../../lib/application/campaigns/campaign-stats-controller.js';
import * as moduleUnderTest from '../../../../lib/application/campaigns/index.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Application | Router | campaign-router ', function () {
  describe('GET /api/campaigns/{id}/analyses', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(campaignController, 'getAnalysis').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/1/analyses');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/wrong_id/analyses');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

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
