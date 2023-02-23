const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const {
  AlreadyRegisteredEmailError,
  InvalidPasswordForUpdateEmailError,
  UserNotAuthorizedToUpdateEmailError,
} = require('../../../../lib/domain/errors');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const codeUtils = require('../../../../lib/infrastructure/utils/code-utils');
const { getI18n } = require('../../../tooling/i18n/i18n');

const usecases = require('../../../../lib/domain/usecases/index.js');

describe('Unit | UseCase | send-verification-code', function () {
  let authenticationMethodRepository;
  let userEmailRepository;
  let userRepository;
  let encryptionService;
  let mailService;

  beforeEach(function () {
    userEmailRepository = {
      saveEmailModificationDemand: sinon.stub(),
    };
    userRepository = {
      checkIfEmailIsAvailable: sinon.stub(),
      get: sinon.stub(),
    };
    encryptionService = {
      checkPassword: sinon.stub(),
    };
    mailService = {
      sendVerificationCodeEmail: sinon.stub(),
    };
    authenticationMethodRepository = {
      findOneByUserIdAndIdentityProvider: sinon.stub(),
    };

    sinon.stub(codeUtils, 'generateNumericalString');
  });

  it('should store the generated code in temporary storage', async function () {
    // given
    const userId = 1;
    const newEmail = 'user@example.net';
    const code = '999999';
    const password = 'pix123';
    const passwordHash = 'ABCD';
    const locale = 'fr';
    const i18n = getI18n();

    userRepository.get.withArgs(userId).resolves({ email: 'oldEmail@example.net' });
    userRepository.checkIfEmailIsAvailable.withArgs(newEmail).resolves(newEmail);
    authenticationMethodRepository.findOneByUserIdAndIdentityProvider
      .withArgs({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      })
      .resolves(
        domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          hashedPassword: passwordHash,
        })
      );
    encryptionService.checkPassword.withArgs({ password, passwordHash }).resolves();
    codeUtils.generateNumericalString.withArgs(6).returns(code);

    // when
    await usecases.sendVerificationCode({
      i18n,
      locale,
      newEmail,
      password,
      userId,
      authenticationMethodRepository,
      userEmailRepository,
      userRepository,
      encryptionService,
      mailService,
    });

    // then
    expect(userEmailRepository.saveEmailModificationDemand).to.have.been.calledWithExactly({ userId, code, newEmail });
  });

  it('should send verification code email', async function () {
    // given
    const userId = 1;
    const newEmail = 'new_email@example.net';
    const password = 'pix123';
    const passwordHash = 'ABCD';
    const code = '999999';
    const locale = 'fr';
    const i18n = getI18n();
    const translate = getI18n().__;

    userRepository.get.withArgs(userId).resolves({ email: 'oldEmail@example.net' });
    userRepository.checkIfEmailIsAvailable.withArgs(newEmail).resolves(newEmail);
    authenticationMethodRepository.findOneByUserIdAndIdentityProvider
      .withArgs({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      })
      .resolves(
        domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          hashedPassword: passwordHash,
        })
      );
    encryptionService.checkPassword.withArgs({ password, passwordHash }).resolves();
    codeUtils.generateNumericalString.withArgs(6).returns(code);

    // when
    await usecases.sendVerificationCode({
      i18n,
      locale,
      newEmail,
      password,
      userId,
      authenticationMethodRepository,
      userEmailRepository,
      userRepository,
      encryptionService,
      mailService,
    });

    // then
    expect(mailService.sendVerificationCodeEmail).to.have.been.calledWith({
      code,
      locale,
      email: newEmail,
      translate,
    });
  });

  it('should throw AlreadyRegisteredEmailError if email already exists', async function () {
    // given
    const userId = 1;
    const newEmail = 'new_email@example.net';
    const password = 'pix123';
    const locale = 'fr';

    userRepository.get.withArgs(userId).resolves({ email: 'oldEmail@example.net' });
    userRepository.checkIfEmailIsAvailable.rejects(new AlreadyRegisteredEmailError());

    // when
    const error = await catchErr(usecases.sendVerificationCode)({
      locale,
      newEmail,
      password,
      userId,
      authenticationMethodRepository,
      userEmailRepository,
      userRepository,
      encryptionService,
      mailService,
    });

    // then
    expect(error).to.be.an.instanceOf(AlreadyRegisteredEmailError);
  });

  it('should throw InvalidPasswordForUpdateEmailError if the password is invalid', async function () {
    // given
    const userId = 1;
    const newEmail = 'new_email@example.net';
    const password = 'pix123';
    const passwordHash = 'ABCD';
    const locale = 'fr';

    userRepository.get.withArgs(userId).resolves({ email: 'oldEmail@example.net' });
    userRepository.checkIfEmailIsAvailable.withArgs(newEmail).resolves(newEmail);
    authenticationMethodRepository.findOneByUserIdAndIdentityProvider
      .withArgs({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      })
      .resolves(
        domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          hashedPassword: passwordHash,
        })
      );
    encryptionService.checkPassword.withArgs({ password, passwordHash }).rejects();

    // when
    const error = await catchErr(usecases.sendVerificationCode)({
      locale,
      newEmail,
      password,
      userId,
      authenticationMethodRepository,
      userEmailRepository,
      userRepository,
      encryptionService,
      mailService,
    });

    // then
    expect(error).to.be.an.instanceOf(InvalidPasswordForUpdateEmailError);
  });

  it('should throw UserNotAuthorizedToUpdateEmailError if user does not have an email', async function () {
    // given
    userRepository.get.resolves({});
    const userId = 1;
    const newEmail = 'new_email@example.net';
    const password = 'pix123';
    const locale = 'fr';

    // when
    const error = await catchErr(usecases.sendVerificationCode)({
      locale,
      newEmail,
      password,
      userId,
      authenticationMethodRepository,
      userEmailRepository,
      userRepository,
      encryptionService,
      mailService,
    });

    // then
    expect(error).to.be.an.instanceOf(UserNotAuthorizedToUpdateEmailError);
  });
});
