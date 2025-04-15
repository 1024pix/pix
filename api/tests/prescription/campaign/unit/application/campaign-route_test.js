import { campaignController } from '../../../../../src/prescription/campaign/application/campaign-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/campaign/application/campaign-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Router | campaign-router ', function () {
  describe('GET /api/campaigns/{campaignId}/divisions', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(campaignController, 'division').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/divisions');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/invalid/divisions');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/campaigns/{campaignId}/groups', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(campaignController, 'getGroups').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/1/groups');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/campaigns/invalid/groups');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/campaigns/{campaignId}/analyses', function () {
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

  describe('GET /api/campaigns/{campaignId}/level-per-tubes-and-competences', function () {
    describe('User is not authorized to access campaign', function () {
      it('should return 403', async function () {
        // given
        sinon
          .stub(campaignController, 'getLevelPerTubesAndCompetences')
          .callsFake((request, h) => h.response('ok').code(200));
        sinon
          .stub(securityPreHandlers, 'checkAuthorizationToAccessCampaign')
          .callsFake((request, h) => h.response().code(403).takeover());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/campaigns/1/level-per-tubes-and-competences');

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Wrong campaign id', function () {
      it('should return 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/campaigns/wrongId/level-per-tubes-and-competences');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
