const bcrypt = require('bcrypt');

const updateUserEmail = require('../../../../lib/domain/usecases/update-user-email');
const { AlreadyRegisteredEmailError, UserNotAuthorizedToUpdateEmailError, InvalidPasswordForUpdateEmailError } = require('../../../../lib/domain/errors');

const { sinon, expect, catchErr } = require('../../../test-helper');

describe('Unit | UseCase | update-user-email', () => {

  let userRepository;
  let authenticationMethodRepository;
  let encryptionService;
  let mailService;

  const locale = undefined;
  const password = 'password123';
  // eslint-disable-next-line no-sync
  const passwordHash = bcrypt.hashSync(password, 1);

  beforeEach(() => {
    userRepository = {
      updateEmail: sinon.stub(),
      isEmailAvailable: sinon.stub(),
      get: sinon.stub().resolves({ email: 'old_email@example.net' }),
    };

    authenticationMethodRepository = {
      findOneByUserIdAndIdentityProvider: sinon.stub().resolves({ authenticationComplement: { password: passwordHash } }),
    };

    encryptionService = {
      checkPassword: sinon.stub().resolves(),
    };

    mailService = {
      notifyEmailChange: sinon.stub().resolves(),
    };
  });

  it('should call updateEmail', async () => {
    // given
    const userId = 1;
    const authenticatedUserId = 1;
    const newEmail = 'new_email@example.net';

    // when
    await updateUserEmail({
      userId,
      authenticatedUserId,
      email: newEmail,
      password,
      locale,
      userRepository,
      authenticationMethodRepository,
      encryptionService,
      mailService,
    });

    // then
    expect(userRepository.updateEmail).to.have.been.calledWith({
      id: userId,
      email: newEmail,
    });
  });

  it('should call notifyEmailChange', async () => {
    // given
    const userId = 1;
    const authenticatedUserId = 1;
    const newEmail = 'new_email@example.net';

    // when
    await updateUserEmail({
      userId,
      authenticatedUserId,
      email: newEmail,
      password,
      locale,
      userRepository,
      authenticationMethodRepository,
      encryptionService,
      mailService,
    });

    // then
    expect(mailService.notifyEmailChange).to.have.been.calledWith({
      email: newEmail,
      locale: undefined,
    });
  });

  it('should save email in lower case', async () => {
    // given
    const userId = 1;
    const authenticatedUserId = 1;
    const newEmail = 'EMAIl_IN_UPPER_CASE@example.net';
    const newEmailInLowerCase = newEmail.toLowerCase();

    // when
    await updateUserEmail({
      userId,
      authenticatedUserId,
      email: newEmail,
      password,
      locale,
      userRepository,
      authenticationMethodRepository,
      encryptionService,
      mailService,
    });

    // then
    expect(userRepository.updateEmail).to.have.been.calledWith({
      id: userId,
      email: newEmailInLowerCase,
    });
  });

  it('should throw AlreadyRegisteredEmailError if email already exists', async () => {
    // given
    userRepository.isEmailAvailable.rejects(new AlreadyRegisteredEmailError());
    const userId = 1;
    const authenticatedUserId = 1;
    const newEmail = 'new_email@example.net';

    // when
    const error = await catchErr(updateUserEmail)({
      userId,
      authenticatedUserId,
      email: newEmail,
      password,
      locale,
      userRepository,
      authenticationMethodRepository,
      encryptionService,
      mailService,
    });

    // then
    expect(error).to.be.an.instanceOf(AlreadyRegisteredEmailError);
  });

  it('should throw UserNotAuthorizedToUpdateEmailError if the authenticated user try to change the email of an other user', async () => {
    // given
    const userId = 1;
    const authenticatedUserId = 2;
    const newEmail = 'new_email@example.net';

    // when
    const error = await catchErr(updateUserEmail)({
      userId,
      authenticatedUserId,
      email: newEmail,
      locale,
      userRepository,
      authenticationMethodRepository,
      encryptionService,
      mailService,
    });

    // then
    expect(error).to.be.an.instanceOf(UserNotAuthorizedToUpdateEmailError);
  });

  it('should throw UserNotAuthorizedToUpdateEmailError if user does not have an email', async () => {
    // given
    userRepository.get.resolves({});
    const userId = 1;
    const authenticatedUserId = 1;
    const newEmail = 'new_email@example.net';

    // when
    const error = await catchErr(updateUserEmail)({
      userId,
      authenticatedUserId,
      email: newEmail,
      locale,
      userRepository,
      authenticationMethodRepository,
      encryptionService,
      mailService,
    });

    // then
    expect(error).to.be.an.instanceOf(UserNotAuthorizedToUpdateEmailError);
  });

  it('should throw InvalidPasswordForUpdateEmailError if the password is invalid', async () => {
    // given
    encryptionService.checkPassword.rejects();
    const userId = 1;
    const authenticatedUserId = 1;
    const newEmail = 'new_email@example.net';

    // when
    const error = await catchErr(updateUserEmail)({
      userId,
      authenticatedUserId,
      email: newEmail,
      locale,
      userRepository,
      authenticationMethodRepository,
      encryptionService,
      mailService,
    });

    // then
    expect(error).to.be.an.instanceOf(InvalidPasswordForUpdateEmailError);
  });
});
