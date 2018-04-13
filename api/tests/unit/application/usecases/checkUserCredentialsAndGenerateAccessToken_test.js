const { expect, sinon } = require('../../../test-helper');
const useCase = require('../../../../lib/application/usecases/checkUserCredentialsAndGenerateAccessToken');
const User = require('../../../../lib/domain/models/User');
const { MissingOrInvalidCredentialsError, PasswordNotMatching } = require('../../../../lib/domain/errors');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const tokenService = require('../../../../lib/domain/services/token-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

function _expectTreatmentToFailWithMissingOrInvalidCredentialsError(promise) {
  return promise
    .then(() => {
      expect.fail('Expected an error to be thrown');
    }).catch(err => {
      expect(err).to.be.an.instanceof(MissingOrInvalidCredentialsError);
      expect(err.message).to.equal('Missing or invalid credentials');
    });
}

describe('Unit | Application | Use Case | CheckUserCredentialsAndGenerateAccessToken', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'findByEmail');
    sinon.stub(encryptionService, 'check');
    sinon.stub(tokenService, 'createTokenFromUser');
  });

  afterEach(() => {
    userRepository.findByEmail.restore();
    encryptionService.check.restore();
    tokenService.createTokenFromUser.restore();
  });

  it('should resolves a valid JWT access token when authentication succeeded', () => {
    // given
    const userEmail = 'user@example.net';
    const accessToken = 'jwt.access.token';
    const user = new User({ email: userEmail, password: 'user_password' });
    userRepository.findByEmail.resolves(user);
    encryptionService.check.resolves();
    tokenService.createTokenFromUser.returns(accessToken);

    // when
    const promise = useCase.execute(userEmail, 'user_password');

    // then
    return promise.then(accessToken => {
      expect(userRepository.findByEmail).to.have.been.calledWithExactly(userEmail);
      expect(tokenService.createTokenFromUser).to.have.been.calledWithExactly(user);
      expect(accessToken).to.equal(accessToken);
    });
  });

  it('should rejects an error when given username (email) does not match an existing one', () => {
    // given
    const error = new Error('Simulates BookshelfUser.NotFoundError');
    userRepository.findByEmail.rejects(error);

    // when
    const promise = useCase.execute('unknown_user_email@example.net', 'some_password');

    // then
    return _expectTreatmentToFailWithMissingOrInvalidCredentialsError(promise);
  });

  it('should rejects an error when given password does not match the found user’s one', () => {
    // given
    const userEmail = 'user@example.net';
    const user = new User({ email: userEmail, password: 'user_password' });
    userRepository.findByEmail.resolves(user);
    encryptionService.check.rejects(new PasswordNotMatching());

    // when
    const promise = useCase.execute(userEmail, 'wrong_password');

    // then
    return _expectTreatmentToFailWithMissingOrInvalidCredentialsError(promise);
  });

});

