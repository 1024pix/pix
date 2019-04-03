const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const getUser = require('../../../../lib/domain/usecases/get-user');
const User = require('../../../../lib/domain/models/User');

describe('Unit | UseCase | get-user', () => {

  let userRepository;

  beforeEach(() => {
    userRepository = { get: sinon.stub() };
  });

  context('Access management', () => {

    it('should resolve the asked user details when authenticated user is the same as asked', async () => {
      // given
      const authenticatedUser = { id: 1234 };

      userRepository.get.withArgs(authenticatedUser.id).resolves(authenticatedUser);

      // when
      const result = await getUser({
        authenticatedUserId: authenticatedUser.id,
        requestedUserId: authenticatedUser.id,
        userRepository
      });

      // then
      expect(result).to.equal(authenticatedUser);
    });

    it('should reject a "UserNotAuthorizedToAccessEntity" domain error when authenticated user is not the one asked', async () => {
      // when
      const promise = getUser({
        authenticatedUserId: 1,
        requestedUserId: 2,
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
      userRepository.get.resolves(fetchedUser);

      // when
      const result = await getUser({
        authenticatedUserId: fetchedUser.id,
        requestedUserId: fetchedUser.id,
        userRepository,
      });

      // then
      expect(result).to.be.an.instanceOf(User);
      expect(result).to.equal(fetchedUser);
      expect(userRepository.get).to.have.been.calledOnce;
    });
  });
});
