import { adminCampaignParticipationController } from '../../../../../src/prescription/campaign-participation/application/admin-campaign-participation-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/campaign-participation/application/admin-campaign-participation-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Prescription | Admin Campaign Participation | Router', function () {
  describe('GET /api/admin/users/{id}/participations', function () {
    beforeEach(function () {
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif');
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier');
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport');

      sinon
        .stub(adminCampaignParticipationController, 'findCampaignParticipationsForUserManagement')
        .callsFake((request, h) => h.response('ok'));
    });

    it('should called the controller', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/admin/users/8/participations');

      // then
      expect(securityPreHandlers.hasAtLeastOneAccessOf.calledOnce).to.be.true;
      expect(securityPreHandlers.hasAtLeastOneAccessOf).to.have.been.calledWithExactly([
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
        securityPreHandlers.checkAdminMemberHasRoleCertif,
        securityPreHandlers.checkAdminMemberHasRoleSupport,
        securityPreHandlers.checkAdminMemberHasRoleMetier,
      ]);
      expect(adminCampaignParticipationController.findCampaignParticipationsForUserManagement.calledOnce).to.be.true;
    });

    it('should not called the controller', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns((request, h) =>
        h
          .response({ errors: new Error('') })
          .code(403)
          .takeover(),
      );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/admin/users/8/participations');

      // then
      sinon.assert.calledOnce(securityPreHandlers.hasAtLeastOneAccessOf);
      expect(adminCampaignParticipationController.findCampaignParticipationsForUserManagement.called).to.be.false;
    });
  });
});
