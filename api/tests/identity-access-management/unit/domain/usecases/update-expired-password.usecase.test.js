import sinon from 'sinon';

import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { PasswordResetTokenInvalidOrExpired } from '../../../../../src/identity-access-management/domain/errors.js';
import { PasswordExpirationToken } from '../../../../../src/identity-access-management/domain/models/PasswordExpirationToken.js';
import { updateExpiredPassword } from '../../../../../src/identity-access-management/domain/usecases/update-expired-password.usecase.js';
import { UserNotFoundError } from '../../../../../src/shared/domain/errors.js';
import { ForbiddenAccess } from '../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Identity Access Management | Domain | UseCase | update-expired-password', function () {
  const passwordExpirationToken = 'PASSWORD_RESET_TOKEN';
  const newPassword = 'Password02';
  const hashedPassword = 'ABCDEF123';

  let user;

  let cryptoService;
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
      get: sinon.stub(),
    };
    cryptoService = {
      hashPassword: sinon.stub(),
    };
    authenticationMethodRepository = {
      updatePassword: sinon.stub(),
      findOneByUserIdAndIdentityProvider: sinon.stub(),
    };

    userRepository.get.resolves(user);
    authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);
    cryptoService.hashPassword.resolves(hashedPassword);
  });

  it('updates user password with a hashed password and return username', async function () {
    // given
    sinon.stub(PasswordExpirationToken, 'decode').returns({ userId: user.id });

    // when
    const login = await updateExpiredPassword({
      passwordExpirationToken,
      newPassword,
      cryptoService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(PasswordExpirationToken.decode).to.have.been.calledOnceWith(passwordExpirationToken);
    expect(userRepository.get).to.have.been.calledOnceWith(user.id);
    expect(cryptoService.hashPassword).to.have.been.calledOnceWith(newPassword);
    expect(authenticationMethodRepository.findOneByUserIdAndIdentityProvider).to.have.been.calledOnceWith({
      userId: user.id,
      identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    });
    expect(authenticationMethodRepository.updatePassword).to.have.been.calledOnceWith({
      userId: user.id,
      hashedPassword,
    });
    expect(login).to.equal('armand.talo1806');
  });

  context('when password reset token is invalid or expired', function () {
    it('throws PasswordResetTokenInvalidOrExpired', async function () {
      // given
      sinon.stub(PasswordExpirationToken, 'decode').returns(new PasswordExpirationToken({}));

      // when /then
      await expect(
        updateExpiredPassword({
          passwordExpirationToken,
          newPassword,
          cryptoService,
          authenticationMethodRepository,
          userRepository,
        }),
      ).to.be.rejectedWith(PasswordResetTokenInvalidOrExpired);
    });
  });

  context('when user does not have a username', function () {
    it('returns user email', async function () {
      // given
      const user = domainBuilder.buildUser({ username: null, email: 'armand.talo@example.net' });
      userRepository.get.resolves(user);
      sinon.stub(PasswordExpirationToken, 'decode').returns({ userId: user.id });

      // when
      const login = await updateExpiredPassword({
        passwordExpirationToken,
        newPassword,
        cryptoService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(login).to.equal('armand.talo@example.net');
    });
  });

  context('when user does not exist', function () {
    it('throws UserNotFoundError', async function () {
      // given
      sinon.stub(PasswordExpirationToken, 'decode').returns(new PasswordExpirationToken({ userId: '123' }));
      userRepository.get.rejects(new UserNotFoundError());

      // when
      const error = await catchErr(updateExpiredPassword)({ passwordExpirationToken, userRepository });

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });
  });

  context('When changing password is not required', function () {
    it('throws ForbiddenAccess', async function () {
      // given
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndRawPassword({
        userId: 100,
        shouldChangePassword: false,
      });
      const user = domainBuilder.buildUser({ id: 100, authenticationMethods: [authenticationMethod] });
      sinon.stub(PasswordExpirationToken, 'decode').returns({ userId: user.id });

      userRepository.get.resolves(user);
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);

      // when
      const error = await catchErr(updateExpiredPassword)({
        passwordExpirationToken,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(ForbiddenAccess);
    });
  });
});
