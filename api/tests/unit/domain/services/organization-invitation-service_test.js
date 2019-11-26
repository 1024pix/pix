const { expect, sinon, catchErr } = require('../../../test-helper');

const {
  AlreadyExistingMembershipError, AlreadyExistingOrganizationInvitationError
} = require('../../../../lib/domain/errors');

const mailService = require('../../../../lib/domain/services/mail-service');
const { createOrganizationInvitation } = require('../../../../lib/domain/services/organization-invitation-service');

describe('Unit | Service | Organization-Invitation Service', () => {

  let organizationInvitationRepository;
  let membershipRepository;
  let organizationRepository;

  beforeEach(() => {
    organizationInvitationRepository = {
      create: sinon.stub(),
      findOneByOrganizationIdAndEmail: sinon.stub(),
    };
    membershipRepository = {
      isMembershipExistingByOrganizationIdAndEmail: sinon.stub()
    };
    organizationRepository = {
      get: sinon.stub()
    };
    sinon.stub(mailService, 'sendOrganizationInvitationEmail');
  });

  describe('#createOrganizationInvitation', () => {

    it('should throw an error if membership already exist', async () => {
      // given
      membershipRepository.isMembershipExistingByOrganizationIdAndEmail.rejects(new AlreadyExistingMembershipError());

      // when
      const result = await catchErr(createOrganizationInvitation)({ membershipRepository });

      // then
      expect(result).to.be.instanceOf(AlreadyExistingMembershipError);
    });

    it('should throw an error if organization-invitation already exist with status accepted', async () => {
      // given
      const isAccepted = true;

      membershipRepository.isMembershipExistingByOrganizationIdAndEmail.resolves();
      organizationInvitationRepository.findOneByOrganizationIdAndEmail.resolves({ isAccepted });

      // when
      const result = await catchErr(createOrganizationInvitation)({
        membershipRepository, organizationInvitationRepository
      });

      // then
      expect(result).to.be.instanceOf(AlreadyExistingOrganizationInvitationError);
    });

    it('should create a new organization-invitation and send an email with organizationId, email and code', async () => {
      // given
      membershipRepository.isMembershipExistingByOrganizationIdAndEmail.resolves();
      organizationInvitationRepository.findOneByOrganizationIdAndEmail.resolves(null);

      const organizationInvitationId = 10;
      const code = 'ABCDEFGH01';

      const organizationName = 'Organization Name';
      organizationRepository.get.resolves({ name: organizationName });

      mailService.sendOrganizationInvitationEmail.resolves();

      const organizationId = 1;
      const email = 'member@organization.org';
      organizationInvitationRepository.create.withArgs({
        organizationId, email, code: sinon.match.string
      }).resolves({ id: organizationInvitationId, code });

      // when
      await createOrganizationInvitation({
        membershipRepository, organizationRepository,
        organizationInvitationRepository, organizationId, email
      });

      // then
      expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith({
        email, organizationName, organizationInvitationId, code
      });
    });

    it('should send an email if organization-invitation already exist with status pending', async () => {
      // given
      const organizationId = 1;
      const organizationName = 'Organization Name';
      const organizationInvitationId = 100;
      const email = 'member@organization.org';
      const code = 'ABCDEFGH01';
      const isAccepted = false;

      membershipRepository.isMembershipExistingByOrganizationIdAndEmail.resolves();
      organizationInvitationRepository.findOneByOrganizationIdAndEmail.resolves({
        id: organizationInvitationId, isAccepted, code
      });
      organizationRepository.get.resolves({ name: organizationName });

      mailService.sendOrganizationInvitationEmail.resolves();

      // when
      await createOrganizationInvitation({
        membershipRepository, organizationRepository,
        organizationInvitationRepository, organizationId, email
      });

      // then
      expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith({
        email, organizationName, organizationInvitationId, code
      });
    });
  });

});
