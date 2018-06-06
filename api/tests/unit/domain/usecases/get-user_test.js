const { expect, sinon, factory } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const User = require('../../../../lib/domain/models/User');

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
    const userId = 1234;
    const foundUser = factory.buildUser({
      id: userId,
      firstName: 'Dom',
      lastName: 'Juan',
      email: 'dom@juan.es',
      cgu: true
    });
    userRepository.get.resolves(foundUser);

    // when
    const promise = usecases.getUser({ userId, userRepository });

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

});

