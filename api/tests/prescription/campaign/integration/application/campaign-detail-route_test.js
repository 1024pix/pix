import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { campaignDetailController } from '../../../../../src/prescription/campaign/application/campaign-detail-controller.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import * as moduleUnderTest from '../../../../../src/prescription/campaign/application/campaign-detail-route.js';

describe('Integration | Application | Route | campaign detail router', function () {
  let httpTestServer;

  describe('GET /api/campaigns/{id}/csv-profiles-collection-results', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAuthorizationToAccessCampaign').callsFake((request, h) => h.response(true));
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

  describe('GET /api/campaigns/{id}/csv-assessment-results', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAuthorizationToAccessCampaign').callsFake((request, h) => h.response(true));
      sinon.stub(campaignDetailController, 'getCsvAssessmentResults').callsFake((_, h) => h.response('ok').code(200));
      const method = 'GET';
      const url = '/api/campaigns/1/csv-assessment-results';

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(campaignDetailController.getCsvAssessmentResults).to.have.been.calledOnce;
    });
  });

  describe('GET /api/organizations/:id/campaigns', function () {
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
