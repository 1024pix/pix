const { expect, sinon } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const factory = require('../../../factory');
const usecases = require('../../../../lib/domain/usecases');
const OrganizationAccess = require('../../../../lib/domain/models/OrganizationAccess');

describe('Unit | UseCase | get-user-organizations-accesses', () => {

  let authenticatedUserId;
  let requestedUserId;
  const userRepository = { getWithOrganizationsAccesses: () => undefined };

  it('should rejetcs a NotAuthorized error if authenticated user ask for another user organizations accesses', function() {
    // given
    authenticatedUserId = 1;
    requestedUserId = 2;

    // when
    const promise = usecases.getUserOrganizationsAccesses({ authenticatedUserId, requestedUserId, userRepository });

    // then
    return promise.catch((err) => {
      expect(err).to.be.an.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

  context('When authenticated User is authorized to retrieve his accesses', () => {

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(userRepository, 'getWithOrganizationsAccesses');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should use find all organizations user accesses', () => {
      // given
      authenticatedUserId = 1;
      requestedUserId = 1;
      const foundUser = factory.buildUser();
      userRepository.getWithOrganizationsAccesses.resolves(foundUser);

      // when
      const promise = usecases.getUserOrganizationsAccesses({ authenticatedUserId, requestedUserId, userRepository });

      // then
      return promise.then(() => {
        expect(userRepository.getWithOrganizationsAccesses).to.have.been.calledWith(requestedUserId);
      });
    });

    it('should return organizations user accesses', function() {
      // given
      const foundUser = factory.buildUser({ organizationsAccesses: [ new OrganizationAccess({ id: 'Le premier accès de l\'utilisateur' })] });
      userRepository.getWithOrganizationsAccesses.resolves(foundUser);

      // when
      const promise = usecases.getUserOrganizationsAccesses({ authenticatedUserId, requestedUserId, userRepository });

      // then
      return promise.then((organizationsAccesses) => {
        expect(organizationsAccesses[0]).to.be.an.instanceOf(OrganizationAccess);
        expect(organizationsAccesses[0].id).to.deep.equal('Le premier accès de l\'utilisateur');
      });
    });
  });

});
