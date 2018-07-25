const { expect, sinon } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const factory = require('../../../factory');
const usecases = require('../../../../lib/domain/usecases');
const OrganizationAccess = require('../../../../lib/domain/models/OrganizationAccess');
const User = require('../../../../lib/domain/models/User');

describe('Unit | UseCase | get-user-organizations-accesses', () => {

  let authenticatedUserId;
  let requestedUserId;
  const userRepository = { getWithOrganizationAccesses: () => undefined };

  it('should rejetcs a NotAuthorized error if authenticated user ask for another user organizations accesses', function() {
    // given
    authenticatedUserId = 1;
    requestedUserId = 2;

    // when
    const promise = usecases.getUserWithOrganizationAccesses({ authenticatedUserId, requestedUserId, userRepository });

    // then
    return promise.catch((err) => {
      expect(err).to.be.an.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

  context('When authenticated User is authorized to retrieve his accesses', () => {

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(userRepository, 'getWithOrganizationAccesses');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should use find all organizations user accesses', () => {
      // given
      authenticatedUserId = 1;
      requestedUserId = 1;
      const foundUser = factory.buildUser();
      userRepository.getWithOrganizationAccesses.resolves(foundUser);

      // when
      const promise = usecases.getUserWithOrganizationAccesses({ authenticatedUserId, requestedUserId, userRepository });

      // then
      return promise.then(() => {
        expect(userRepository.getWithOrganizationAccesses).to.have.been.calledWith(requestedUserId);
      });
    });

    it('should return user with the organization accesses', function() {
      // given
      const foundUser = factory.buildUser({ organizationAccesses: [ new OrganizationAccess({ id: 'Le premier accès de l\'utilisateur' })] });
      userRepository.getWithOrganizationAccesses.resolves(foundUser);

      // when
      const promise = usecases.getUserWithOrganizationAccesses({ authenticatedUserId, requestedUserId, userRepository });

      // then
      return promise.then((foundUser) => {
        expect(foundUser).to.be.an.instanceOf(User);
        expect(foundUser.organizationAccesses[0].id).to.deep.equal('Le premier accès de l\'utilisateur');
      });
    });
  });

});
