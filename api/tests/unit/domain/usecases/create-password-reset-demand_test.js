import { expect, sinon, catchErr } from '../../../test-helper';
import { UserNotFoundError } from '../../../../lib/domain/errors';
import { createPasswordResetDemand } from '../../../../lib/domain/usecases';

describe('Unit | UseCase | create-password-reset-demand', function () {
  const email = 'user@example.net';
  const locale = 'fr';
  const temporaryKey = 'ABCDEF123';

  const resetPasswordDemand = {
    attributes: {
      id: 1,
      email,
      temporaryKey,
    },
  };

  let mailService;
  let resetPasswordService;
  let resetPasswordDemandRepository;
  let userRepository;

  beforeEach(function () {
    mailService = {
      sendResetPasswordDemandEmail: sinon.stub(),
    };
    resetPasswordService = {
      generateTemporaryKey: sinon.stub(),
    };
    resetPasswordDemandRepository = {
      create: sinon.stub(),
    };
    userRepository = {
      isUserExistingByEmail: sinon.stub(),
    };

    userRepository.isUserExistingByEmail.resolves({ id: 1 });
    resetPasswordService.generateTemporaryKey.returns(temporaryKey);
    resetPasswordDemandRepository.create.resolves(resetPasswordDemand);
  });

  it('should create a password reset demand if user email exists', async function () {
    // when
    const result = await createPasswordResetDemand({
      email,
      locale,
      mailService,
      resetPasswordService,
      resetPasswordDemandRepository,
      userRepository,
    });

    // then
    expect(result).to.deep.equal(resetPasswordDemand);

    expect(userRepository.isUserExistingByEmail).to.have.been.calledWithExactly(email);
    expect(resetPasswordService.generateTemporaryKey).to.have.been.calledOnce;
    expect(resetPasswordDemandRepository.create).to.have.been.calledWithExactly({ email, temporaryKey });
    expect(mailService.sendResetPasswordDemandEmail).to.have.been.calledWithExactly({ email, locale, temporaryKey });
  });

  it('should throw UserNotFoundError if user email does not exist', async function () {
    // given
    userRepository.isUserExistingByEmail.throws(new UserNotFoundError());

    // when
    const error = await catchErr(createPasswordResetDemand)({
      email,
      locale,
      mailService,
      resetPasswordService,
      resetPasswordDemandRepository,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(UserNotFoundError);
  });
});
