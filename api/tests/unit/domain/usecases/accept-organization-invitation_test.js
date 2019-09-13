const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const acceptOrganizationInvitation = require('../../../../lib/domain/usecases/accept-organization-invitation');
const organizationInvitationRepository = require('../../../../lib/infrastructure/repositories/organization-invitation-repository');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const { AlreadyExistingOrganizationInvitationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | accept-organization-invitation', () => {

  beforeEach(() => {
    sinon.stub(organizationInvitationRepository, 'get');
    sinon.stub(organizationInvitationRepository, 'markAsAccepted');
  });

  context('when invitation is already accepted', () => {

    it('should not update invitation', async () => {
      // given
      const status = OrganizationInvitation.StatusType.ACCEPTED;
      const organizationInvitation = domainBuilder.buildOrganizationInvitation({ status });
      organizationInvitationRepository.get.resolves(organizationInvitation);

      // when
      const err = await catchErr(acceptOrganizationInvitation)({
        organizationInvitationId: organizationInvitation.id,
        organizationInvitationRepository
      });

      // then
      expect(err).to.be.instanceOf(AlreadyExistingOrganizationInvitationError);
    });
  });

  context('when invitation is not accepted yet', () => {

    it('should accept invitation', async () => {
      // given
      const status = OrganizationInvitation.StatusType.PENDING;
      const organizationInvitation = domainBuilder.buildOrganizationInvitation({ status });
      const organizationInvitationId = organizationInvitation.id;

      organizationInvitationRepository.get.resolves(organizationInvitation);

      // when
      await acceptOrganizationInvitation({ organizationInvitationId, organizationInvitationRepository });

      // then
      expect(organizationInvitationRepository.markAsAccepted).to.have.been.calledWith(organizationInvitationId);
    });

  });

});
