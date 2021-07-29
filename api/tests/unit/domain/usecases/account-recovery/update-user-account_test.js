const sinon = require('sinon');
const {
  catchErr,
  expect,
  domainBuilder,
} = require('../../../../test-helper');
const updateUserAccount = require('../../../../../lib/domain/usecases/account-recovery/update-user-account');
const {
  NotFoundError,
  UserHasAlreadyLeftSCO,
} = require('../../../../../lib/domain/errors');
const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');
const DomainTransaction = require('../../../../../lib/infrastructure/DomainTransaction');

const User = require('../../../../../lib/domain/models/User');

describe('Unit | Usecases | update-user-account', () => {

  let userRepository, authenticationMethodRepository, encryptionService, accountRecoveryDemandRepository;
  const domainTransaction = Symbol();

  beforeEach(() => {
    userRepository = {
      updateEmail: sinon.stub(),
      updateWithEmailConfirmed: sinon.stub(),
    };
    authenticationMethodRepository = {
      findByUserId: sinon.stub(),
      create: sinon.stub(),
      updateChangedPassword: sinon.stub(),
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

  it('should throw an error when temporaryKey is invalid', async () => {
    // given
    const invalidTemporaryKey = 'temporarykey';
    domainBuilder.buildAccountRecoveryDemand({ temporaryKey: invalidTemporaryKey });
    accountRecoveryDemandRepository.findByTemporaryKey.rejects(new NotFoundError());

    // when
    const error = await catchErr(updateUserAccount)({
      temporaryKey: invalidTemporaryKey,
      accountRecoveryDemandRepository,
    });

    // then
    expect(accountRecoveryDemandRepository.findByTemporaryKey).to.be.calledWith(invalidTemporaryKey);
    expect(error).to.be.an.instanceOf(NotFoundError);
  });

  context('when user had already left SCO', () => {

    it('should throw an error', async () => {
      // given
      const user = domainBuilder.buildUser();
      const accountRecoveryDemandUsed = domainBuilder.buildAccountRecoveryDemand({
        userId: user.id,
        used: true,
      });
      const accountRecoveryDemandNotUsed = domainBuilder.buildAccountRecoveryDemand({
        userId: user.id,
      });

      accountRecoveryDemandRepository.findByTemporaryKey.resolves(accountRecoveryDemandNotUsed);
      accountRecoveryDemandRepository.findByUserId.withArgs(accountRecoveryDemandNotUsed.userId).resolves([accountRecoveryDemandNotUsed, accountRecoveryDemandUsed]);

      // when
      const error = await catchErr(updateUserAccount)({
        userId: user.id,
        userRepository,
        accountRecoveryDemandRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(UserHasAlreadyLeftSCO);
      expect(error.message).to.be.equal('User has already left SCO.');

    });
  });

  context('when user has only GAR authentication method', () => {

    it('should add PIX authentication method', async () => {
      // given
      const temporaryKey = 'temporarykey';
      const password = 'pix123';
      const hashedPassword = 'hashedpassword';

      const user = domainBuilder.buildUser({ id: 1234, email: null });
      const accountRecoveryDemand = domainBuilder.buildAccountRecoveryDemand({ userId: user.id });
      const authenticationMethodFromGAR = domainBuilder.buildAuthenticationMethod({
        userId: user.id,
        identityProvider: AuthenticationMethod.identityProviders.GAR,
      });

      accountRecoveryDemandRepository.findByUserId.withArgs(accountRecoveryDemand.userId).resolves([accountRecoveryDemand]);
      encryptionService.hashPassword.withArgs(password).resolves(hashedPassword);
      authenticationMethodRepository.findByUserId.withArgs({ userId: user.id }).resolves([authenticationMethodFromGAR]);
      accountRecoveryDemandRepository.findByTemporaryKey.withArgs(temporaryKey).resolves(accountRecoveryDemand);

      // when
      await updateUserAccount({
        password,
        temporaryKey,
        userRepository,
        authenticationMethodRepository,
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

  context('when user has either Pix authentication method or both GAR and Pix Authentication method', () => {

    it('should change password', async () => {
      // given
      const temporaryKey = 'temporarykey';
      const password = 'pix123';
      const hashedPassword = 'hashedpassword';

      const user = domainBuilder.buildUser({
        id: 1234,
        email: null,
        username: 'manuella.philippe0702',
      });
      const accountRecoveryDemand = domainBuilder.buildAccountRecoveryDemand({ userId: user.id });
      const authenticationMethodFromGAR = domainBuilder.buildAuthenticationMethod.buildWithHashedPassword({
        userId: user.id,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      });

      accountRecoveryDemandRepository.findByUserId.withArgs(accountRecoveryDemand.userId).resolves([accountRecoveryDemand]);
      encryptionService.hashPassword.withArgs(password).resolves(hashedPassword);
      authenticationMethodRepository.findByUserId.withArgs({ userId: user.id }).resolves([authenticationMethodFromGAR]);
      accountRecoveryDemandRepository.findByTemporaryKey.withArgs(temporaryKey).resolves(accountRecoveryDemand);

      // when
      await updateUserAccount({
        password,
        temporaryKey,
        userRepository,
        authenticationMethodRepository,
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

  it('should accept terms of service, update email and set date for confirmed email', async () => {
    // given
    const temporaryKey = 'temporarykey';
    const password = 'pix123';
    const hashedPassword = 'hashedpassword';
    const emailConfirmedAt = new Date();

    const user = domainBuilder.buildUser({
      id: 1234,
      email: null,
      username: 'manuella.philippe0702',
    });
    const accountRecoveryDemand = domainBuilder.buildAccountRecoveryDemand({
      userId: user.id });
    const authenticationMethodFromGAR = domainBuilder.buildAuthenticationMethod.buildWithHashedPassword({
      userId: user.id,
      identityProvider: AuthenticationMethod.identityProviders.PIX,
    });

    accountRecoveryDemandRepository.findByUserId.withArgs(accountRecoveryDemand.userId).resolves([accountRecoveryDemand]);

    encryptionService.hashPassword.withArgs(password).resolves(hashedPassword);
    authenticationMethodRepository.findByUserId.withArgs({ userId: user.id }).resolves([authenticationMethodFromGAR]);
    const userUpdate = new User({
      ...user,
      cgu: true,
      email: accountRecoveryDemand.newEmail,
      emailConfirmedAt,
    });
    const userAttributes = { cgu: true, email: accountRecoveryDemand.newEmail, emailConfirmedAt };

    userRepository.updateWithEmailConfirmed.withArgs({ id: user.id, userAttributes, domainTransaction }).resolves(userUpdate);
    accountRecoveryDemandRepository.findByTemporaryKey.withArgs(temporaryKey).resolves(accountRecoveryDemand);

    // when
    await updateUserAccount({
      password,
      temporaryKey,
      userRepository,
      authenticationMethodRepository,
      encryptionService,
      accountRecoveryDemandRepository,
      domainTransaction,
    });

    // then
    expect(accountRecoveryDemandRepository.markAsBeingUsed).to.have.been.calledWith(temporaryKey);
  });

});

