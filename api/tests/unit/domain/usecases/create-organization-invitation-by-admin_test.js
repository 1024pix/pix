const { expect, sinon } = require('../../../test-helper');

const organizationInvitationService = require('../../../../lib/domain/services/organization-invitation-service');
const Membership = require('../../../../lib/domain/models/Membership');

const createOrganizationInvitationByAdmin = require('../../../../lib/domain/usecases/create-organization-invitation-by-admin');

describe('Unit | UseCase | create-organization-invitation-by-admin', function () {
  describe('#createOrganizationInvitationByAdmin', function () {
    it('should create one organization-invitation with organizationId, role and email', async function () {
      // given
      const organizationId = 1;
      const email = 'member@organization.org';
      const locale = 'fr-fr';
      const role = Membership.roles.MEMBER;

      const organizationInvitationRepository = sinon.stub();
      const organizationRepository = sinon.stub();
      sinon.stub(organizationInvitationService, 'createOrganizationInvitation').resolves();

      // when
      await createOrganizationInvitationByAdmin({
        organizationId,
        email,
        locale,
        role,
        organizationRepository,
        organizationInvitationRepository,
      });

      // then
      expect(organizationInvitationService.createOrganizationInvitation).to.has.been.calledOnce;
      expect(organizationInvitationService.createOrganizationInvitation).to.has.been.calledWith({
        organizationId,
        email,
        locale,
        role,
        organizationRepository,
        organizationInvitationRepository,
      });
    });
  });
});
