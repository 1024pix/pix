const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const getUserWithMemberships = require('../../../../lib/domain/usecases/get-user-with-memberships');
const User = require('../../../../lib/domain/models/User');

describe('Unit | UseCase | get-user-with-memberships', () => {

  let userRepository;

  beforeEach(() => {
    userRepository = { getWithMemberships: sinon.stub() };
  });

  context('Access management', () => {

    it('should resolve the asked user details when authenticated user with role Pix Master', async () => {
      // given
      const pixMaster = { id: 1234, hasRolePixMaster: true };
      const queriedUser = { id: 5678 };

      userRepository.getWithMemberships.withArgs(pixMaster.id).resolves(pixMaster);
      userRepository.getWithMemberships.withArgs(queriedUser.id).resolves(queriedUser);

      // when
      const result = await getUserWithMemberships({
        authenticatedUserId: pixMaster.id,
        requestedUserId: queriedUser.id,
        userRepository
      });

      // then
      expect(result).to.equal(queriedUser);
    });

    it('should resolve the asked user details when authenticated user is the same as asked', async () => {
      // given
      const authenticatedUser = { id: 1234, hasRolePixMaster: false };

      userRepository.getWithMemberships.withArgs(authenticatedUser.id).resolves(authenticatedUser);

      // when
      const result = await getUserWithMemberships({
        authenticatedUserId: authenticatedUser.id,
        requestedUserId: authenticatedUser.id,
        userRepository
      });

      // then
      expect(result).to.equal(authenticatedUser);
    });

    it('should reject a "UserNotAuthorizedToAccessEntity" domain error when authenticated user has not role PixMaster and is not the one asked', async () => {
      // given
      const authenticatedUser = { id: 1234, hasRolePixMaster: false };

      userRepository.getWithMemberships.withArgs(authenticatedUser.id).resolves(authenticatedUser);

      // when
      const promise = getUserWithMemberships({
        authenticatedUserId: authenticatedUser.id,
        requestedUserId: 5678,
        userRepository
      });

      // then
      expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
    });
  });

  context('Output checking', () => {

    it('should return a User with its Memberships', async () => {
      // given
      const fetchedUser = domainBuilder.buildUser();
      userRepository.getWithMemberships.resolves(fetchedUser);

      // when
      const result = await getUserWithMemberships({
        authenticatedUserId: fetchedUser.id,
        requestedUserId: fetchedUser.id,
        userRepository,
      });

      // then
      expect(result).to.be.an.instanceOf(User);
      expect(result).to.equal(fetchedUser);
      expect(userRepository.getWithMemberships).to.have.been.calledTwice;
    });
  });
});
