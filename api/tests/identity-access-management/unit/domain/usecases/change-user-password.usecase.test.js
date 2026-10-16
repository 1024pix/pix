import { expect } from 'chai';
import sinon from 'sinon';

import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { changeUserPassword } from '../../../../../src/identity-access-management/domain/usecases/change-user-password.usecase.js';
import {
  InvalidPasswordForUpdateEmailError,
  PasswordNotMatching,
  UserNotAuthorizedToUpdatePasswordError,
} from '../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Identity Access Management | Domain | UseCase | change-user-password', function () {
  const userId = 123;
  const currentPassword = 'currentPassword123';
  const newPassword = 'NewPassword123';
  const hashedPassword = 'ABCDEF123';

  let authenticationMethod;
  let authenticationMethodRepository;
  let cryptoService;

  beforeEach(function () {
    authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
      userId,
      hashedPassword: 'currentHashedPassword',
    });

    authenticationMethodRepository = {
      findOneByUserIdAndIdentityProvider: sinon.stub(),
      updatePassword: sinon.stub(),
    };
    cryptoService = {
      assertMatchPassword: sinon.stub(),
      hashPassword: sinon.stub(),
    };

    authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);
    cryptoService.hashPassword.resolves(hashedPassword);
  });

  it('checks the current password and updates user password with the hashed new password', async function () {
    // when
    await changeUserPassword({
      userId,
      currentPassword,
      newPassword,
      authenticationMethodRepository,
      cryptoService,
    });

    // then
    expect(authenticationMethodRepository.findOneByUserIdAndIdentityProvider).to.have.been.calledOnceWith({
      userId,
      identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    });
    expect(cryptoService.assertMatchPassword).to.have.been.calledOnceWith({
      password: currentPassword,
      passwordHash: authenticationMethod.authenticationComplement.password,
    });
    expect(cryptoService.hashPassword).to.have.been.calledOnceWith(newPassword);
    expect(authenticationMethodRepository.updatePassword).to.have.been.calledOnceWith({
      userId,
      hashedPassword,
    });
  });

  context('when user has no Pix authentication method (SSO or GAR only)', function () {
    it('throws UserNotAuthorizedToUpdatePasswordError', async function () {
      // given
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(null);

      // when
      const error = await catchErr(changeUserPassword)({
        userId,
        currentPassword,
        newPassword,
        authenticationMethodRepository,
        cryptoService,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToUpdatePasswordError);
      expect(cryptoService.hashPassword).to.not.have.been.called;
      expect(authenticationMethodRepository.updatePassword).to.not.have.been.called;
    });
  });

  context('when current password does not match', function () {
    it('throws InvalidPasswordForUpdateEmailError', async function () {
      // given
      cryptoService.assertMatchPassword.rejects(new PasswordNotMatching());

      // when
      const error = await catchErr(changeUserPassword)({
        userId,
        currentPassword,
        newPassword,
        authenticationMethodRepository,
        cryptoService,
      });

      // then
      expect(error).to.be.instanceOf(InvalidPasswordForUpdateEmailError);
      expect(cryptoService.hashPassword).to.not.have.been.called;
      expect(authenticationMethodRepository.updatePassword).to.not.have.been.called;
    });
  });
});
