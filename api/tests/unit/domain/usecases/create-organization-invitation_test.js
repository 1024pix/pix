const { expect, sinon, catchErr } = require('../../../test-helper');

const createOrganizationInvitation = require('../../../../lib/domain/usecases/create-organization-invitation');
const mailService = require('../../../../lib/domain/services/mail-service');
const {
  AlreadyExistingMembershipError, AlreadyExistingOrganizationInvitationError
} = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-organization-invitation', () => {

  let organizationInvitationRepository;
  let userRepository;
  let membershipRepository;
  let organizationRepository;

  beforeEach(() => {
    organizationInvitationRepository = {
      create: sinon.stub(),
      findOneByOrganizationIdAndEmail: sinon.stub(),
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

  it('should throw an error if membership already exist with organizationId and email', async () => {
    // given
    userRepository.isUserExistingByEmail.resolves();
    membershipRepository.isMembershipExistingByOrganizationIdAndEmail.rejects(new AlreadyExistingMembershipError());

    const organizationId = 1;
    const email = 'member@organization.org';

    // when
    const result = await catchErr(createOrganizationInvitation)({
      userRepository, membershipRepository, organizationInvitationRepository, organizationId, email
    });

    // then
    expect(result).to.be.instanceOf(AlreadyExistingMembershipError);
  });

  it('should throw an error if organization-invitation already exist with status accepted', async () => {
    // given
    const organizationId = 1;
    const email = 'member@organization.org';
    const isAccepted = true;

    userRepository.isUserExistingByEmail.resolves();
    membershipRepository.isMembershipExistingByOrganizationIdAndEmail.resolves();
    organizationInvitationRepository.findOneByOrganizationIdAndEmail.resolves({ isAccepted });

    // when
    const result = await catchErr(createOrganizationInvitation)({
      userRepository, membershipRepository, organizationInvitationRepository, organizationId, email
    });

    // then
    expect(result).to.be.instanceOf(AlreadyExistingOrganizationInvitationError);
  });

  it('should create a new organization-invitation and send an email with organizationId, email and code', async () => {
    // given
    userRepository.isUserExistingByEmail.resolves();
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
      userRepository, membershipRepository, organizationRepository,
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

    userRepository.isUserExistingByEmail.resolves();
    membershipRepository.isMembershipExistingByOrganizationIdAndEmail.resolves();
    organizationInvitationRepository.findOneByOrganizationIdAndEmail.resolves({
      id: organizationInvitationId, isAccepted, code
    });
    organizationRepository.get.resolves({ name: organizationName });

    mailService.sendOrganizationInvitationEmail.resolves();

    // when
    await createOrganizationInvitation({
      userRepository, membershipRepository, organizationRepository,
      organizationInvitationRepository, organizationId, email
    });

    // then
    expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith({
      email, organizationName, organizationInvitationId, code
    });
  });

});
