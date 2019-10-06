const { expect, sinon, catchErr } = require('../../../test-helper');

const createOrganizationInvitation = require('../../../../lib/domain/usecases/create-organization-invitation');
const mailService = require('../../../../lib/domain/services/mail-service');
const { UserNotFoundError, AlreadyExistingMembershipError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-organization-invitation', () => {

  let organizationInvitationRepository;
  let userRepository;
  let membershipRepository;
  let organizationRepository;

  beforeEach(() => {
    organizationInvitationRepository = {
      create: sinon.stub(),
      findByOrganizationIdAndEmail: sinon.stub(),
    };
    userRepository = {
      isUserExistingByEmail: sinon.stub(),
    };
    membershipRepository = {
      isMembershipExistingByOrganizationIdAndEmail: sinon.stub()
    };
    organizationRepository = {
      get: sinon.stub()
    };
    sinon.stub(mailService, 'sendOrganizationInvitationEmail');
  });

  it('should throw an error if user email does not already exist', async () => {
    // given
    userRepository.isUserExistingByEmail.rejects(new UserNotFoundError());

    const organizationId = 1;
    const email = 'member@organization.org';

    // when
    const result = await catchErr(createOrganizationInvitation)({ userRepository, organizationInvitationRepository, organizationId, email });

    // then
    expect(result).to.be.instanceOf(UserNotFoundError);
  });

  it('should throw an error if membership already exist with organizationId and email', async () => {
    // given
    userRepository.isUserExistingByEmail.resolves();
    membershipRepository.isMembershipExistingByOrganizationIdAndEmail.rejects(new AlreadyExistingMembershipError());

    const organizationId = 1;
    const email = 'member@organization.org';

    // when
    const result = await catchErr(createOrganizationInvitation)({ userRepository, membershipRepository, organizationInvitationRepository, organizationId, email });

    // then
    expect(result).to.be.instanceOf(AlreadyExistingMembershipError);
  });

  it('should create a new organization-invitation and send an email with organizationId, email and temporaryKey', async () => {
    // given
    userRepository.isUserExistingByEmail.resolves();
    membershipRepository.isMembershipExistingByOrganizationIdAndEmail.resolves();
    organizationInvitationRepository.findByOrganizationIdAndEmail.resolves([]);

    const organizationInvitationId = 10;
    const temporaryKey = 'temporaryKey';
    organizationInvitationRepository.create.resolves({ id: organizationInvitationId, temporaryKey });

    const organizationName = 'Organization Name';
    organizationRepository.get.resolves({ name: organizationName });

    mailService.sendOrganizationInvitationEmail.resolves();

    const organizationId = 1;
    const email = 'member@organization.org';

    // when
    await createOrganizationInvitation({
      userRepository, membershipRepository, organizationRepository,
      organizationInvitationRepository, organizationId, email });

    // then
    expect(organizationInvitationRepository.create).to.has.been.calledWith(organizationId, email);
    expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith(
      email, organizationName, organizationInvitationId, temporaryKey
    );
  });
});
