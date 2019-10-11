const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const answerToOrganizationInvitation = require('../../../../lib/domain/usecases/answer-to-organization-invitation');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const Membership = require('../../../../lib/domain/models/Membership');
const { NotFoundError, AlreadyExistingOrganizationInvitationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | answer-to-organization-invitation', () => {

  let userRepository;
  let membershipRepository;
  let organizationInvitationRepository;

  beforeEach(() => {
    userRepository = {
      findByEmail: sinon.stub(),
    };
    membershipRepository = {
      create: sinon.stub(),
      findByOrganizationId: sinon.stub(),
    };
    organizationInvitationRepository = {
      getByIdAndTemporaryKey: sinon.stub(),
      markAsAccepted: sinon.stub(),
    };
  });

  context('when invitation with id and temporaryKey does not exist', () => {

    it('should throw a NotFoundError', async () => {
      // given
      organizationInvitationRepository.getByIdAndTemporaryKey.rejects(new NotFoundError());

      // when
      const error = await catchErr(answerToOrganizationInvitation)({
        organizationInvitationId: 1,
        temporaryKey: 'keyNotExist',
        organizationInvitationRepository
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when invitation is already accepted', () => {

    it('should throw an AlreadyExistingOrganizationInvitationError', async () => {
      // given
      const status = OrganizationInvitation.StatusType.ACCEPTED;
      const organizationInvitation = domainBuilder.buildOrganizationInvitation({ status });
      organizationInvitationRepository.getByIdAndTemporaryKey.resolves(organizationInvitation);

      // when
      const err = await catchErr(answerToOrganizationInvitation)({
        organizationInvitationId: organizationInvitation.id,
        organizationInvitationRepository
      });

      // then
      expect(err).to.be.instanceOf(AlreadyExistingOrganizationInvitationError);
    });
  });

  context('when invitation is not accepted yet', () => {

    it('should update invitation to accepted and create membership', async () => {
      // given
      const organizationInvitationPending = domainBuilder.buildOrganizationInvitation({
        status:  OrganizationInvitation.StatusType.PENDING
      });
      const { id: organizationInvitationId, organizationId, email, temporaryKey } = organizationInvitationPending;
      organizationInvitationRepository.getByIdAndTemporaryKey.resolves(organizationInvitationPending);

      const userToInvite = domainBuilder.buildUser();
      userRepository.findByEmail.resolves(userToInvite);
      membershipRepository.findByOrganizationId.resolves([{ user: { id: 2 } }]);

      const status = OrganizationInvitation.StatusType.ACCEPTED;
      const organizationRole = Membership.roles.MEMBER;

      // when
      await answerToOrganizationInvitation({
        organizationInvitationId, temporaryKey, status,
        userRepository, membershipRepository, organizationInvitationRepository
      });

      // then
      expect(userRepository.findByEmail).to.have.been.calledWith(email);
      expect(membershipRepository.findByOrganizationId).to.have.been.calledWith({ organizationId });
      expect(membershipRepository.create).to.have.been.calledWith(userToInvite.id, organizationId, organizationRole);
      expect(organizationInvitationRepository.markAsAccepted).to.have.been.calledWith(organizationInvitationId);
    });
  });

});
