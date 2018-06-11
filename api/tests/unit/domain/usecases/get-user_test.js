const { expect, sinon, factory } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const User = require('../../../../lib/domain/models/User');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | Application | Use Case | get-user', () => {

  let sandbox;
  let userRepository;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    userRepository = { get: sandbox.stub() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolves with user when user is found', () => {
    // given
    const authenticatedUserId = 1234;
    const requestedUserId = 1234;
    const foundUser = factory.buildUser({
      id: requestedUserId,
      firstName: 'Dom',
      lastName: 'Juan',
      email: 'dom@juan.es',
      cgu: true
    });
    userRepository.get.resolves(foundUser);

    // when
    const promise = usecases.getUser({ authenticatedUserId, requestedUserId, userRepository });

    // then
    return promise.then((user) => {
      expect(user).to.be.instanceOf(User);
      expect(user.id).to.equal(foundUser.id);
      expect(user.firstName).to.equal(foundUser.firstName);
      expect(user.lastName).to.equal(foundUser.lastName);
      expect(user.email).to.equal(foundUser.email);
      expect(user.cgu).to.equal(foundUser.cgu);
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

