const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const campaignController = require('../../../../lib/application/campaigns-administration/campaign-controller');

const moduleUnderTest = require('../../../../lib/application/campaigns-administration');

describe('Unit | Application | Router | campaign-participation-router ', function () {
  describe('PATCH /api/admin/campaigns/archive-campaigns', function () {
    it('returns 200 when admin member has rights', async function () {
      // given
      sinon.stub(campaignController, 'archiveCampaigns').returns(null);
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('POST', '/api/admin/campaigns/archive-campaigns', {});

      // then
      expect(securityPreHandlers.adminMemberHasAtLeastOneAccessOf).to.have.been.calledWith([
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
        securityPreHandlers.checkAdminMemberHasRoleMetier,
      ]);
    });
  });
});
