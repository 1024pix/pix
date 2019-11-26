const { expect, sinon } = require('../../../test-helper');

const organizationInvitationService = require('../../../../lib/domain/services/organization-invitation-service');

const createOrganizationInvitations = require('../../../../lib/domain/usecases/create-organization-invitations');

describe('Unit | UseCase | create-organization-invitations', () => {

  let organizationInvitationRepository;
  let membershipRepository;
  let organizationRepository;

  beforeEach(() => {
    sinon.stub(organizationInvitationService, 'createOrganizationInvitation').resolves();
  });

  describe('#createOrganizationInvitations', () => {

    it('should create one organization-invitation with organizationId and email', async () => {
      // given
      const organizationId = 1;
      const emails = ['member@organization.org'];

      // when
      await createOrganizationInvitations({
        membershipRepository, organizationRepository, organizationInvitationRepository,
        organizationId, emails
      });

      // then
      expect(organizationInvitationService.createOrganizationInvitation).to.has.been.calledOnce;
      expect(organizationInvitationService.createOrganizationInvitation).to.has.been.calledWith({
        membershipRepository, organizationRepository, organizationInvitationRepository,
        organizationId, email: emails[0]
      });
    });

    it('should create two organization-invitations and send two emails', async () => {
      // given
      const organizationId = 2;
      const emails = ['member01@organization.org', 'member02@organization.org'];

      // when
      await createOrganizationInvitations({
        membershipRepository, organizationRepository,
        organizationInvitationRepository, organizationId, emails
      });

      // then
      expect(organizationInvitationService.createOrganizationInvitation).to.has.been.calledTwice;
    });
  });

});
