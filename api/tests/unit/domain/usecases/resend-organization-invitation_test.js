import { expect, sinon } from '../../../test-helper';
import organizationInvitationService from '../../../../lib/domain/services/organization-invitation-service';
import resendOrganizationInvitation from '../../../../lib/domain/usecases/resend-organization-invitation';

describe('Unit | UseCase | resend-organization-invitation', function () {
  describe('#resendOrganizationInvitation', function () {
    it('should update the organization-invitation according organizationId and email', async function () {
      // given
      const organizationId = 1;
      const email = 'member@organization.org';
      const locale = 'fr-fr';

      const organizationRepository = Symbol('organization repository');
      const organizationInvitationRepository = Symbol('organization invitation repository');
      sinon.stub(organizationInvitationService, 'createOrUpdateOrganizationInvitation').resolves();

      // when
      await resendOrganizationInvitation({
        organizationId,
        email,
        locale,
        organizationRepository,
        organizationInvitationRepository,
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
