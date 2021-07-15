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

    it('should add PIX authentication method', async () => {
      // given
      const userRepository = {
        get: sinon.stub(),
      };
      const authenticationMethodRepository = {
        get: sinon.stub(),
        create: sinon.stub(),
      };
      const user = domainBuilder.buildUser({ id: 1234, emailConfirmedAt: '2021-04-07' });
      const authenticationMethodFromGAR = domainBuilder.buildAuthenticationMethod({
        userId: user.id,
        identityProvider: AuthenticationMethod.identityProviders.GAR,
      });
      const expectedAuthenticatedMethodCreated = domainBuilder.buildAuthenticationMethod.buildWithRawPassword({
        userId: user.id,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      });
      userRepository.get.resolves(user);
      authenticationMethodRepository.get.resolves([authenticationMethodFromGAR]);

      // when
      await updateUserEmailAndPassword({
        userId: user.id,
        password: expectedAuthenticatedMethodCreated.authenticationComplement.password,
        userRepository,
        authenticationMethodRepository,
      });

      // then
      expect(authenticationMethodRepository.create).to.have.been.calledWith(expectedAuthenticatedMethodCreated);
    });
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

