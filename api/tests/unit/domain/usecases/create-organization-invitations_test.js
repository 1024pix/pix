const { expect, sinon } = require('../../../test-helper');

const organizationInvitationService = require('../../../../lib/domain/services/organization-invitation-service');
const Membership = require('../../../../lib/domain/models/Membership');

const createOrganizationInvitations = require('../../../../lib/domain/usecases/create-organization-invitations');

describe('Unit | UseCase | create-organization-invitations', function () {
  let organizationInvitationRepository;
  let organizationRepository;

  beforeEach(function () {
    sinon.stub(organizationInvitationService, 'createOrganizationInvitation').resolves();
  });

  describe('#createOrganizationInvitations', function () {
    it('should create one organization-invitation with organizationId, role and email', async function () {
      // given
      const organizationId = 1;
      const emails = ['member@organization.org'];
      const locale = 'fr-fr';
      const role = Membership.roles.MEMBER;

      // when
      await createOrganizationInvitations({
        organizationRepository,
        organizationInvitationRepository,
        organizationId,
        emails,
        locale,
        role,
      });

      // then
      expect(organizationInvitationService.createOrganizationInvitation).to.has.been.calledOnce;
      expect(organizationInvitationService.createOrganizationInvitation).to.has.been.calledWith({
        organizationRepository,
        organizationInvitationRepository,
        organizationId,
        email: emails[0],
        locale,
        role,
      });
    });

    it('should delete spaces and duplicated emails, and create two organization-invitations', async function () {
      // given
      const organizationId = 2;
      const emails = ['member01@organization.org', '   member01@organization.org', 'member02@organization.org'];

      // when
      await createOrganizationInvitations({
        organizationRepository,
        organizationInvitationRepository,
        organizationId,
        emails,
      });

      // then
      expect(organizationInvitationService.createOrganizationInvitation).to.has.been.calledTwice;
    });
  });
});
