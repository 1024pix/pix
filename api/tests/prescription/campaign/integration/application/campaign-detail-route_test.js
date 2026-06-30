import sinon from 'sinon';

import { campaignDetailController } from '../../../../../src/prescription/campaign/application/campaign-detail-controller.js';
import { campaignDetailRoute as moduleUnderTest } from '../../../../../src/prescription/campaign/application/campaign-detail-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Integration | Application | Route | campaign detail router', function () {
  let httpTestServer;

  describe('GET /api/campaigns/{campaignId}/csv-profiles-collection-results', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkOrganizationAccess').returns(true);
      sinon.stub(securityPreHandlers, 'checkAuthorizationToAccessCampaign').returns(true);
      sinon
        .stub(campaignDetailController, 'getCsvProfilesCollectionResults')
        .callsFake((_, h) => h.response('ok').code(200));

      const method = 'GET';
      const url = '/api/campaigns/1/csv-profiles-collection-results';

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/organizations/{organizationId}/campaigns', function () {
    it('should call the organization controller to get the campaigns', async function () {
      sinon.stub(campaignDetailController, 'findPaginatedFilteredCampaigns').returns('ok');
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));

      // given
      const method = 'GET';
      const url = '/api/organizations/1/campaigns';
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(campaignDetailController.findPaginatedFilteredCampaigns).to.have.been.calledOnce;
    });
  });
});
