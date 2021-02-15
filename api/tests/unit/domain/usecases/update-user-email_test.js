const updateUserEmail = require('../../../../lib/domain/usecases/update-user-email');
const { AlreadyRegisteredEmailError, UserNotAuthorizedToUpdateEmailError } = require('../../../../lib/domain/errors');

const { sinon, expect, catchErr, domainBuilder } = require('../../../test-helper');

describe('Unit | UseCase | update-user-email', () => {

  let userRepository;
  let schoolingRegistrationRepository;

  beforeEach(() => {
    userRepository = {
      updateEmail: sinon.stub(),
      isEmailAvailable: sinon.stub(),
      get: sinon.stub().resolves({ email: 'old_email@example.net' }),
    };

    schoolingRegistrationRepository = {
      findByUserId: sinon.stub().resolves([]),
    };
  });

  it('should call updateEmail', async () => {
    // given
    const userId = 1;
    const newEmail = 'new_email@example.net';

    // when
    await updateUserEmail({
      userId,
      email: newEmail,
      userRepository,
      schoolingRegistrationRepository,
    });

    // then
    expect(userRepository.updateEmail).to.have.been.calledWith({
      id: userId,
      email: newEmail,
    });
  });

  it('should save email in lower case', async () => {
    // given
    const userId = 1;
    const newEmail = 'EMAIl_IN_UPPER_CASE@example.net';
    const newEmailInLowerCase = newEmail.toLowerCase();

    // when
    await updateUserEmail({
      userId,
      email: newEmail,
      userRepository,
      schoolingRegistrationRepository,
    });

    // then
    expect(userRepository.updateEmail).to.have.been.calledWith({
      id: userId,
      email: newEmailInLowerCase,
    });
  });

  it('throw AlreadyRegisteredEmailError if email already exists', async () => {
    // given
    userRepository.isEmailAvailable.rejects(new AlreadyRegisteredEmailError());
    const userId = 1;
    const newEmail = 'new_email@example.net';

    // when
    const error = await catchErr(updateUserEmail)({
      userId,
      email: newEmail,
      userRepository,
      schoolingRegistrationRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(AlreadyRegisteredEmailError);
  });

  it('throw UserNotAuthorizedToUpdateEmailError if user has not email', async () => {
    // given
    userRepository.get.resolves({});
    const userId = 1;
    const newEmail = 'new_email@example.net';

    // when
    const error = await catchErr(updateUserEmail)({
      userId,
      email: newEmail,
      userRepository,
      schoolingRegistrationRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(UserNotAuthorizedToUpdateEmailError);
  });

  it('throw UserNotAuthorizedToUpdateEmailError if user is reconciled', async () => {
    // given
    const userId = 1;
    const newEmail = 'new_email@example.net';
    schoolingRegistrationRepository.findByUserId.resolves([domainBuilder.buildSchoolingRegistration()]);

    // when
    const error = await catchErr(updateUserEmail)({
      userId,
      email: newEmail,
      userRepository,
      schoolingRegistrationRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(UserNotAuthorizedToUpdateEmailError);
  });
});
