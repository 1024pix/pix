import { UserNotFoundError } from '../../../../../lib/domain/errors.js';
import * as mailService from '../../../../../lib/domain/services/mail-service.js';
import * as resetPasswordService from '../../../../../src/identity-access-management/domain/services/reset-password.service.js';
import { createResetPasswordDemand } from '../../../../../src/identity-access-management/domain/usecases/create-reset-password-demand.usecase.js';
import * as resetPasswordDemandRepository from '../../../../../src/identity-access-management/infrastructure/repositories/reset-password-demand.repository.js';
import * as userRepository from '../../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { catchErr, databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | UseCase | create-reset-password-demand', function () {
  const email = 'user@example.net';
  const locale = 'fr';

  beforeEach(async function () {
    const userId = databaseBuilder.factory.buildUser({ email }).id;
    databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId });
    await databaseBuilder.commit();
  });

  it('returns a reset password demand', async function () {
    // when
    const result = await createResetPasswordDemand({
      email,
      locale,
      mailService,
      resetPasswordService,
      resetPasswordDemandRepository,
      userRepository,
    });

    // then
    expect(result.email).to.deep.equal(email);
    expect(result.temporaryKey).to.be.ok;
  });

  it('throws UserNotFoundError if no user account exists with this email', async function () {
    // given
    const unknownEmail = 'unknown@example.net';

    // when
    const error = await catchErr(createResetPasswordDemand)({
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
