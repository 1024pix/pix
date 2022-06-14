const { sinon, expect, domainBuilder, catchErr } = require('../../../test-helper');

const { ForbiddenAccess, PasswordNotMatching, UserNotFoundError } = require('../../../../lib/domain/errors');

const updateExpiredPassword = require('../../../../lib/domain/usecases/update-expired-password');
const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | UseCase | update-expired-password', function () {
  const username = 'firstName.lastName0511';
  const expiredPassword = 'Password01';
  const newPassword = 'Password02';
  const hashedPassword = 'ABCDEF123';

  let user;

  let encryptionService;
  let authenticationMethodRepository, userRepository;

  beforeEach(function () {
    user = domainBuilder.buildUser({ username });
    const authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndRawPassword({
      userId: user.id,
      rawPassword: expiredPassword,
      shouldChangePassword: true,
    });
    user.authenticationMethods = [authenticationMethod];

    userRepository = {
      getUserWithPixAuthenticationMethodByUsername: sinon.stub(),
    };
    encryptionService = {
      hashPassword: sinon.stub(),
      checkPassword: sinon.stub(),
    };
    authenticationMethodRepository = {
      updateExpiredPassword: sinon.stub(),
    };

    userRepository.getUserWithPixAuthenticationMethodByUsername.resolves(user);
    encryptionService.hashPassword.resolves(hashedPassword);
    encryptionService.checkPassword.resolves();
  });

  it('should update user password with a hashed password', async function () {
    // when
    await updateExpiredPassword({
      expiredPassword,
      newPassword,
      username,
      encryptionService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    sinon.assert.calledOnce(userRepository.getUserWithPixAuthenticationMethodByUsername);
    sinon.assert.calledOnce(encryptionService.hashPassword);
    sinon.assert.calledWith(authenticationMethodRepository.updateExpiredPassword, {
      userId: user.id,
      hashedPassword,
    });
  });

  context('When credentials are invalid', function () {
    it('should throw UserNotFoundError when username is unknown', async function () {
      // given
      userRepository.getUserWithPixAuthenticationMethodByUsername.rejects(new UserNotFoundError());

      // when
      const error = await catchErr(updateExpiredPassword)({
        expiredPassword,
        newPassword,
        username,
        encryptionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it('should log error with username when username is unknown', async function () {
      // given
      userRepository.getUserWithPixAuthenticationMethodByUsername.rejects(new UserNotFoundError());
      sinon.stub(logger, 'warn');

      // when
      await catchErr(updateExpiredPassword)({
        expiredPassword,
        newPassword,
        username: 'bad-username',
        encryptionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(logger.warn).to.have.been.calledWith('Trying to change his password with incorrect username');
    });

    it('should throw PasswordNotMatching when expiredPassword is invalid', async function () {
      // given
      userRepository.getUserWithPixAuthenticationMethodByUsername.rejects(new PasswordNotMatching());

      // when
      const error = await catchErr(updateExpiredPassword)({
        expiredPassword,
        newPassword,
        username,
        encryptionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(PasswordNotMatching);
    });
  });

  context('When changing password is not required', function () {
    it('should throw ForbiddenAccess when shouldChangePassword is false', async function () {
      // given
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndRawPassword({
        userId: user.id,
        rawPassword: expiredPassword,
        shouldChangePassword: false,
      });
      user.authenticationMethods = [authenticationMethod];

      userRepository.getUserWithPixAuthenticationMethodByUsername.resolves(user);

      // when
      const error = await catchErr(updateExpiredPassword)({
        expiredPassword,
        newPassword,
        username,
        encryptionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(ForbiddenAccess);
    });
  });
});
