const sinon = require('sinon');
const { expect, domainBuilder } = require('../../../../test-helper');
const updateUserForAccountRecovery = require('../../../../../lib/domain/usecases/account-recovery/update-user-for-account-recovery');
const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');
const DomainTransaction = require('../../../../../lib/infrastructure/DomainTransaction');

const User = require('../../../../../lib/domain/models/User');

describe('Unit | Usecases | update-user-for-account-recovery', function () {
  let userRepository,
    authenticationMethodRepository,
    encryptionService,
    accountRecoveryDemandRepository,
    scoAccountRecoveryService;
  let clock;
  let now;

  beforeEach(function () {
    userRepository = {
      updateEmail: sinon.stub(),
      updateWithEmailConfirmed: sinon.stub(),
    };
    authenticationMethodRepository = {
      findByUserId: sinon.stub(),
      create: sinon.stub(),
      updateChangedPassword: sinon.stub(),
    };
    scoAccountRecoveryService = {
      retrieveAndValidateAccountRecoveryDemand: sinon.stub(),
    };
    encryptionService = {
      hashPassword: sinon.stub(),
    };
    accountRecoveryDemandRepository = {
      markAsBeingUsed: sinon.stub(),
      findByTemporaryKey: sinon.stub(),
      findByUserId: sinon.stub(),
    };
    now = new Date();
    clock = sinon.useFakeTimers(now);
  });

  afterEach(function () {
    clock.restore();
  });

  context('when user has only GAR authentication method', function () {
    it('should add PIX authentication method', async function () {
      // given
      const password = 'pix123';
      const hashedPassword = 'hashedpassword';
      const domainTransaction = Symbol();

      const user = domainBuilder.buildUser({ id: 1234, email: null });
      const authenticationMethodFromGAR = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: user.id,
      });

      scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand.resolves({ userId: user.id });
      encryptionService.hashPassword.withArgs(password).resolves(hashedPassword);
      authenticationMethodRepository.findByUserId.withArgs({ userId: user.id }).resolves([authenticationMethodFromGAR]);
      DomainTransaction.execute = (lambda) => {
        return lambda(domainTransaction);
      };

      // when
      await updateUserForAccountRecovery({
        password,
        userRepository,
        authenticationMethodRepository,
        scoAccountRecoveryService,
        encryptionService,
        accountRecoveryDemandRepository,
        domainTransaction,
      });

      // then
      const expectedAuthenticationMethodFromPIX = new AuthenticationMethod({
        identityProvider: AuthenticationMethod.identityProviders.PIX,
        authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
          password: hashedPassword,
          shouldChangePassword: false,
        }),
        userId: user.id,
      });
      expect(authenticationMethodRepository.create).to.have.been.calledWith(
        {
          authenticationMethod: expectedAuthenticationMethodFromPIX,
        },
        domainTransaction
      );
    });
  });

  context('when user has either Pix authentication method or both GAR and Pix Authentication method', function () {
    it('should change password', async function () {
      // given
      const password = 'pix123';
      const hashedPassword = 'hashedpassword';
      const domainTransaction = Symbol();

      const user = domainBuilder.buildUser({
        id: 1234,
        email: null,
        username: 'manuella.philippe0702',
      });
      const authenticationMethodFromGAR =
        domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId: user.id });

      scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand.resolves({ userId: user.id });
      encryptionService.hashPassword.withArgs(password).resolves(hashedPassword);
      authenticationMethodRepository.findByUserId.withArgs({ userId: user.id }).resolves([authenticationMethodFromGAR]);
      DomainTransaction.execute = (lambda) => {
        return lambda(domainTransaction);
      };

      // when
      await updateUserForAccountRecovery({
        password,
        userRepository,
        authenticationMethodRepository,
        scoAccountRecoveryService,
        encryptionService,
        accountRecoveryDemandRepository,
        domainTransaction,
      });

      // then
      expect(authenticationMethodRepository.updateChangedPassword).to.have.been.calledWith(
        {
          userId: user.id,
          hashedPassword,
        },
        domainTransaction
      );
    });
  });

  it('should mark account recovery demand as being used when user id updated', async function () {
    // given
    const temporaryKey = 'temporarykey';
    const password = 'pix123';
    const hashedPassword = 'hashedpassword';
    const newEmail = 'newemail@example.net';
    const emailConfirmedAt = new Date();
    const domainTransaction = Symbol();

    const user = domainBuilder.buildUser({
      id: 1234,
      email: null,
      username: 'manuella.philippe0702',
    });
    const authenticationMethodFromGAR =
      domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId: user.id });

    scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand
      .withArgs({
        temporaryKey,
        accountRecoveryDemandRepository,
        userRepository,
      })
      .resolves({ userId: user.id, newEmail });
    encryptionService.hashPassword.withArgs(password).resolves(hashedPassword);
    authenticationMethodRepository.findByUserId.withArgs({ userId: user.id }).resolves([authenticationMethodFromGAR]);
    const userUpdate = new User({
      ...user,
      cgu: true,
      email: newEmail,
      emailConfirmedAt,
    });
    const userAttributes = { cgu: true, email: newEmail, emailConfirmedAt };

    userRepository.updateWithEmailConfirmed
      .withArgs({ id: user.id, userAttributes, domainTransaction })
      .resolves(userUpdate);

    DomainTransaction.execute = (lambda) => {
      return lambda(domainTransaction);
    };

    // when
    await updateUserForAccountRecovery({
      password,
      temporaryKey,
      userRepository,
      authenticationMethodRepository,
      scoAccountRecoveryService,
      encryptionService,
      accountRecoveryDemandRepository,
      domainTransaction,
    });

    // then
    expect(accountRecoveryDemandRepository.markAsBeingUsed).to.have.been.calledWith(temporaryKey);
  });

  it('should save last terms of service validated at date', async function () {
    // given
    const temporaryKey = 'temporarykey';
    const password = 'pix123';
    const hashedPassword = 'hashedpassword';
    const newEmail = 'newemail@example.net';
    const emailConfirmedAt = now;
    const domainTransaction = Symbol();

    const user = domainBuilder.buildUser({
      id: 1234,
      email: null,
      username: 'manuella.philippe0702',
    });
    const userUpdate = new User({
      ...user,
      cgu: true,
      email: newEmail,
      emailConfirmedAt,
    });
    const authenticationMethodFromGAR =
      domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId: user.id });

    scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand.resolves({ userId: user.id, newEmail });
    encryptionService.hashPassword.resolves(hashedPassword);
    authenticationMethodRepository.findByUserId.resolves([authenticationMethodFromGAR]);
    userRepository.updateWithEmailConfirmed.resolves(userUpdate);

    DomainTransaction.execute = (lambda) => {
      return lambda(domainTransaction);
    };

    // when
    await updateUserForAccountRecovery({
      password,
      temporaryKey,
      userRepository,
      authenticationMethodRepository,
      scoAccountRecoveryService,
      encryptionService,
      accountRecoveryDemandRepository,
      domainTransaction,
    });

    // then
    const expectedParams = {
      id: 1234,
      userAttributes: {
        cgu: true,
        email: 'newemail@example.net',
        emailConfirmedAt: now,
        lastTermsOfServiceValidatedAt: now,
      },
      domainTransaction,
    };
    expect(userRepository.updateWithEmailConfirmed).to.have.been.calledWith(expectedParams);
  });
});
