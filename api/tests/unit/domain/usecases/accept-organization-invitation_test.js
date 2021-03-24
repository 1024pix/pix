const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const acceptOrganizationInvitation = require('../../../../lib/domain/usecases/accept-organization-invitation');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const Membership = require('../../../../lib/domain/models/Membership');
const { NotFoundError, AlreadyExistingOrganizationInvitationError, AlreadyExistingMembershipError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | accept-organization-invitation', function() {

  let userRepository;
  let membershipRepository;
  let organizationInvitationRepository;

  beforeEach(function() {
    userRepository = {
      getByEmail: sinon.stub(),
    };
    membershipRepository = {
      create: sinon.stub(),
      findByOrganizationId: sinon.stub(),
      updateById: sinon.stub(),
    };
    organizationInvitationRepository = {
      getByIdAndCode: sinon.stub(),
      markAsAccepted: sinon.stub(),
    };
  });

  context('when invitation with id and code does not exist', function() {

    it('should throw a NotFoundError', async function() {
      // given
      organizationInvitationRepository.getByIdAndCode.rejects(new NotFoundError());

      // when
      const error = await catchErr(acceptOrganizationInvitation)({
        organizationInvitationId: 1,
        code: 'codeNotExist',
        organizationInvitationRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when invitation is already accepted', function() {

    it('should throw an AlreadyExistingOrganizationInvitationError', async function() {
      // given
      const status = OrganizationInvitation.StatusType.ACCEPTED;
      const organizationInvitation = domainBuilder.buildOrganizationInvitation({ status });
      organizationInvitationRepository.getByIdAndCode.resolves(organizationInvitation);

      // when
      const err = await catchErr(acceptOrganizationInvitation)({
        organizationInvitationId: organizationInvitation.id,
        organizationInvitationRepository,
      });

      // then
      expect(err).to.be.instanceOf(AlreadyExistingOrganizationInvitationError);
    });
  });

  context('when invitation is not accepted yet', function() {

    const email = 'random@email.com';
    let pendingOrganizationInvitation;
    let userToInvite;

    beforeEach(function() {
      pendingOrganizationInvitation = domainBuilder.buildOrganizationInvitation({
        status: OrganizationInvitation.StatusType.PENDING,
      });
      organizationInvitationRepository.getByIdAndCode.resolves(pendingOrganizationInvitation);

      userToInvite = domainBuilder.buildUser({ email });
      userRepository.getByEmail.withArgs(email).resolves(userToInvite);
    });

    context('when the user is the first one to join the organization', function() {

      it('should create a membership with ADMIN role', async function() {
        // given
        const { id: organizationInvitationId, organizationId, code } = pendingOrganizationInvitation;
        membershipRepository.findByOrganizationId.withArgs({ organizationId }).resolves([]);

        // when
        await acceptOrganizationInvitation({
          organizationInvitationId, code, email,
          userRepository, membershipRepository, organizationInvitationRepository,
        });

        // then
        expect(membershipRepository.create).to.have.been.calledWith(userToInvite.id, organizationId, Membership.roles.ADMIN);
        expect(organizationInvitationRepository.markAsAccepted).to.have.been.calledWith(organizationInvitationId);
      });
    });

    context('when the user is not the first one to join the organization', function() {

      it('should create a membership with MEMBER role', async function() {
        // given
        const { id: organizationInvitationId, organizationId, code } = pendingOrganizationInvitation;
        membershipRepository.findByOrganizationId.withArgs({ organizationId }).resolves([{ user: { id: 2 } }]);

        // when
        await acceptOrganizationInvitation({
          organizationInvitationId, code, email,
          userRepository, membershipRepository, organizationInvitationRepository,
        });

        // then
        expect(membershipRepository.create).to.have.been.calledWith(userToInvite.id, organizationId, Membership.roles.MEMBER);
        expect(organizationInvitationRepository.markAsAccepted).to.have.been.calledWith(organizationInvitationId);
      });
    });

    context('when the role is already defined in the invitation', function() {

      it('should create a membership according to the invitation role', async function() {
        // given
        pendingOrganizationInvitation.role = Membership.roles.ADMIN;
        const { id: organizationInvitationId, organizationId, code, role } = pendingOrganizationInvitation;
        membershipRepository.findByOrganizationId.withArgs({ organizationId }).resolves([{ user: { id: 3 } }]);

        // when
        await acceptOrganizationInvitation({
          organizationInvitationId, code, email,
          userRepository, membershipRepository, organizationInvitationRepository,
        });

        // then
        expect(membershipRepository.create).to.have.been.calledWith(userToInvite.id, organizationId, role);
        expect(organizationInvitationRepository.markAsAccepted).to.have.been.calledWith(organizationInvitationId);
      });

    });

    context('when user already belongs to organization', function() {

      let membership;

      beforeEach(function() {
        membership = domainBuilder.buildMembership({ user: userToInvite, organizationRole: Membership.roles.MEMBER });
        membershipRepository.findByOrganizationId.withArgs({
          organizationId: pendingOrganizationInvitation.organizationId,
        }).resolves([ membership ]);
      });

      it('should throw an AlreadyExistingMembershipError', async function() {
        // given
        const { id: organizationInvitationId, code } = pendingOrganizationInvitation;

        // when
        const err = await catchErr(acceptOrganizationInvitation)({
          organizationInvitationId, code, email,
          userRepository, membershipRepository, organizationInvitationRepository,
        });

        // then
        expect(err).to.be.instanceOf(AlreadyExistingMembershipError);
      });

      context('when the role is already defined in the invitation', function() {

        it('should update a membership according to the invitation role', async function() {
          // given
          pendingOrganizationInvitation.role = Membership.roles.ADMIN;
          const { id: organizationInvitationId, code } = pendingOrganizationInvitation;
          membershipRepository.updateById.resolves({ organizationRole: pendingOrganizationInvitation.role, ...membership });

          // when
          await acceptOrganizationInvitation({
            organizationInvitationId, code, email,
            userRepository, membershipRepository, organizationInvitationRepository,
          });

          // then
          expect(membershipRepository.updateById).to.have.been.calledWith({ id: membership.id, membershipAttributes: { organizationRole: pendingOrganizationInvitation.role } });
          expect(organizationInvitationRepository.markAsAccepted).to.have.been.calledWith(organizationInvitationId);
        });
      });
    });
  });
});
