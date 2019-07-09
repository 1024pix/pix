const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const passwordResetDemandRepository = require('../../../../lib/infrastructure/repositories/password-reset-demand-repository');
const passwordResetService = require('../../../../lib/domain/services/password-reset-service');
const mailService = require('../../../../lib/domain/services/mail-service');

describe('Unit | UseCase | create-password-reset-demand', () => {

  const email = 'user@pix.fr';
  const userId = 1;
  const temporaryKey = 'temporaryKey';
  const passwordResetDemand = { email, temporaryKey, used: false };
  const expectedPasswordResetDemand = { attributes: { id: 2, ...passwordResetDemand } };

  beforeEach(() => {
    sinon.stub(userRepository, 'findByEmail');
    sinon.stub(passwordResetService, 'generateTemporaryKey');
    sinon.stub(passwordResetDemandRepository, 'create');
    sinon.stub(mailService, 'sendPasswordResetDemandEmail');
  });

  it('should return a passwordResetDemand', async () => {
    // given
    userRepository.findByEmail.withArgs(email).resolves({ id: userId });
    passwordResetService.generateTemporaryKey.withArgs(userId).returns(temporaryKey);
    passwordResetDemandRepository.create.withArgs(passwordResetDemand).returns(expectedPasswordResetDemand);
    mailService.sendPasswordResetDemandEmail.resolves();

    // when
    const resolvedPasswordResetDemand = await usecases.createPasswordResetDemand({ email });

    // then
    expect(userRepository.findByEmail).to.have.been.calledOnceWithExactly(email);
    expect(passwordResetService.generateTemporaryKey).to.have.been.calledOnceWithExactly(userId);
    expect(passwordResetDemandRepository.create).to.have.been.calledOnceWithExactly(passwordResetDemand);
    expect(mailService.sendPasswordResetDemandEmail).to.have.been.calledOnceWith(email, temporaryKey);
    expect(resolvedPasswordResetDemand).to.deep.equal(expectedPasswordResetDemand);
  });
});
