const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const passwordResetDemandRepository = require('../../../../lib/infrastructure/repositories/password-reset-demand-repository');
const passwordResetService = require('../../../../lib/domain/services/password-reset-service');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const { ObjectValidationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-password-reset-demand', () => {

  const password = 'passwordPASSWORD123';
  const hashedPassword = 'hashedPassword';
  const userId = 1;
  const temporaryKey = 'temporaryKey';

  beforeEach(() => {
    sinon.stub(userRepository, 'updatePassword');
    sinon.stub(passwordResetDemandRepository, 'markAsUsed');
    sinon.stub(passwordResetService, 'extractUserIdFromTemporaryKey');
    sinon.stub(encryptionService, 'hashPassword');
  });

  it('should call the correct methods and return true', async () => {
    // given
    passwordResetService.extractUserIdFromTemporaryKey.withArgs(temporaryKey).returns(userId);
    encryptionService.hashPassword.withArgs(password).resolves(hashedPassword);
    userRepository.updatePassword.withArgs(userId, hashedPassword).resolves();
    passwordResetDemandRepository.markAsUsed.withArgs(temporaryKey).resolves();

    // when
    const resetPasswordValue = await usecases.resetPassword({ temporaryKey, password });

    // then
    expect(passwordResetService.extractUserIdFromTemporaryKey).to.have.been.calledOnceWithExactly(temporaryKey);
    expect(encryptionService.hashPassword).to.have.been.calledOnceWithExactly(password);
    expect(userRepository.updatePassword).to.have.been.calledOnceWithExactly(userId, hashedPassword);
    expect(passwordResetDemandRepository.markAsUsed).to.have.been.calledOnceWithExactly(temporaryKey);
    expect(resetPasswordValue).to.be.true;
  });

  it('should throw on invalid password', async () => {
    // given
    const password = 'invalid';

    // when
    const promise = usecases.resetPassword({ temporaryKey, password });

    // then
    return promise.catch((error) => {
      expect(error).to.be.instanceOf(ObjectValidationError);
    });
  });
});
