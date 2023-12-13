import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { campaignDetailController } from '../../../../../src/prescription/campaign/application/campaign-detail-controller.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import * as moduleUnderTest from '../../../../../src/prescription/campaign/application/campaign-detail-route.js';

describe('Integration | Application | Route | campaign detail router', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api/organizations/:id/campaigns', function () {
    it('should call the organization controller to get the campaigns', async function () {
      sinon.stub(campaignDetailController, 'findPaginatedFilteredCampaigns').returns('ok');
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));

      // given
      const method = 'GET';
      const url = '/api/organizations/1/campaigns';

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(campaignDetailController.findPaginatedFilteredCampaigns).to.have.been.calledOnce;
    });
  });
});
