import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import acceptOrganizationInvitation from '../../../../lib/domain/usecases/accept-organization-invitation';
import OrganizationInvitedUser from '../../../../lib/domain/models/OrganizationInvitedUser';
import { AlreadyExistingMembershipError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | accept-organization-invitation', function () {
  let organizationInvitedUserRepository, organizationInvitationRepository;

  beforeEach(function () {
    organizationInvitedUserRepository = {
      get: sinon.stub(),
      save: sinon.stub(),
    };
    organizationInvitationRepository = {
      markAsAccepted: sinon.stub(),
    };
  });

  context('when the user`s membership already exist', function () {
    it('should mark the invitation as accepted', async function () {
      // given
      const code = '123AZE';
      const email = 'user@example.net';
      const organization = domainBuilder.buildOrganization();
      const organizationInvitation = domainBuilder.buildOrganizationInvitation({
        organizationId: organization.id,
        code,
      });
      const user = domainBuilder.buildUser();
      const membership = domainBuilder.buildMembership({ user, organization, organizationRole: 'ADMIN' });

      const organizationInvitedUser = new OrganizationInvitedUser({
        userId: user.id,
        invitation: { code, id: organizationInvitation.id },
        currentRole: membership.organizationRole,
        status: organizationInvitation.status,
      });
      organizationInvitedUserRepository.get
        .withArgs({ organizationInvitationId: organizationInvitation.id, email })
        .resolves(organizationInvitedUser);

      // when
      const error = await catchErr(acceptOrganizationInvitation)({
        organizationInvitationId: organizationInvitation.id,
        code,
        email,
        organizationInvitationRepository,
        organizationInvitedUserRepository,
      });

      // then
      expect(organizationInvitationRepository.markAsAccepted).to.have.been.calledWith(organizationInvitation.id);
      expect(error).to.be.instanceOf(AlreadyExistingMembershipError);
    });
  });

  it('should return the membership id and role', async function () {
    // given
    const code = '123AZE';
    const email = 'user@example.net';
    const organization = domainBuilder.buildOrganization();
    const organizationInvitationId = domainBuilder.buildOrganizationInvitation({
      organizationId: organization.id,
      code,
    }).id;
    const user = domainBuilder.buildUser();

    const organizationInvitedUser = new OrganizationInvitedUser({
      userId: user.id,
      invitation: { code, id: organizationInvitationId },
    });
    organizationInvitedUserRepository.get
      .withArgs({ organizationInvitationId, email })
      .resolves(organizationInvitedUser);

    sinon.stub(organizationInvitedUser, 'acceptInvitation').resolves();

    const membership = domainBuilder.buildMembership({ user, organization, organizationRole: 'MEMBER' });
    organizationInvitedUser.currentMembershipId = membership.id;
    organizationInvitedUser.currentRole = membership.organizationRole;

    // when
    const result = await acceptOrganizationInvitation({
      organizationInvitationId,
      code,
      email,
      organizationInvitationRepository,
      organizationInvitedUserRepository,
    });

    // then
    expect(organizationInvitedUserRepository.save).to.have.been.calledWith({ organizationInvitedUser });
    expect(result).to.deep.equal({
      id: organizationInvitedUser.currentMembershipId,
      isAdmin: false,
    });
  });
});
