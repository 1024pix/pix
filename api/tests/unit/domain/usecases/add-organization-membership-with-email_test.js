const { expect, sinon, catchErr } = require('../../../test-helper');
const addOrganizationMembershipWithEmail = require('../../../../lib/domain/usecases/add-organization-membership-with-email');
const Membership = require('../../../../lib/domain/models/Membership');
const { AlreadyExistingMembershipError, UserNotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | add-organization-membership-with-email', () => {

  let userRepository;
  let membershipRepository;

  beforeEach(() => {
    membershipRepository = {
      create: sinon.stub(),
      findByOrganizationId: sinon.stub(),
    };
    userRepository = {
      findByEmail: sinon.stub(),
    };
  });

  context('success case', () => {

    const expectedMembership = Symbol('membership');
    const userId = 1;
    const user = { id: userId };
    const organizationId = 2;

    it('should insert a new membership with role OWNER', async () => {
      // given
      const role = Membership.roles.OWNER;
      const email = 'dev@example.net';
      membershipRepository.findByOrganizationId.resolves([]);
      userRepository.findByEmail.resolves(user);
      membershipRepository.create.withArgs(userId, organizationId, role).resolves(expectedMembership);

      // when
      const result = await addOrganizationMembershipWithEmail({ userRepository, membershipRepository, organizationId, email });

      // then
      expect(result).equal(expectedMembership);
    });

    it('should insert a new membership with role MEMBER', async () => {
      // given
      const role = Membership.roles.MEMBER;
      const email = 'dev@example.net';
      membershipRepository.findByOrganizationId.resolves([{ user: { id: 2 } }]);
      userRepository.findByEmail.resolves(user);
      membershipRepository.create.withArgs(userId, organizationId, role).resolves(expectedMembership);

      // when
      const result = await addOrganizationMembershipWithEmail({ userRepository, membershipRepository, organizationId, email });

      // then
      expect(result).equal(expectedMembership);
    });
  });

  context('when user is already member of this organization', () => {

    it('should throw an error', async () => {
      // given
      const userId = 1;
      const user = { id: userId };
      const email = 'dev@example.net';
      membershipRepository.findByOrganizationId.resolves([{ user: { id: userId } }]);
      userRepository.findByEmail.resolves(user);

      const organizationId = 2;

      // when
      const result = await catchErr(addOrganizationMembershipWithEmail)({ userRepository, membershipRepository, organizationId, email });

      // then
      expect(result).to.be.instanceOf(AlreadyExistingMembershipError);
    });
  });

  context('when user with this email does not exist', () => {

    it('should throw an error', async () => {
      // given
      const email = 'fake@email';
      membershipRepository.findByOrganizationId.resolves([]);
      userRepository.findByEmail.rejects(new UserNotFoundError());

      const organizationId = 2;

      // when
      const result = await catchErr(addOrganizationMembershipWithEmail)({ userRepository, membershipRepository, organizationId, email });

      // then
      expect(result).to.be.instanceOf(UserNotFoundError);
    });
  });
});
