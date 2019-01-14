const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const getUserWithMemberships = require('../../../../lib/domain/usecases/get-user-with-memberships');
const Membership = require('../../../../lib/domain/models/Membership');
const User = require('../../../../lib/domain/models/User');

describe('Unit | UseCase | get-user-with-memberships', () => {

  let authenticatedUserId;
  let requestedUserId;
  const userRepository = { getWithMemberships: () => undefined };

  it('should reject a NotAuthorized error if authenticated user ask for another user organizations accesses', () => {
    // given
    authenticatedUserId = 1;
    requestedUserId = 2;

    // when
    const promise = getUserWithMemberships({ authenticatedUserId, requestedUserId, userRepository });

    // then
    return promise.catch((err) => {
      expect(err).to.be.an.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

  context('When authenticated User is authorized to retrieve his accesses', () => {

    beforeEach(() => {
      sinon.stub(userRepository, 'getWithMemberships');
    });

    it('should use find all organizations user accesses', () => {
      // given
      authenticatedUserId = 1;
      requestedUserId = 1;
      const foundUser = domainBuilder.buildUser();
      userRepository.getWithMemberships.resolves(foundUser);

      // when
      const promise = getUserWithMemberships({
        authenticatedUserId,
        requestedUserId,
        userRepository,
      });

      // then
      return promise.then(() => {
        expect(userRepository.getWithMemberships).to.have.been.calledWith(requestedUserId);
      });
    });

    it('should return user with the memberships', () => {
      // given
      const foundUser = domainBuilder.buildUser({
        memberships: [new Membership({ id: 'Le premier accès de l\'utilisateur' })],
      });
      userRepository.getWithMemberships.resolves(foundUser);

      // when
      const promise = getUserWithMemberships({
        authenticatedUserId,
        requestedUserId,
        userRepository,
      });

      // then
      return promise.then((foundUser) => {
        expect(foundUser).to.be.an.instanceOf(User);
        expect(foundUser.memberships[0].id).to.deep.equal('Le premier accès de l\'utilisateur');
      });
    });
  });
});
