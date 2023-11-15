import { expect, sinon, catchErr, domainBuilder } from '../../../test-helper.js';

import {
  AlreadyRegisteredEmailError,
  InvalidVerificationCodeError,
  UserNotAuthorizedToUpdateEmailError,
  EmailModificationDemandNotFoundOrExpiredError,
} from '../../../../lib/domain/errors.js';

import { EmailModificationDemand } from '../../../../lib/domain/models/EmailModificationDemand.js';
import { updateUserEmailWithValidation } from '../../../../lib/domain/usecases/update-user-email-with-validation.js';

describe('Unit | UseCase | update-user-email-with-validation', function () {
  let userEmailRepository;
  let userRepository;
  let clock;

  beforeEach(function () {
    userEmailRepository = {
      getEmailModificationDemandByUserId: sinon.stub(),
    };
    userRepository = {
      checkIfEmailIsAvailable: sinon.stub(),
      get: sinon.stub(),
      updateWithEmailConfirmed: sinon.stub(),
    };
  });

  it('should update email and set date for confirmed email', async function () {
    // given
    const userId = domainBuilder.buildUser().id;
    const email = 'oldEmail@example.net';
    const newEmail = 'new_email@example.net';
    const code = '999999';
    const emailModificationDemand = new EmailModificationDemand({
      code,
      newEmail,
    });

    const now = new Date();
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

    userRepository.get.withArgs(userId).resolves({ email });
    userEmailRepository.getEmailModificationDemandByUserId.withArgs(userId).resolves(emailModificationDemand);
    userRepository.checkIfEmailIsAvailable.withArgs(newEmail).resolves();

    // when
    await updateUserEmailWithValidation({
      userId,
      code,
      userEmailRepository,
      userRepository,
    });

    // then
    expect(userRepository.updateWithEmailConfirmed).to.have.been.calledWithExactly({
      id: userId,
      userAttributes: { email: newEmail, emailConfirmedAt: now },
    });
    clock.restore();
  });

  it('should get email modification demand in temporary storage', async function () {
    // given
    const userId = domainBuilder.buildUser().id;
    const email = 'oldEmail@example.net';
    const newEmail = 'new_email@example.net';
    const code = '999999';
    const emailModificationDemand = new EmailModificationDemand({
      code,
      newEmail,
    });

    userRepository.get.withArgs(userId).resolves({ email });
    userEmailRepository.getEmailModificationDemandByUserId.withArgs(userId).resolves(emailModificationDemand);

    // when
    await updateUserEmailWithValidation({
      userId,
      code,
      userEmailRepository,
      userRepository,
    });

    // then
    expect(userEmailRepository.getEmailModificationDemandByUserId).to.have.been.calledWithExactly(userId);
  });

  it('should throw UserNotAuthorizedToUpdateEmailError if user does not have an email', async function () {
    // given
    userRepository.get.resolves({});
    const userId = 1;
    const code = '999999';

    // when
    const error = await catchErr(updateUserEmailWithValidation)({
      userId,
      code,
      userRepository,
      userEmailRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(UserNotAuthorizedToUpdateEmailError);
  });

  it('should throw AlreadyRegisteredEmailError if email already exists', async function () {
    // given
    const userId = domainBuilder.buildUser().id;
    const email = 'oldEmail@example.net';
    const newEmail = 'new_email@example.net';
    const code = '999999';
    const emailModificationDemand = new EmailModificationDemand({
      code,
      newEmail,
    });

    userRepository.get.withArgs(userId).resolves({ email });
    userEmailRepository.getEmailModificationDemandByUserId.withArgs(userId).resolves(emailModificationDemand);
    userRepository.checkIfEmailIsAvailable.withArgs(newEmail).rejects(new AlreadyRegisteredEmailError());

    // when
    const error = await catchErr(updateUserEmailWithValidation)({
      userId,
      code,
      userEmailRepository,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(AlreadyRegisteredEmailError);
  });

  it('should throw InvalidVerificationCodeError if the code send does not match with then code saved in temporary storage', async function () {
    // given
    const userId = domainBuilder.buildUser().id;
    const email = 'oldEmail@example.net';
    const newEmail = 'new_email@example.net';
    const code = '999999';
    const anotherCode = '444444';
    const emailModificationDemand = new EmailModificationDemand({
      code: anotherCode,
      newEmail,
    });

    userRepository.get.withArgs(userId).resolves({ email });
    userEmailRepository.getEmailModificationDemandByUserId.withArgs(userId).resolves(emailModificationDemand);

    // when
    const error = await catchErr(updateUserEmailWithValidation)({
      userId,
      code,
      userEmailRepository,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(InvalidVerificationCodeError);
  });

  it('should throw EmailModificationDemandNotFoundOrExpiredError if no email modification demand match or is expired', async function () {
    // given
    const userId = domainBuilder.buildUser().id;
    const anotherUserId = domainBuilder.buildUser().id;
    const email = 'oldEmail@example.net';
    const code = '999999';

    userRepository.get.withArgs(userId).resolves({ email });
    userEmailRepository.getEmailModificationDemandByUserId.withArgs(anotherUserId).resolves(null);

    // when
    const error = await catchErr(updateUserEmailWithValidation)({
      userId,
      code,
      userEmailRepository,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(EmailModificationDemandNotFoundOrExpiredError);
  });
});
