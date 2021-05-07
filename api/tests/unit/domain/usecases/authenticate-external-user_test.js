const {
  expect,
  sinon,
  domainBuilder,
  catchErr,
} = require('../../../test-helper');

const authenticateExternalUser = require('../../../../lib/domain/usecases/authenticate-external-user');

const {
  MissingOrInvalidCredentialsError,
  UserNotFoundError,
  PasswordNotMatching,
  UserShouldChangePasswordError,
} = require('../../../../lib/domain/errors');

describe('Unit | Application | UseCase | authenticate-external-user', () => {

  let tokenService;
  let authenticationService;
  let userRepository;

  beforeEach(() => {
    tokenService = {
      createAccessTokenFromUser: sinon.stub(),
    };
    authenticationService = {
      getUserByUsernameAndPassword: sinon.stub(),
    };
    userRepository = sinon.stub();
  });

  context('when credentials are valid', () =>{

    it('should resolve a valid JWT token when authentication succeeds (should not change password)', async () => {

      // given
      const expectedToken = Symbol();
      const userId = 1;
      const source = 'external';
      tokenService.createAccessTokenFromUser.withArgs(
        userId,
        source,
      ).resolves(expectedToken);

      const email = 'john.doe@example.net';
      const password = 'Azerty123*';
      const emailAuthenticationMethod = domainBuilder.buildAuthenticationMethod({
        authenticationComplement: {
          password,
          shouldChangePassword: false,
        },
      });
      const user = domainBuilder.buildUser({
        id: userId,
        email,
        authenticationMethods: [emailAuthenticationMethod],
      });

      authenticationService.getUserByUsernameAndPassword.withArgs({
        username: email,
        password,
        userRepository,
      }).resolves(user);

      // when
      const token = await authenticateExternalUser({
        username: email,
        password,
        tokenService,
        authenticationService,
        userRepository });

      // then
      expect(token).to.be.deep.equal(expectedToken);

    });

    context('when user should change password', () => {

      it('should throw UserShouldChangePasswordError', async () => {
        // given
        const userId = 1;
        const email = 'john.doe@example.net';
        const oneTimePassword = 'Azerty123*';

        const emailAuthenticationMethod = domainBuilder.buildAuthenticationMethod.buildWithHashedPassword({
          hashedPassword: oneTimePassword,
          shouldChangePassword: true,
        });

        const user = domainBuilder.buildUser({
          id: userId,
          email,
          authenticationMethods: [emailAuthenticationMethod],
        });

        authenticationService.getUserByUsernameAndPassword.withArgs({
          username: email,
          password: oneTimePassword,
          userRepository,
        }).resolves(user);

        // when
        const error = await catchErr(authenticateExternalUser)({
          username: email,
          password: oneTimePassword,
          tokenService,
          authenticationService,
          userRepository,
        });

        // then
        expect(error).to.be.an.instanceOf(UserShouldChangePasswordError);
      });

    });

  });

  context('when credentials are invalid', () =>{

    it('should reject when user not found', async () => {

      // given
      const unknownUserEmail = 'foo@example.net';
      const password = 'Azerty123*';

      authenticationService.getUserByUsernameAndPassword.withArgs({
        username: unknownUserEmail,
        password,
        userRepository,
      }).rejects(new UserNotFoundError());

      // when
      const error = await catchErr(authenticateExternalUser)({
        username: unknownUserEmail,
        password,
        tokenService,
        authenticationService,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(MissingOrInvalidCredentialsError);
    });

    it('should reject when password does not match', async () => {

      // given
      const email = 'foo@example.net';
      const invalidPassword = 'oups123*';

      authenticationService.getUserByUsernameAndPassword.withArgs({
        username: email,
        password: invalidPassword,
        userRepository,
      }).rejects(new PasswordNotMatching());

      // when
      const error = await catchErr(authenticateExternalUser)({
        username: email,
        password: invalidPassword,
        tokenService,
        authenticationService,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(MissingOrInvalidCredentialsError);
    });
  });

});
