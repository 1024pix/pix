import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { campaignController } from '../../../../lib/application/campaigns/campaign-controller.js';
import * as moduleUnderTest from '../../../../lib/application/campaigns/index.js';

describe('Integration | Application | Route | campaignRouter', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(campaignController, 'getAnalysis').callsFake((_, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api/campaigns/{id}/analyses', function () {
    it('should return 200', async function () {
      // given
      const campaignId = 1;

      // when
      const response = await httpTestServer.request('GET', `/api/campaigns/${campaignId}/analyses`);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400', async function () {
      // given
      const campaignId = 'wrongId';

      // when
      const response = await httpTestServer.request('GET', `/api/campaigns/${campaignId}/analyses`);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
