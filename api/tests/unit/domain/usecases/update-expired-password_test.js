import { sinon, expect, domainBuilder, catchErr } from '../../../test-helper';
import { ForbiddenAccess, UserNotFoundError } from '../../../../lib/domain/errors';
import AuthenticationMethod from '../../../../lib/domain/models/AuthenticationMethod';
import updateExpiredPassword from '../../../../lib/domain/usecases/update-expired-password';
import logger from '../../../../lib/infrastructure/logger';

describe('Unit | UseCase | update-expired-password', function () {
  const passwordResetToken = 'PASSWORD_RESET_TOKEN';
  const newPassword = 'Password02';
  const hashedPassword = 'ABCDEF123';

  let user;

  let encryptionService, tokenService;
  let authenticationMethodRepository, userRepository;

  beforeEach(function () {
    user = domainBuilder.buildUser({ username: 'armand.talo1806' });
    const authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndRawPassword({
      userId: user.id,
      rawPassword: 'oneTimePassword',
      shouldChangePassword: true,
    });
    user.authenticationMethods = [authenticationMethod];

    userRepository = {
      getById: sinon.stub(),
    };
    encryptionService = {
      hashPassword: sinon.stub(),
    };
    tokenService = {
      extractUserId: sinon.stub(),
    };
    authenticationMethodRepository = {
      updateExpiredPassword: sinon.stub(),
      findOneByUserIdAndIdentityProvider: sinon.stub(),
    };

    tokenService.extractUserId.resolves(user.id);
    userRepository.getById.resolves(user);
    authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);
    encryptionService.hashPassword.resolves(hashedPassword);
  });

  it('should update user password with a hashed password and return username', async function () {
    // when
    const login = await updateExpiredPassword({
      passwordResetToken,
      newPassword,
      tokenService,
      encryptionService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(tokenService.extractUserId).to.have.been.calledOnceWith(passwordResetToken);
    expect(userRepository.getById).to.have.been.calledOnceWith(user.id);
    expect(encryptionService.hashPassword).to.have.been.calledOnceWith(newPassword);
    expect(authenticationMethodRepository.findOneByUserIdAndIdentityProvider).to.have.been.calledOnceWith({
      userId: user.id,
      identityProvider: AuthenticationMethod.identityProviders.PIX,
    });
    expect(authenticationMethodRepository.updateExpiredPassword).to.have.been.calledOnceWith({
      userId: user.id,
      hashedPassword,
    });
    expect(login).to.equal('armand.talo1806');
  });

  context('when user does not have a username', function () {
    it('should return user email', async function () {
      // given
      const user = domainBuilder.buildUser({ username: null, email: 'armand.talo@example.net' });
      userRepository.getById.resolves(user);

      // when
      const login = await updateExpiredPassword({
        passwordResetToken,
        newPassword,
        tokenService,
        encryptionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(login).to.equal('armand.talo@example.net');
    });
  });

  context('when userId not exist', function () {
    it('should throw UserNotFoundError', async function () {
      // given
      userRepository.getById.rejects(new UserNotFoundError());

      // when
      const error = await catchErr(updateExpiredPassword)({
        passwordResetToken,
        tokenService,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it('should log error', async function () {
      // given
      userRepository.getById.rejects(new UserNotFoundError());
      sinon.stub(logger, 'warn');

      // when
      await catchErr(updateExpiredPassword)({
        passwordResetToken,
        tokenService,
        userRepository,
      });

      // then
      expect(logger.warn).to.have.been.calledWith('Trying to change his password with incorrect user id');
    });
  });

  context('When changing password is not required', function () {
    it('should throw ForbiddenAccess', async function () {
      // given
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndRawPassword({
        userId: 100,
        shouldChangePassword: false,
      });
      const user = domainBuilder.buildUser({ id: 100, authenticationMethods: [authenticationMethod] });

      tokenService.extractUserId.resolves(user.id);
      userRepository.getById.resolves(user);
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);

      // when
      const error = await catchErr(updateExpiredPassword)({
        passwordResetToken,
        tokenService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(ForbiddenAccess);
    });
  });
});
