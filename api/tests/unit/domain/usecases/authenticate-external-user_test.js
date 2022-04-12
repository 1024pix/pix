const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const authenticateExternalUser = require('../../../../lib/domain/usecases/authenticate-external-user');

const {
  MissingOrInvalidCredentialsError,
  UserNotFoundError,
  PasswordNotMatching,
  UserShouldChangePasswordError,
  UnexpectedUserAccountError,
  InvalidExternalUserTokenError,
  UserAlreadyExistsWithAuthenticationMethodError,
} = require('../../../../lib/domain/errors');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

describe('Unit | Application | UseCase | authenticate-external-user', function () {
  let tokenService;
  let authenticationService;
  let obfuscationService;
  let authenticationMethodRepository;
  let userRepository;

  beforeEach(function () {
    tokenService = {
      createAccessTokenForSaml: sinon.stub(),
      extractExternalUserFromIdToken: sinon.stub(),
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
      getForObfuscation: sinon.stub(),
      updateLastLoggedAt: sinon.stub(),
    };
  });

  context('when credentials are valid', function () {
    it('should resolve a valid JWT token when authentication succeeds (should not change password)', async function () {
      // given
      const password = 'Azerty123*';
      const user = createUserWithValidCredentials({
        password,
        authenticationService,
        userRepository,
      });

      const externalUserToken = 'external user token';
      _stubToEnableAddGarAuthenticationMethod({
        user,
        externalUserToken,
        tokenService,
        userRepository,
        authenticationMethodRepository,
      });

      const expectedToken = 'expected returned token';
      tokenService.createAccessTokenForSaml.withArgs(user.id).resolves(expectedToken);

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

    it('should save last login date when authentication succeeds', async function () {
      // given
      const password = 'Azerty123*';
      const user = createUserWithValidCredentials({
        password,
        authenticationService,
        userRepository,
      });

      const externalUserToken = 'external user token';
      _stubToEnableAddGarAuthenticationMethod({
        user,
        externalUserToken,
        tokenService,
        userRepository,
        authenticationMethodRepository,
      });

      const expectedToken = 'expected returned token';
      tokenService.createAccessTokenForSaml.withArgs(user.id).resolves(expectedToken);

      // when
      await authenticateExternalUser({
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
      expect(userRepository.updateLastLoggedAt).to.have.been.calledWith({ userId: user.id });
    });

    it("should throw an UnexpectedUserAccountError (with expected user's username or email) when the authenticated user does not match the expected one", async function () {
      // given
      const password = 'Azerty123*';
      const user = createUserWithValidCredentials({
        password,
        authenticationService,
        userRepository,
      });

      const emailObfuscated = 'j*****@e*****.n**';
      const authenticatedByAndValue = { value: emailObfuscated };

      const expectedUserId = user.id + 1;
      const expectedUser = domainBuilder.buildUser({ id: expectedUserId });
      obfuscationService.getUserAuthenticationMethodWithObfuscation
        .withArgs(expectedUser)
        .resolves(authenticatedByAndValue);

      userRepository.getForObfuscation.withArgs(expectedUserId).resolves(expectedUser);

      // when
      const error = await catchErr(authenticateExternalUser)({
        username: user.email,
        password,
        externalUserToken: 'an external user token',
        expectedUserId,
        tokenService,
        authenticationService,
        obfuscationService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceof(UnexpectedUserAccountError);
      expect(error.message).to.equal("Ce compte utilisateur n'est pas celui qui est attendu.");
      expect(error.code).to.equal('UNEXPECTED_USER_ACCOUNT');
      expect(error.meta.value).to.equal(emailObfuscated);
    });

    context('when adding GAR authentication method', function () {
      it('should throw an error if external user token is invalid', async function () {
        // given
        const password = 'Azerty123*';
        const user = createUserWithValidCredentials({
          password,
          authenticationService,
          userRepository,
        });

        const invalidExternalUserToken = 'INVALID_EXTERNAL_USER_TOKEN';
        tokenService.extractExternalUserFromIdToken.withArgs(invalidExternalUserToken).returns(null);

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

      it('should throw an error if user from external user token is not the same as found user from credentials', async function () {
        // given
        const password = 'Azerty123*';
        const userFromCredentials = createUserWithValidCredentials({
          password,
          authenticationService,
          userRepository,
        });

        const externalUserToken = 'EXTERNAL_USER_TOKEN';
        const samlId = 'samlId';
        tokenService.extractExternalUserFromIdToken.withArgs(externalUserToken).returns({ samlId });

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

      it('should add GAR authentication method', async function () {
        // given
        const password = 'Azerty123*';
        const user = createUserWithValidCredentials({
          password,
          authenticationService,
          userRepository,
        });

        const externalUserToken = 'external user token';
        const samlId = 'samlId';
        _stubToEnableAddGarAuthenticationMethod({
          user,
          externalUserToken,
          samlId,
          firstName: 'Hervé',
          lastName: 'Le Terrier',
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
          authenticationComplement: new AuthenticationMethod.GARAuthenticationComplement({
            firstName: 'Hervé',
            lastName: 'Le Terrier',
          }),
        });
        expect(authenticationMethodRepository.create).to.have.been.calledWith({
          authenticationMethod: expectedAuthenticationMethod,
        });
      });
    });

    context('when user should change password', function () {
      it('should also add GAR authentication method', async function () {
        // given
        const oneTimePassword = 'Azerty123*';
        const user = createUserWithValidCredentialsWhoShouldChangePassword({
          oneTimePassword,
          authenticationService,
          userRepository,
        });

        const externalUserToken = 'EXTERNAL_USER_TOKEN';
        const externalIdentifier = 'EXTERNAL_IDENTIFIER';
        _stubToEnableAddGarAuthenticationMethod({
          user,
          externalUserToken,
          samlId: externalIdentifier,
          firstName: 'Monique',
          lastName: 'Samoëns',
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
          authenticationComplement: new AuthenticationMethod.GARAuthenticationComplement({
            firstName: 'Monique',
            lastName: 'Samoëns',
          }),
        });
        expect(authenticationMethodRepository.create).to.have.been.calledWith({
          authenticationMethod: expectedAuthenticationMethod,
        });
      });

      it('should throw UserShouldChangePasswordError', async function () {
        // given
        const oneTimePassword = 'Azerty123*';
        const user = createUserWithValidCredentialsWhoShouldChangePassword({
          oneTimePassword,
          authenticationService,
          userRepository,
        });

        const externalUserToken = 'EXTERNAL_USER_TOKEN';
        const externalIdentifier = 'EXTERNAL_IDENTIFIER';
        _stubToEnableAddGarAuthenticationMethod({
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

  context('when credentials are invalid', function () {
    it('should reject when user not found', async function () {
      // given
      const unknownUserEmail = 'foo@example.net';
      const password = 'Azerty123*';

      authenticationService.getUserByUsernameAndPassword
        .withArgs({
          username: unknownUserEmail,
          password,
          userRepository,
        })
        .rejects(new UserNotFoundError());

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

    it('should reject when password does not match', async function () {
      // given
      const email = 'foo@example.net';
      const invalidPassword = 'oups123*';

      authenticationService.getUserByUsernameAndPassword
        .withArgs({
          username: email,
          password: invalidPassword,
          userRepository,
        })
        .rejects(new PasswordNotMatching());

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

function createUserWithValidCredentials({ password, authenticationService, userRepository }) {
  const userId = 1;
  const email = 'john.doe@example.net';
  const pixAuthenticationMethod = AuthenticationMethod.buildPixAuthenticationMethod({ password, userId });
  const user = domainBuilder.buildUser({
    id: userId,
    email,
    authenticationMethods: [pixAuthenticationMethod],
  });
  authenticationService.getUserByUsernameAndPassword
    .withArgs({
      username: email,
      password,
      userRepository,
    })
    .resolves(user);

  return user;
}

function createUserWithValidCredentialsWhoShouldChangePassword({
  oneTimePassword,
  authenticationService,
  userRepository,
}) {
  const email = 'john.doe@example.net';
  const emailAuthenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
    hashedPassword: oneTimePassword,
    shouldChangePassword: true,
  });

  const user = domainBuilder.buildUser({
    email,
    authenticationMethods: [emailAuthenticationMethod],
  });

  authenticationService.getUserByUsernameAndPassword
    .withArgs({
      username: email,
      password: oneTimePassword,
      userRepository,
    })
    .resolves(user);

  return user;
}

function _stubToEnableAddGarAuthenticationMethod({
  user,
  externalUserToken,
  samlId = 'samlId',
  tokenService,
  userRepository,
  authenticationMethodRepository,
  firstName = 'Hervé',
  lastName = 'Le Terrier',
}) {
  tokenService.extractExternalUserFromIdToken.withArgs(externalUserToken).returns({ samlId, firstName, lastName });
  userRepository.getBySamlId.withArgs(samlId).resolves(user);
  authenticationMethodRepository.create.resolves();
}
