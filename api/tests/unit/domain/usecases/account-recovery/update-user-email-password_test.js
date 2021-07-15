const sinon = require('sinon');
const {
  catchErr,
  expect,
  domainBuilder,
} = require('../../../../test-helper');
const updateUserEmailAndPassword = require('../../../../../lib/domain/usecases/account-recovery/update-user-email-and-password');
const { AccountRecoveryUserAlreadyConfirmEmail, UserNotFoundError } = require('../../../../../lib/domain/errors');
const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');
const User = require('../../../../../lib/domain/models/User');

describe('Unit | Usecases | update-user-email-and-password', () => {

  it('should throw an error when user not found', async () => {
    // given
    const userId = 1234;
    const userRepository = {
      get: sinon.stub(),
    };
    userRepository.get.rejects(new UserNotFoundError());

    // when
    const error = await catchErr(updateUserEmailAndPassword)({
      userId,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(UserNotFoundError);
    expect(error.message).to.be.equal('Ce compte est introuvable.');

  });

  it('should throw an error when user had already confirmed his email', async () => {
    // given
    const userRepository = {
      get: sinon.stub(),
    };
    userRepository.get.resolves({ emailConfirmedAt: '2021-04-07' });

    // when
    const error = await catchErr(updateUserEmailAndPassword)({ userRepository });

    // then
    expect(error).to.be.an.instanceOf(AccountRecoveryUserAlreadyConfirmEmail);
    expect(error.message).to.be.equal('This user has already a confirmed email.');

  });

  context('when user has only GAR authentication method', () => {

    it('should add PIX authentication method, accept terms of service and update email and set date of confirmation', async () => {
      // given
      const userRepository = {
        get: sinon.stub(),
        updateEmail: sinon.stub(),
        save: sinon.stub(),
      };
      const authenticationMethodRepository = {
        findByUserId: sinon.stub(),
        create: sinon.stub(),
      };
      const encryptionService = {
        hashPassword: sinon.stub(),
      };
      const accountRecoveryDemandRepository = {
        markAsBeingUsed: sinon.stub(),
      };

      const temporaryKey = 'temporarykey';
      const password = 'pix123';
      const hashedPassword = 'hashedpassword';
      const emailConfirmedAt = Date.now();

      const user = domainBuilder.buildUser({
        id: 1234,
        email: null,
      });
      const accountRecoveryDemand = domainBuilder.buildAccountRecoveryDemand({
        userId: user.id });
      const authenticationMethodFromGAR = domainBuilder.buildAuthenticationMethod({
        userId: user.id,
        identityProvider: AuthenticationMethod.identityProviders.GAR,
      });
      const expectedUpdatedUser = new User({
        ...user,
        email: accountRecoveryDemand.newEmail,
        password: hashedPassword,
        emailConfirmedAt,
      });

      userRepository.get.withArgs(user.id).resolves(user);
      encryptionService.hashPassword.withArgs(password).resolves(hashedPassword);
      authenticationMethodRepository.findByUserId.withArgs({ userId: user.id }).resolves([authenticationMethodFromGAR]);
      userRepository.save.withArgs(user).resolves(expectedUpdatedUser);

      // when
      const result = await updateUserEmailAndPassword({
        userId: user.id,
        newEmail: accountRecoveryDemand.newEmail,
        password,
        temporaryKey,
        userRepository,
        authenticationMethodRepository,
        encryptionService,
        accountRecoveryDemandRepository,
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
        authenticationMethod: expectedAuthenticationMethodFromPIX,
      });
      expect(accountRecoveryDemandRepository.markAsBeingUsed).to.have.been.calledWith(temporaryKey);
      expect(userRepository.save).to.have.been.calledWith(expectedUpdatedUser, sinon);
      expect(result.cgu).to.be.true;
      expect(result.email).to.equal(accountRecoveryDemand.newEmail);
      expect(result.emailConfirmedAt).to.equal(emailConfirmedAt);

    });

  });

  context('when user has only username authentication method', () => {

    it('should add PIX authentication method, accept terms of service and update email and set date of confirmation', async () => {
      // given
      const userRepository = {
        get: sinon.stub(),
        updateEmail: sinon.stub(),
        save: sinon.stub(),
      };
      const authenticationMethodRepository = {
        findByUserId: sinon.stub(),
        updateChangedPassword: sinon.stub(),
      };
      const encryptionService = {
        hashPassword: sinon.stub(),
      };
      const accountRecoveryDemandRepository = {
        markAsBeingUsed: sinon.stub(),
      };

      const temporaryKey = 'temporarykey';
      const password = 'pix123';
      const hashedPassword = 'hashedpassword';
      const emailConfirmedAt = Date.now();

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
      const expectedUpdatedUser = new User({
        ...user,
        email: accountRecoveryDemand.newEmail,
        password: hashedPassword,
        emailConfirmedAt,
      });

      userRepository.get.withArgs(user.id).resolves(user);
      encryptionService.hashPassword.withArgs(password).resolves(hashedPassword);
      authenticationMethodRepository.findByUserId.withArgs({ userId: user.id }).resolves([authenticationMethodFromGAR]);
      userRepository.save.withArgs(user).resolves(expectedUpdatedUser);

      // when
      const result = await updateUserEmailAndPassword({
        userId: user.id,
        newEmail: accountRecoveryDemand.newEmail,
        password,
        temporaryKey,
        userRepository,
        authenticationMethodRepository,
        encryptionService,
        accountRecoveryDemandRepository,
      });

      // then
      expect(authenticationMethodRepository.updateChangedPassword).to.have.been.calledWith({
        userId: user.id,
        hashedPassword,
      });
      expect(accountRecoveryDemandRepository.markAsBeingUsed).to.have.been.calledWith(temporaryKey);
      expect(userRepository.save).to.have.been.called;
      expect(result.cgu).to.be.true;
      expect(result.email).to.equal(accountRecoveryDemand.newEmail);
      expect(result.emailConfirmedAt).to.equal(emailConfirmedAt);

    });

  });

  context('when user has only email authentication method', () => {

    it('should add PIX authentication method, accept terms of service and update email and set date of confirmation', async () => {
      // given
      const userRepository = {
        get: sinon.stub(),
        updateEmail: sinon.stub(),
        save: sinon.stub(),
      };
      const authenticationMethodRepository = {
        findByUserId: sinon.stub(),
        updateChangedPassword: sinon.stub(),
      };
      const encryptionService = {
        hashPassword: sinon.stub(),
      };
      const accountRecoveryDemandRepository = {
        markAsBeingUsed: sinon.stub(),
      };
      const temporaryKey = 'temporarykey';
      const password = 'pix123';
      const hashedPassword = 'hashedpassword';
      const emailConfirmedAt = Date.now();

      const user = domainBuilder.buildUser({
        id: 1234,
        email: 'philippe@example.net',
        username: null,
      });
      const accountRecoveryDemand = domainBuilder.buildAccountRecoveryDemand({
        userId: user.id });
      const authenticationMethodFromGAR = domainBuilder.buildAuthenticationMethod.buildWithHashedPassword({
        userId: user.id,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      });
      const expectedUpdatedUser = new User({
        ...user,
        email: accountRecoveryDemand.newEmail,
        password: hashedPassword,
        emailConfirmedAt,
      });

      userRepository.get.withArgs(user.id).resolves(user);
      encryptionService.hashPassword.withArgs(password).resolves(hashedPassword);
      authenticationMethodRepository.findByUserId.withArgs({ userId: user.id }).resolves([authenticationMethodFromGAR]);
      userRepository.save.withArgs(user).resolves(expectedUpdatedUser);

      // when
      const result = await updateUserEmailAndPassword({
        userId: user.id,
        newEmail: accountRecoveryDemand.newEmail,
        password,
        temporaryKey,
        userRepository,
        authenticationMethodRepository,
        encryptionService,
        accountRecoveryDemandRepository,
      });

      // then
      expect(authenticationMethodRepository.updateChangedPassword).to.have.been.calledWith({
        userId: user.id,
        hashedPassword,
      });
      expect(accountRecoveryDemandRepository.markAsBeingUsed).to.have.been.calledWith(temporaryKey);
      expect(userRepository.save).to.have.been.called;
      expect(result.cgu).to.be.true;
      expect(result.email).to.equal(accountRecoveryDemand.newEmail);
      expect(result.emailConfirmedAt).to.equal(emailConfirmedAt);

    });

  });

});

