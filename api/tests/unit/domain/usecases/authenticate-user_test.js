const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const User = require('../../../../lib/domain/models/User');
const { MissingOrInvalidCredentialsError, PasswordNotMatching, ForbiddenAccess } = require('../../../../lib/domain/errors');
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
    userRepository = { findByEmailWithRoles: sandbox.stub() };
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
    userRepository.findByEmailWithRoles.resolves(user);
    encryptionService.check.resolves();
    tokenService.createTokenFromUser.returns(accessToken);

    // when
    const promise = usecases.authenticateUser({ userEmail, userPassword, userRepository, tokenService });

    // then
    return promise.then(accessToken => {
      expect(userRepository.findByEmailWithRoles).to.have.been.calledWithExactly(userEmail);
      expect(tokenService.createTokenFromUser).to.have.been.calledWithExactly(user);
      expect(accessToken).to.equal(accessToken);
    });
  });

  it('should rejects an error when given username (email) does not match an existing one', () => {
    // given
    const userEmail = 'unknown_user_email@example.net';
    const userPassword = 'some_password';
    const error = new Error('Simulates BookshelfUser.NotFoundError');
    userRepository.findByEmailWithRoles.rejects(error);

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
    userRepository.findByEmailWithRoles.resolves(user);
    encryptionService.check.rejects(new PasswordNotMatching());

    // when
    const promise = usecases.authenticateUser({ userEmail, userPassword, userRepository, tokenService });

    // then
    return _expectTreatmentToFailWithMissingOrInvalidCredentialsError(promise);
  });

  context('scope access', () => {

    it('rejects an error when scope is pix-orga and user is not linked to any organizations', function () {
      // given
      const userEmail = 'user@example.net';
      const userPassword = 'wrong_password';
      const scope = 'pix-orga';
      const user = new User({ email: userEmail, password: 'user_password', organizationsAccesses: [] });
      userRepository.findByEmailWithRoles.resolves(user);

      // when
      const promise = usecases.authenticateUser({ userEmail, userPassword, scope, userRepository, tokenService });

      // then
      return promise
        .then(() => expect.fail('Expected ForbiddenAccess to be thrown'))
        .catch(error => {
          expect(error).to.be.an.instanceof(ForbiddenAccess);
          expect(error.message).to.equal('User is not allowed to access this area');
        });
    });
  });

});

