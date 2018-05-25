const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const User = require('../../../../lib/domain/models/User');
const { MissingOrInvalidCredentialsError, PasswordNotMatching } = require('../../../../lib/domain/errors');
const encryptionService = require('../../../../lib/domain/services/encryption-service');

function _expectTreatmentToFailWithMissingOrInvalidCredentialsError(promise) {
  return promise
    .then(() => {
      expect.fail('Expected an error to be thrown');
    }).catch(err => {
      expect(err).to.be.an.instanceof(MissingOrInvalidCredentialsError);
      expect(err.message).to.equal('Missing or invalid credentials');
    });
}

describe('Unit | Application | Use Case | authenticate-user', () => {

  let sandbox;
  let userRepository;
  let tokenService;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    userRepository = { findByEmail: sandbox.stub() };
    tokenService = { createTokenFromUser: sandbox.stub() };
    sandbox.stub(encryptionService, 'check');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolves a valid JWT access token when authentication succeeded', () => {
    // given
    const userEmail = 'user@example.net';
    const accessToken = 'jwt.access.token';
    const userPassword = 'user_password';
    const user = new User({ email: userEmail, password: userPassword });
    userRepository.findByEmail.resolves(user);
    encryptionService.check.resolves();
    tokenService.createTokenFromUser.returns(accessToken);

    // when
    const promise = usecases.authenticateUser({ userEmail, userPassword, userRepository, tokenService});

    // then
    return promise.then(accessToken => {
      expect(userRepository.findByEmail).to.have.been.calledWithExactly(userEmail);
      expect(tokenService.createTokenFromUser).to.have.been.calledWithExactly(user);
      expect(accessToken).to.equal(accessToken);
    });
  });

  it('should rejects an error when given username (email) does not match an existing one', () => {
    // given
    const userEmail = 'unknown_user_email@example.net';
    const userPassword = 'some_password';
    const error = new Error('Simulates BookshelfUser.NotFoundError');
    userRepository.findByEmail.rejects(error);

    // when
    const promise = usecases.authenticateUser({ userEmail, userPassword, userRepository, tokenService });

    // then
    return _expectTreatmentToFailWithMissingOrInvalidCredentialsError(promise);
  });

  it('should rejects an error when given password does not match the found user’s one', () => {
    // given
    const userEmail = 'user@example.net';
    const userPassword = 'wrong_password';
    const user = new User({ email: userEmail, password: 'user_password' });
    userRepository.findByEmail.resolves(user);
    encryptionService.check.rejects(new PasswordNotMatching());

    // when
    const promise = usecases.authenticateUser({ userEmail, userPassword, userRepository, tokenService });

    // then
    return _expectTreatmentToFailWithMissingOrInvalidCredentialsError(promise);
  });

});

