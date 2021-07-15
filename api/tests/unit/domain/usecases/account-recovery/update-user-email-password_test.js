const sinon = require('sinon');
const {
  catchErr,
  expect,
  domainBuilder,
} = require('../../../../test-helper');
const updateUserEmailAndPassword = require('../../../../../lib/domain/usecases/account-recovery/update-user-email-and-password');
const { AccountRecoveryUserAlreadyConfirmEmail, UserNotFoundError } = require('../../../../../lib/domain/errors');
const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');

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

  context('when user has only GAR authentication method', ()=> {

    it('should add PIX authentication method and confirmed email', async () => {
      // given
      const userRepository = {
        get: sinon.stub(),
        updateEmail: sinon.stub(),
      };
      const authenticationMethodRepository = {
        findByUserId: sinon.stub(),
        create: sinon.stub(),
      };
      const password = 'pix123';

      const user = domainBuilder.buildUser({
        id: 1234,
        email: null,
        emailConfirmedAt: '2021-04-07' });
      const authenticationMethodFromGAR = domainBuilder.buildAuthenticationMethod({
        userId: user.id,
        identityProvider: AuthenticationMethod.identityProviders.GAR,
      });
      userRepository.get.withArgs(user.id).resolves(user);
      authenticationMethodRepository.findByUserId.withArgs({ userId: user.id }).resolves([authenticationMethodFromGAR]);

      // when
      await updateUserEmailAndPassword({
        userId: user.id,
        password,
        userRepository,
        authenticationMethodRepository,
      });

      // then
      const expectedAuthenticationMethodFromPIX = new AuthenticationMethod({
        identityProvider: AuthenticationMethod.identityProviders.PIX,
        authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
          password,
          shouldChangePassword: false,
        }),
        userId: user.id,
      });

      expect(authenticationMethodRepository.create).to.have.been.calledWith({
        authenticationMethod: expectedAuthenticationMethodFromPIX,
      });
      expect(userRepository.updateEmail).to.have.been.calledWith(user.id);
    });
  });

  it('should add or change email with confirmed email', async () => {
    // given
    const userRepository = {
      get: sinon.stub(),
      updateEmail: sinon.stub(),
    };
    const authenticationMethodRepository = {
      findByUserId: sinon.stub(),
      create: sinon.stub(),
    };
    const password = 'pix123';

    const user = domainBuilder.buildUser({
      id: 1234,
      email: null,
      emailConfirmedAt: '2021-04-07' });
    const authenticationMethodFromGAR = domainBuilder.buildAuthenticationMethod({
      userId: user.id,
      identityProvider: AuthenticationMethod.identityProviders.GAR,
    });
    const authenticationMethodFromPIX = domainBuilder.buildAuthenticationMethod({
      userId: user.id,
      identityProvider: AuthenticationMethod.identityProviders.PIX,
    });
    userRepository.get.withArgs(user.id).resolves(user);
    authenticationMethodRepository.findByUserId.withArgs({ userId: user.id }).resolves([authenticationMethodFromGAR]);

    // when
    await updateUserEmailAndPassword({
      userId: user.id,
      password,
      userRepository,
      authenticationMethodRepository,
    });

    // then
    const expectedAuthenticationMethodFromPIX = new AuthenticationMethod({
      identityProvider: AuthenticationMethod.identityProviders.PIX,
      authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
        password,
        shouldChangePassword: false,
      }),
      userId: user.id,
    });

    expect(authenticationMethodRepository.create).to.have.been.calledWith({
      authenticationMethod: expectedAuthenticationMethodFromPIX,
    });
    expect(userRepository.updateEmail).to.have.been.calledWith(user.id);
  });

  // it('should accept pix terms of service and set confirmation date for email', async () => {
  //
  //   // given
  //   const userRepository = {
  //     get: sinon.stub(),
  //     save: sinon.stub(),
  //   };
  //   const authenticationMethodRepository = {
  //     get: sinon.stub(),
  //   };
  //   userRepository.get.resolves({ id: 1234 });
  //   authenticationMethodRepository.get.resolves({});
  //
  //   expect(authenticationMethodRepository.save).to.have.been.calledWithExactly({});
  // });

});

