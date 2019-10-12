const { expect, sinon, catchErr } = require('../../../test-helper');
const createOrganizationInvitation = require('../../../../lib/domain/usecases/create-organization-invitation');
const { UserNotFoundError, AlreadyExistingMembershipError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-organization-invitation', () => {

  let organizationInvitationRepository;
  let userRepository;
  let membershipRepository;

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

  it('should insert a new organization invitation with status pending', async () => {
    // given
    userRepository.isUserExistingByEmail.resolves();
    membershipRepository.isMembershipExistingByOrganizationIdAndEmail.resolves();
    organizationInvitationRepository.findByOrganizationIdAndEmail.resolves([]);

    const organizationId = 1;
    const email = 'member@organization.org';

    // when
    await createOrganizationInvitation({ userRepository, membershipRepository, organizationInvitationRepository, organizationId, email });

    // then
    expect(organizationInvitationRepository.create).to.has.been.calledWithExactly(organizationId, email);
  });
});
