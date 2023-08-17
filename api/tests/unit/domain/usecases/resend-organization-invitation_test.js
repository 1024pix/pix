import { resendOrganizationInvitation } from '../../../../lib/domain/usecases/resend-organization-invitation.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | resend-organization-invitation', function () {
  describe('#resendOrganizationInvitation', function () {
    it('should update the organization-invitation according organizationId and email', async function () {
      // given
      const organizationId = 1;
      const email = 'member@organization.org';
      const locale = 'fr-fr';

      const organizationRepository = Symbol('organization repository');
      const organizationInvitationRepository = Symbol('organization invitation repository');
      const organizationInvitationService = { createOrUpdateOrganizationInvitation: sinon.stub() };

      // when
      await resendOrganizationInvitation({
        organizationId,
        email,
        locale,
        organizationRepository,
        organizationInvitationRepository,
        organizationInvitationService,
      });

      // then
      expect(organizationInvitationService.createOrUpdateOrganizationInvitation).to.has.been.calledOnceWith({
        organizationId,
        email,
        locale,
        organizationRepository,
        organizationInvitationRepository,
      });
    });
  });
});
