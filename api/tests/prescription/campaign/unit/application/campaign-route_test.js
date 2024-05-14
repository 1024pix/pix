import { campaignController } from '../../../../../src/prescription/campaign/application/campaign-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/campaign/application/campaign-route.js';
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

  describe('GET /api/campaigns/{id}/groups', function () {
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
});
