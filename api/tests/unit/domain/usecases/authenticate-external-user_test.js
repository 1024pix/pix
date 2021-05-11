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
  UnexpectedUserAccount,
  InvalidExternalUserTokenError,
  UserAlreadyExistsWithAuthenticationMethodError,
} = require('../../../../lib/domain/errors');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

describe('Unit | Application | UseCase | authenticate-external-user', () => {

  let tokenService;
  let authenticationService;
  let obfuscationService;
  let authenticationMethodRepository;
  let userRepository;

  beforeEach(() => {
    tokenService = {
      createAccessTokenFromExternalUser: sinon.stub(),
      extractSamlId: sinon.stub(),
    };
    authenticationService = {
      getUserByUsernameAndPassword: sinon.stub(),
    };
    obfuscationService = {
      getUserAuthenticationMethodWithObfuscation: sinon.stub(),
    };
    authenticationMethodRepository = {
      create: sinon.stub(),
    };
    userRepository = {
      getBySamlId: sinon.stub(),
    };
  });

  context('when credentials are valid', () => {

    it('should resolve a valid JWT token when authentication succeeds (should not change password)', async () => {
      // given
      const password = 'Azerty123*';
      const { user } = createUserWithValidCredentials({
        password,
        authenticationService,
        userRepository,
      });

      const externalUserToken = 'external user token';
      createValidConditionsForAddingGarAuthenticationMethod({
        user,
        externalUserToken,
        tokenService,
        userRepository,
        authenticationMethodRepository,
      });

      const expectedToken = 'expected returned token';
      tokenService.createAccessTokenFromExternalUser.withArgs(user.id).resolves(expectedToken);

      // when
      const token = await authenticateExternalUser({
        username: user.email,
        password,
        externalUserToken,
        expectedUserId: user.id,
        tokenService,
        authenticationService,
        obfuscationService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(token).to.be.deep.equal(expectedToken);

    });

    it('should throw an UnexpectedUserAccount when the authenticated user does not match the expected one', async () => {
      // given
      const password = 'Azerty123*';
      const { user } = createUserWithValidCredentials({
        password,
        authenticationService,
        userRepository,
      });

      const emailObfusced = 'j*****@e*****.n**';
      const authenticatedByAndValue = { value: emailObfusced };
      obfuscationService.getUserAuthenticationMethodWithObfuscation
        .withArgs(user)
        .resolves(authenticatedByAndValue);

      const invalidExpectedUserId = user.id + 1;

      // when
      const error = await catchErr(authenticateExternalUser)({
        username: user.email,
        password,
        externalUserToken: 'an external user token',
        expectedUserId: invalidExpectedUserId,
        tokenService,
        authenticationService,
        obfuscationService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceof(UnexpectedUserAccount);
      expect(error.message).to.equal('Ce compte utilisateur n\'est pas celui qui est attendu.');
      expect(error.code).to.equal('UNEXPECTED_USER_ACCOUNT');
      expect(error.meta.value).to.equal(emailObfusced);
    });

    context('when adding GAR authentication method', () => {

      it('should throw an error if external user token is invalid', async () => {
        // given
        const password = 'Azerty123*';
        const { user } = createUserWithValidCredentials({
          password,
          authenticationService,
          userRepository,
        });

        const invalidExternalUserToken = 'INVALID_EXTERNAL_USER_TOKEN';
        tokenService.extractSamlId.withArgs(invalidExternalUserToken).returns(null);

        // when
        const error = await catchErr(authenticateExternalUser)({
          username: user.email,
          password,
          externalUserToken: invalidExternalUserToken,
          expectedUserId: user.id,
          tokenService,
          authenticationService,
          authenticationMethodRepository,
          userRepository,
        });

        // then
        expect(error).to.be.instanceOf(InvalidExternalUserTokenError);
      });

      it('should throw an error if user from external user token is not the same as found user from credentials', async () => {
        // given
        const password = 'Azerty123*';
        const { user: userFromCredentials } = createUserWithValidCredentials({
          password,
          authenticationService,
          userRepository,
        });

        const externalUserToken = 'EXTERNAL_USER_TOKEN';
        const samlId = 'samlId';
        tokenService.extractSamlId.withArgs(externalUserToken).returns(samlId);

        const userFromExternalUserToken = domainBuilder.buildUser({ id: userFromCredentials.id + 1 });
        userRepository.getBySamlId.withArgs(samlId).resolves(userFromExternalUserToken);

        // when
        const error = await catchErr(authenticateExternalUser)({
          username: userFromCredentials.email,
          password,
          externalUserToken: externalUserToken,
          expectedUserId: userFromCredentials.id,
          tokenService,
          authenticationService,
          authenticationMethodRepository,
          userRepository,
        });

        // then
        expect(error).to.be.instanceOf(UserAlreadyExistsWithAuthenticationMethodError);
      });

      it('should add GAR authentication method', async () => {
        // given
        const password = 'Azerty123*';
        const { user } = createUserWithValidCredentials({
          password,
          authenticationService,
          userRepository,
        });

        const externalUserToken = 'external user token';
        const samlId = 'samlId';
        createValidConditionsForAddingGarAuthenticationMethod({
          user,
          externalUserToken,
          samlId,
          tokenService,
          userRepository,
          authenticationMethodRepository,
        });

        // when
        await authenticateExternalUser({
          username: user.email,
          password,
          externalUserToken,
          expectedUserId: user.id,
          tokenService,
          authenticationService,
          authenticationMethodRepository,
          userRepository,
        });

        // then
        const expectedAuthenticationMethod = new AuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier: samlId,
          userId: user.id,
        });
        expect(authenticationMethodRepository.create).to.have.been.calledWith({ authenticationMethod: expectedAuthenticationMethod });
      });

    });

    context('when user should change password', () => {

      it('should also add GAR authentication method', async () => {
        // given
        const oneTimePassword = 'Azerty123*';
        const { user } = createUserWithValidCredentialsWhoShouldChangePassword({
          authenticationService,
          userRepository,
        });

        const externalUserToken = 'EXTERNAL_USER_TOKEN';
        const externalIdentifier = 'EXTENAL_IDENTIFIER';
        createValidConditionsForAddingGarAuthenticationMethod({
          user,
          externalUserToken,
          samlId: externalIdentifier,
          tokenService,
          userRepository,
          authenticationMethodRepository,
        });

        // when
        await catchErr(authenticateExternalUser)({
          username: user.email,
          password: oneTimePassword,
          externalUserToken,
          expectedUserId: user.id,
          tokenService,
          authenticationService,
          authenticationMethodRepository,
          userRepository,
        });

        // then
        const expectedAuthenticationMethod = new AuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier,
          userId: user.id,
        });
        expect(authenticationMethodRepository.create).to.have.been.calledWith({ authenticationMethod: expectedAuthenticationMethod });
      });

      it('should throw UserShouldChangePasswordError', async () => {
        // given
        const oneTimePassword = 'Azerty123*';
        const { user } = createUserWithValidCredentialsWhoShouldChangePassword({
          authenticationService,
          userRepository,
        });

        const externalUserToken = 'EXTERNAL_USER_TOKEN';
        const externalIdentifier = 'EXTENAL_IDENTIFIER';
        createValidConditionsForAddingGarAuthenticationMethod({
          user,
          externalUserToken,
          samlId: externalIdentifier,
          tokenService,
          userRepository,
          authenticationMethodRepository,
        });

        // when
        const error = await catchErr(authenticateExternalUser)({
          username: user.email,
          password: oneTimePassword,
          externalUserToken,
          expectedUserId: user.id,
          tokenService,
          authenticationService,
          authenticationMethodRepository,
          userRepository,
        });

        // then
        expect(error).to.be.an.instanceOf(UserShouldChangePasswordError);
      });
    });

  });

  context('when credentials are invalid', () => {

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

function createUserWithValidCredentials({
  password = 'Azerty123*',
  authenticationService,
  userRepository,
}) {
  const email = 'john.doe@example.net';
  const emailAuthenticationMethod = domainBuilder.buildAuthenticationMethod({
    authenticationComplement: {
      password,
      shouldChangePassword: false,
    },
  });
  const user = domainBuilder.buildUser({
    email,
    authenticationMethods: [emailAuthenticationMethod],
  });

  authenticationService.getUserByUsernameAndPassword.withArgs({
    username: email,
    password,
    userRepository,
  }).resolves(user);

  return {
    authenticationService,
    user,
  };
}

function createUserWithValidCredentialsWhoShouldChangePassword({
  oneTimePassword = 'Azerty123*',
  authenticationService,
  userRepository,
}) {
  const email = 'john.doe@example.net';
  const emailAuthenticationMethod = domainBuilder.buildAuthenticationMethod.buildWithHashedPassword({
    hashedPassword: oneTimePassword,
    shouldChangePassword: true,
  });

  const user = domainBuilder.buildUser({
    email,
    authenticationMethods: [emailAuthenticationMethod],
  });

  authenticationService.getUserByUsernameAndPassword.withArgs({
    username: email,
    password: oneTimePassword,
    userRepository,
  }).resolves(user);

  return {
    authenticationService,
    user,
  };
}

function createValidConditionsForAddingGarAuthenticationMethod({
  user,
  externalUserToken,
  samlId = 'samlId',
  tokenService,
  userRepository,
  authenticationMethodRepository,
}) {
  tokenService.extractSamlId.withArgs(externalUserToken).returns(samlId);
  userRepository.getBySamlId.withArgs(samlId).resolves(user);
  authenticationMethodRepository.create.resolves();
}
