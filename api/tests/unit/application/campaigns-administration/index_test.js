import { expect, HttpTestServer, sinon } from '../../../test-helper';
import securityPreHandlers from '../../../../lib/application/security-pre-handlers';
import campaignController from '../../../../lib/application/campaigns-administration/campaign-controller';
import moduleUnderTest from '../../../../lib/application/campaigns-administration';

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
