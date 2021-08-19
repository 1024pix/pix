const sinon = require('sinon');
const {
  expect,
  domainBuilder,
} = require('../../../../test-helper');
const updateUserAccount = require('../../../../../lib/domain/usecases/account-recovery/update-user-account');
const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');
const DomainTransaction = require('../../../../../lib/infrastructure/DomainTransaction');

const User = require('../../../../../lib/domain/models/User');

describe('Unit | Usecases | update-user-account', function() {

  let userRepository, authenticationMethodRepository, encryptionService, accountRecoveryDemandRepository, scoAccountRecoveryService;
  const domainTransaction = Symbol();

  beforeEach(function() {
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
    DomainTransaction.execute = (lambda) => { return lambda(domainTransaction); };

  });

  context('when user has only GAR authentication method', function() {
    it('should add PIX authentication method', async function() {
      // given
      const password = 'pix123';
      const hashedPassword = 'hashedpassword';

      const user = domainBuilder.buildUser({ id: 1234, email: null });
      const authenticationMethodFromGAR = domainBuilder.buildAuthenticationMethod({
        userId: user.id,
        identityProvider: AuthenticationMethod.identityProviders.GAR,
      });

      scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand.resolves({ userId: user.id });
      encryptionService.hashPassword.withArgs(password).resolves(hashedPassword);
      authenticationMethodRepository.findByUserId.withArgs({ userId: user.id }).resolves([authenticationMethodFromGAR]);

      // when
      await updateUserAccount({
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
      expect(authenticationMethodRepository.create).to.have.been.calledWith({
        authenticationMethod: expectedAuthenticationMethodFromPIX },
      domainTransaction,
      );
    });
  });

  context('when user has either Pix authentication method or both GAR and Pix Authentication method', function() {
    it('should change password', async function() {
      // given
      const password = 'pix123';
      const hashedPassword = 'hashedpassword';

      const user = domainBuilder.buildUser({
        id: 1234,
        email: null,
        username: 'manuella.philippe0702',
      });
      const authenticationMethodFromGAR = domainBuilder.buildAuthenticationMethod.buildWithHashedPassword({
        userId: user.id,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      });

      scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand.resolves({ userId: user.id });
      encryptionService.hashPassword.withArgs(password).resolves(hashedPassword);
      authenticationMethodRepository.findByUserId.withArgs({ userId: user.id }).resolves([authenticationMethodFromGAR]);

      // when
      await updateUserAccount({
        password,
        userRepository,
        authenticationMethodRepository,
        scoAccountRecoveryService,
        encryptionService,
        accountRecoveryDemandRepository,
        domainTransaction,
      });

      // then
      expect(authenticationMethodRepository.updateChangedPassword).to.have.been.calledWith({
        userId: user.id,
        hashedPassword,
      },
      domainTransaction);
    });
  });

  it('should accept terms of service, update email and set date for confirmed email', async function() {
    // given
    const temporaryKey = 'temporarykey';
    const password = 'pix123';
    const hashedPassword = 'hashedpassword';
    const newEmail = 'newemail@example.net';
    const emailConfirmedAt = new Date();

    const user = domainBuilder.buildUser({
      id: 1234,
      email: null,
      username: 'manuella.philippe0702',
    });
    const authenticationMethodFromGAR = domainBuilder.buildAuthenticationMethod.buildWithHashedPassword({
      userId: user.id,
      identityProvider: AuthenticationMethod.identityProviders.PIX,
    });

    scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand.withArgs({
      temporaryKey,
      accountRecoveryDemandRepository,
      userRepository,
    }).resolves({ userId: user.id, newEmail });
    encryptionService.hashPassword.withArgs(password).resolves(hashedPassword);
    authenticationMethodRepository.findByUserId.withArgs({ userId: user.id }).resolves([authenticationMethodFromGAR]);
    const userUpdate = new User({
      ...user,
      cgu: true,
      email: newEmail,
      emailConfirmedAt,
    });
    const userAttributes = { cgu: true, email: newEmail, emailConfirmedAt };

    userRepository.updateWithEmailConfirmed.withArgs({ id: user.id, userAttributes, domainTransaction }).resolves(userUpdate);

    // when
    await updateUserAccount({
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

});

