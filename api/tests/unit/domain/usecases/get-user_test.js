const { expect, sinon, factory } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | Application | Use Case | get-user', () => {

  let sandbox;
  let userRepository;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    userRepository = { getWithOrganizationsAccesses: sandbox.stub() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolves with user when user is found', () => {
    // given
    const authenticatedUserId = 1234;
    const requestedUserId = 1234;
    const foundUser = factory.buildUser({ id: requestedUserId });
    userRepository.getWithOrganizationsAccesses.resolves(foundUser);

    // when
    const promise = usecases.getUser({ authenticatedUserId, requestedUserId, userRepository });

    // then
    return promise.then((user) => {
      expect(user).to.deep.equal(foundUser);
    });
  });

  it('should throw error if requested userId is different from authenticated userId', () => {
    // given
    const authenticatedUserId = 1234;
    const requestedUserId = 4321;

    // when
    const promise = usecases.getUser({ authenticatedUserId, requestedUserId, userRepository });

    // then
    expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
  });

});

