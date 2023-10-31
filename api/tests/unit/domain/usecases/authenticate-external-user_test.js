import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper.js';
import { authenticateExternalUser } from '../../../../lib/domain/usecases/authenticate-external-user.js';

import {
  UserNotFoundError,
  UnexpectedUserAccountError,
  UserAlreadyExistsWithAuthenticationMethodError,
} from '../../../../lib/domain/errors.js';

import { AuthenticationMethod } from '../../../../lib/domain/models/AuthenticationMethod.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../lib/domain/constants/identity-providers.js';
import {
  MissingOrInvalidCredentialsError,
  PasswordNotMatching,
  UserShouldChangePasswordError,
} from '../../../../src/access/shared/domain/errors.js';

describe('Unit | Application | UseCase | authenticate-external-user', function () {
  let tokenService;
  let pixAuthenticationService;
  let obfuscationService;
  let authenticationMethodRepository;
  let userRepository;
  let userLoginRepository;

  beforeEach(function () {
    tokenService = {
      createAccessTokenForSaml: sinon.stub(),
      extractExternalUserFromIdToken: sinon.stub(),
      createPasswordResetToken: sinon.stub(),
    };
    pixAuthenticationService = {
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
    };
    userLoginRepository = {
      updateLastLoggedAt: sinon.stub(),
    };
  });

  context('when credentials are valid', function () {
    it('should resolve a valid JWT token when authentication succeeds (should not change password)', async function () {
      // given
      const password = 'Azerty123*';
      const user = createUserWithValidCredentials({
        password,
        pixAuthenticationService,
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
        pixAuthenticationService,
        obfuscationService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
      });

      // then
      expect(token).to.be.deep.equal(expectedToken);
    });

    it('should save last login date when authentication succeeds', async function () {
      // given
      const password = 'Azerty123*';
      const user = createUserWithValidCredentials({
        password,
        pixAuthenticationService,
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
        pixAuthenticationService,
        obfuscationService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
      });

      // then
      expect(userLoginRepository.updateLastLoggedAt).to.have.been.calledWithExactly({ userId: user.id });
    });

    it("should throw an UnexpectedUserAccountError (with expected user's username or email) when the authenticated user does not match the expected one", async function () {
      // given
      const password = 'Azerty123*';
      const user = createUserWithValidCredentials({
        password,
        pixAuthenticationService,
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
        pixAuthenticationService,
        obfuscationService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
      });

      // then
      expect(error).to.be.an.instanceof(UnexpectedUserAccountError);
      expect(error.message).to.equal("Ce compte utilisateur n'est pas celui qui est attendu.");
      expect(error.code).to.equal('UNEXPECTED_USER_ACCOUNT');
      expect(error.meta.value).to.equal(emailObfuscated);
    });

    context('when adding GAR authentication method', function () {
      it('should throw an error if user from external user token is not the same as found user from credentials', async function () {
        // given
        const password = 'Azerty123*';
        const userFromCredentials = createUserWithValidCredentials({
          password,
          pixAuthenticationService,
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
          pixAuthenticationService,
          authenticationMethodRepository,
          userRepository,
          userLoginRepository,
        });

        // then
        expect(error).to.be.instanceOf(UserAlreadyExistsWithAuthenticationMethodError);
      });

      it('should add GAR authentication method', async function () {
        // given
        const password = 'Azerty123*';
        const user = createUserWithValidCredentials({
          password,
          pixAuthenticationService,
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
          pixAuthenticationService,
          authenticationMethodRepository,
          userRepository,
          userLoginRepository,
        });

        // then
        const expectedAuthenticationMethod = new AuthenticationMethod({
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
          externalIdentifier: samlId,
          userId: user.id,
          authenticationComplement: new AuthenticationMethod.GARAuthenticationComplement({
            firstName: 'Hervé',
            lastName: 'Le Terrier',
          }),
        });
        expect(authenticationMethodRepository.create).to.have.been.calledWithExactly({
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
          pixAuthenticationService,
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
          pixAuthenticationService,
          authenticationMethodRepository,
          userRepository,
          userLoginRepository,
        });

        // then
        const expectedAuthenticationMethod = new AuthenticationMethod({
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
          externalIdentifier,
          userId: user.id,
          authenticationComplement: new AuthenticationMethod.GARAuthenticationComplement({
            firstName: 'Monique',
            lastName: 'Samoëns',
          }),
        });
        expect(authenticationMethodRepository.create).to.have.been.calledWithExactly({
          authenticationMethod: expectedAuthenticationMethod,
        });
      });

      it('should create and return password reset token', async function () {
        // given
        tokenService.createPasswordResetToken.returns('token');
        const oneTimePassword = 'Azerty123*';
        const user = createUserWithValidCredentialsWhoShouldChangePassword({
          oneTimePassword,
          pixAuthenticationService,
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
          pixAuthenticationService,
          authenticationMethodRepository,
          userRepository,
          userLoginRepository,
        });

        // then
        expect(error).to.be.an.instanceOf(UserShouldChangePasswordError);
        expect(error.message).to.equal('Erreur, vous devez changer votre mot de passe.');
        expect(error.meta).to.equal('token');
      });
    });
  });

  context('when credentials are invalid', function () {
    it('should reject when user not found', async function () {
      // given
      const unknownUserEmail = 'foo@example.net';
      const password = 'Azerty123*';

      pixAuthenticationService.getUserByUsernameAndPassword
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
        pixAuthenticationService,
        userRepository,
        userLoginRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(MissingOrInvalidCredentialsError);
    });

    it('should reject when password does not match', async function () {
      // given
      const email = 'foo@example.net';
      const invalidPassword = 'oups123*';

      pixAuthenticationService.getUserByUsernameAndPassword
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
        pixAuthenticationService,
        userRepository,
        userLoginRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(MissingOrInvalidCredentialsError);
    });
  });
});

function createUserWithValidCredentials({ password, pixAuthenticationService, userRepository }) {
  const userId = 1;
  const email = 'john.doe@example.net';
  const pixAuthenticationMethod = AuthenticationMethod.buildPixAuthenticationMethod({ password, userId });
  const user = domainBuilder.buildUser({
    id: userId,
    email,
    authenticationMethods: [pixAuthenticationMethod],
  });
  pixAuthenticationService.getUserByUsernameAndPassword
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
  pixAuthenticationService,
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

  pixAuthenticationService.getUserByUsernameAndPassword
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
