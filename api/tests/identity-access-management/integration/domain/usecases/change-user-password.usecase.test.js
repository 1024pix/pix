import { expect } from 'chai';

import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { BadRequestError } from '../../../../../src/shared/application/errors/http-errors.js';
import { EntityValidationError, PasswordNotMatching } from '../../../../../src/shared/domain/errors.js';
import { cryptoService } from '../../../../../src/shared/domain/services/crypto-service.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Identity Access Management | Domain | UseCase | changeUserPassword', function () {
  const currentPassword = 'example-of-a-valid-password-az-AZ-012343';
  const newPassword = 'example-of-another-valid-password-az-AZ-012343';

  it('checks the current password and updates the user password with the hashed new password', async function () {
    // given
    const user = databaseBuilder.factory.buildUser.withRawPassword({ rawPassword: currentPassword });
    await databaseBuilder.commit();

    // when
    await usecases.changeUserPassword({ userId: user.id, currentPassword, newPassword });

    // then
    const authenticationMethod = await knex('authentication-methods')
      .where({ userId: user.id, identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code })
      .first();

    expect(
      await cryptoService.matchPassword({
        password: newPassword,
        passwordHash: authenticationMethod.authenticationComplement.password,
      }),
    ).to.be.true;
    expect(
      await cryptoService.matchPassword({
        password: currentPassword,
        passwordHash: authenticationMethod.authenticationComplement.password,
      }),
    ).to.be.false;
  });

  context('when user has no Pix authentication method (SSO or GAR only)', function () {
    it('throws BadRequestError', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildAuthenticationMethod.withOidcProviderAsIdentityProvider({
        userId: user.id,
        identityProviderCode: 'OIDC_PROVIDER_EXAMPLE',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.changeUserPassword)({
        userId: user.id,
        currentPassword,
        newPassword,
      });

      // then
      expect(error).to.be.instanceOf(BadRequestError);
    });
  });

  context('when current password does not match', function () {
    it('throws PasswordNotMatching', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRawPassword({ rawPassword: currentPassword });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.changeUserPassword)({
        userId: user.id,
        currentPassword: 'wrongPassword123',
        newPassword,
      });

      // then
      expect(error).to.be.instanceOf(PasswordNotMatching);
    });
  });

  context('when new password does not match password policy', function () {
    it('throws EntityValidationError', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRawPassword({ rawPassword: currentPassword });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.changeUserPassword)({
        userId: user.id,
        currentPassword,
        newPassword: 'weak',
      });

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
    });
  });
});
