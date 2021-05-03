const { catchErr, databaseBuilder, expect } = require('../../../test-helper');

const mailService = require('../../../../lib/domain/services/mail-service');
const resetPasswordService = require('../../../../lib/domain/services/reset-password-service');
const resetPasswordDemandRepository = require('../../../../lib/infrastructure/repositories/reset-password-demands-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

const { UserNotFoundError } = require('../../../../lib/domain/errors');

const createPasswordResetDemand = require('../../../../lib/domain/usecases/create-password-reset-demand');

describe('Integration | UseCases | create-password-reset-demand', () => {

  const email = 'user@example.net';
  const locale = 'fr';

  beforeEach(async () => {
    const userId = databaseBuilder.factory.buildUser({ email }).id;
    databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({ userId });
    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await databaseBuilder.clean();
  });

  it('should return a password reset demand', async () => {
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

  it('should throw UserNotFoundError if no user account exists with this email', async () => {
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
