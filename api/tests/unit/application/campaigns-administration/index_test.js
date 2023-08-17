import { campaignController } from '../../../../lib/application/campaigns-administration/campaign-controller.js';
import * as moduleUnderTest from '../../../../lib/application/campaigns-administration/index.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

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
