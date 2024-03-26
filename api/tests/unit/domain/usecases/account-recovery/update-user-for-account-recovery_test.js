import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../lib/domain/constants/identity-providers.js';
import { AuthenticationMethod } from '../../../../../lib/domain/models/AuthenticationMethod.js';
import { User } from '../../../../../lib/domain/models/User.js';
import { updateUserForAccountRecovery } from '../../../../../lib/domain/usecases/account-recovery/update-user-for-account-recovery.js';
import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Usecases | update-user-for-account-recovery', function () {
  let userRepository,
    authenticationMethodRepository,
    cryptoService,
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
      hasIdentityProviderPIX: sinon.stub(),
      create: sinon.stub(),
      updateChangedPassword: sinon.stub(),
    };
    scoAccountRecoveryService = {
      retrieveAndValidateAccountRecoveryDemand: sinon.stub(),
    };
    cryptoService = {
      hashPassword: sinon.stub(),
    };
    accountRecoveryDemandRepository = {
      markAsBeingUsed: sinon.stub(),
      findByTemporaryKey: sinon.stub(),
      findByUserId: sinon.stub(),
    };
    now = new Date();
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('when user has no Pix authentication method', function () {
    it('should add Pix authentication method', async function () {
      // given
      const password = 'pix123';
      const hashedPassword = 'hashedpassword';
      const domainTransaction = Symbol();

      const user = domainBuilder.buildUser({ id: 1234, email: null });

      scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand.resolves({ userId: user.id });
      cryptoService.hashPassword.withArgs(password).resolves(hashedPassword);
      authenticationMethodRepository.hasIdentityProviderPIX.withArgs({ userId: user.id }).resolves(false);
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
        return lambda(domainTransaction);
      });

      // when
      await updateUserForAccountRecovery({
        password,
        userRepository,
        authenticationMethodRepository,
        scoAccountRecoveryService,
        cryptoService,
        accountRecoveryDemandRepository,
        domainTransaction,
      });

      // then
      const expectedAuthenticationMethodFromPix = new AuthenticationMethod({
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
        authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
          password: hashedPassword,
          shouldChangePassword: false,
        }),
        userId: user.id,
      });
      expect(authenticationMethodRepository.create).to.have.been.calledWithExactly(
        {
          authenticationMethod: expectedAuthenticationMethodFromPix,
        },
        domainTransaction,
      );
    });
  });

  context('when user has Pix authentication method', function () {
    it('should only update password', async function () {
      // given
      const password = 'pix123';
      const hashedPassword = 'hashedpassword';
      const domainTransaction = Symbol();

      const user = domainBuilder.buildUser({
        id: 1234,
        email: null,
        username: 'manuella.philippe0702',
      });

      scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand.resolves({ userId: user.id });
      cryptoService.hashPassword.withArgs(password).resolves(hashedPassword);
      authenticationMethodRepository.hasIdentityProviderPIX.withArgs({ userId: user.id }).resolves(true);
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
        return lambda(domainTransaction);
      });

      // when
      await updateUserForAccountRecovery({
        password,
        userRepository,
        authenticationMethodRepository,
        scoAccountRecoveryService,
        cryptoService,
        accountRecoveryDemandRepository,
        domainTransaction,
      });

      // then
      expect(authenticationMethodRepository.updateChangedPassword).to.have.been.calledWithExactly(
        {
          userId: user.id,
          hashedPassword,
        },
        domainTransaction,
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

    scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand
      .withArgs({
        temporaryKey,
        accountRecoveryDemandRepository,
        userRepository,
      })
      .resolves({ userId: user.id, newEmail });
    cryptoService.hashPassword.withArgs(password).resolves(hashedPassword);
    authenticationMethodRepository.hasIdentityProviderPIX.withArgs({ userId: user.id }).resolves(true);
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

    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
      return lambda(domainTransaction);
    });

    // when
    await updateUserForAccountRecovery({
      password,
      temporaryKey,
      userRepository,
      authenticationMethodRepository,
      scoAccountRecoveryService,
      cryptoService,
      accountRecoveryDemandRepository,
      domainTransaction,
    });

    // then
    expect(accountRecoveryDemandRepository.markAsBeingUsed).to.have.been.calledWithExactly(
      temporaryKey,
      domainTransaction,
    );
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

    scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand.resolves({ userId: user.id, newEmail });
    cryptoService.hashPassword.resolves(hashedPassword);
    authenticationMethodRepository.hasIdentityProviderPIX.resolves(true);
    userRepository.updateWithEmailConfirmed.resolves(userUpdate);

    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
      return lambda(domainTransaction);
    });

    // when
    await updateUserForAccountRecovery({
      password,
      temporaryKey,
      userRepository,
      authenticationMethodRepository,
      scoAccountRecoveryService,
      cryptoService,
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
    expect(userRepository.updateWithEmailConfirmed).to.have.been.calledWithExactly(expectedParams);
  });
});
