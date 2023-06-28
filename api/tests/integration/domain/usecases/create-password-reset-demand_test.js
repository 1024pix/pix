import { catchErr, databaseBuilder, expect, knex } from '../../../test-helper.js';

import * as mailService from '../../../../lib/shared/domain/services/mail-service.js';
import * as resetPasswordService from '../../../../lib/shared/domain/services/reset-password-service.js';
import * as resetPasswordDemandRepository from '../../../../lib/shared/infrastructure/repositories/reset-password-demands-repository.js';
import * as userRepository from '../../../../lib/shared/infrastructure/repositories/user-repository.js';

import { UserNotFoundError } from '../../../../lib/shared/domain/errors.js';
import { createPasswordResetDemand } from '../../../../lib/shared/domain/usecases/create-password-reset-demand.js';

describe('Integration | UseCases | create-password-reset-demand', function () {
  const email = 'user@example.net';
  const locale = 'fr';

  beforeEach(async function () {
    const userId = databaseBuilder.factory.buildUser({ email }).id;
    databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId });
    await databaseBuilder.commit();
  });

  afterEach(function () {
    return knex('reset-password-demands').delete();
  });

  it('should return a password reset demand', async function () {
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
    expect(result.attributes.email).to.deep.equal(email);
    expect(result.attributes.temporaryKey).to.be.ok;
  });

  it('should throw UserNotFoundError if no user account exists with this email', async function () {
    // given
    const unknownEmail = 'unknown@example.net';

    // when
    const error = await catchErr(createPasswordResetDemand)({
      email: unknownEmail,
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
