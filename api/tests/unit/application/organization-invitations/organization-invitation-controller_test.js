import { organizationInvitationController } from '../../../../lib/application/organization-invitations/organization-invitation-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { usecases as srcUsecases } from '../../../../src/team/domain/usecases/index.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | Application | Organization-Invitations | organization-invitation-controller', function () {
  describe('#acceptOrganizationInvitation', function () {
    it('calls acceptOrganizationInvitation usecase to accept invitation with organizationInvitationId and code', async function () {
      // given
      const code = 'ABCDEFGH01';
      const email = 'random@email.com';
      const organizationInvitation = domainBuilder.buildOrganizationInvitation({ code, email });
      const request = {
        params: { id: organizationInvitation.id },
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: { code, email: email.toUpperCase() },
          },
        },
      };

      sinon.stub(usecases, 'acceptOrganizationInvitation').resolves();
      sinon.stub(srcUsecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember').resolves();

      // when
      await organizationInvitationController.acceptOrganizationInvitation(request);

      // then
      expect(usecases.acceptOrganizationInvitation).to.have.been.calledWithExactly({
        organizationInvitationId: organizationInvitation.id,
        code,
        email,
        localeFromCookie: undefined,
      });
    });

    it('calls createCertificationCenterMembershipForScoOrganizationAdminMember usecase to create certification center membership', async function () {
      // given
      const code = 'ABCDEFGH01';
      const email = 'random@email.com';
      const organizationInvitation = domainBuilder.buildOrganizationInvitation({ code, email });
      const membership = domainBuilder.buildMembership();
      const request = {
        params: { id: organizationInvitation.id },
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: { code, email },
          },
        },
      };

      sinon.stub(usecases, 'acceptOrganizationInvitation').resolves(membership);
      sinon.stub(srcUsecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember').resolves();

      // when
      await organizationInvitationController.acceptOrganizationInvitation(request);

      // then
      expect(
        srcUsecases.createCertificationCenterMembershipForScoOrganizationAdminMember,
      ).to.have.been.calledWithExactly({
        membership,
      });
    });
  });
});
