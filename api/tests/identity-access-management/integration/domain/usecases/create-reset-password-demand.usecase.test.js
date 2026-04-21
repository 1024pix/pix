import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';

import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Domain | UseCase | create-reset-password-demand', function () {
  const locale = 'fr';

  it('creates a reset password demand', async function () {
    // given
    const email = 'user@example.net';
    const userId = databaseBuilder.factory.buildUser({ email }).id;
    databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId });
    await databaseBuilder.commit();

    // when
    await usecases.createResetPasswordDemand({
      email,
      locale,
    });

    // then
    const resetPasswordDemand = await knex('reset-password-demands').where({ email }).first();
    expect(resetPasswordDemand).to.exist;
  });

  context('when a user account exists but with an email differing by case', function () {
    it('creates a reset password demand', async function () {
      // given
      const accountEmail = 'DIFFERING_BY_CASE@example.net';
      const passwordResetDemandEmail = 'differing_by_case@example.net';
      const userId = databaseBuilder.factory.buildUser({ email: accountEmail }).id;
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId });
      await databaseBuilder.commit();

      // when
      await usecases.createResetPasswordDemand({
        email: passwordResetDemandEmail,
        locale,
      });

      // then
      const resetPasswordDemand = await knex('reset-password-demands')
        .whereRaw('LOWER("email") = LOWER(?)', passwordResetDemandEmail)
        .first();
      expect(resetPasswordDemand).to.exist;
    });
  });

  context('when no user account with a matching email exists', function () {
    it('does not create a reset password demand', async function () {
      // given
      const unknownEmail = 'unknown@example.net';

      // when
      await usecases.createResetPasswordDemand({
        email: unknownEmail,
        locale,
      });

      // then
      const resetPasswordDemand = await knex('reset-password-demands').where({ email: unknownEmail }).first();
      expect(resetPasswordDemand).to.not.exist;
    });
  });
});
