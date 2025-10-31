import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import {
  MissingOrInvalidCredentialsError,
  PasswordNotMatching,
  UserShouldChangePasswordError,
} from '../../../../../src/identity-access-management/domain/errors.js';
import { AuthenticationMethod } from '../../../../../src/identity-access-management/domain/models/AuthenticationMethod.js';
import { PasswordExpirationToken } from '../../../../../src/identity-access-management/domain/models/PasswordExpirationToken.js';
import { UserAccessToken } from '../../../../../src/identity-access-management/domain/models/UserAccessToken.js';
import { UserReconciliationSamlIdToken } from '../../../../../src/identity-access-management/domain/models/UserReconciliationSamlIdToken.js';
import { authenticateForSaml } from '../../../../../src/identity-access-management/domain/usecases/authenticate-for-saml.usecase.js';
import { RequestedApplication } from '../../../../../src/identity-access-management/infrastructure/utils/network.js';
import {
  UnexpectedUserAccountError,
  UserAlreadyExistsWithAuthenticationMethodError,
  UserNotFoundError,
} from '../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | authenticate-for-saml', function () {
  let lastUserApplicationConnectionsRepository;
  let pixAuthenticationService;
  let obfuscationService;
  let authenticationMethodRepository;
  let userRepository;
  let userLoginRepository;
  const audience = 'https://app.pix.fr';
  const requestedApplication = new RequestedApplication({ applicationName: 'app', applicationTld: '.fr' });

  beforeEach(function () {
    pixAuthenticationService = {
      getUserByUsernameAndPassword: sinon.stub(),
    };
    obfuscationService = {
      getUserAuthenticationMethodWithObfuscation: sinon.stub(),
    };
    lastUserApplicationConnectionsRepository = {
      upsert: sinon.stub(),
    };
    authenticationMethodRepository = {
      create: sinon.stub(),
      updateLastLoggedAtByIdentityProvider: sinon.stub(),
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
    it('resolves a valid JWT token when authentication succeeds (should not change password)', async function () {
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
        userRepository,
        authenticationMethodRepository,
      });

      const expectedToken = 'expected returned token';

      sinon
        .stub(UserAccessToken, 'generateSamlUserToken')
        .withArgs({ userId: user.id, audience })
        .returns({ accessToken: expectedToken });

      // when
      const token = await authenticateForSaml({
        username: user.email,
        password,
        externalUserToken,
        expectedUserId: user.id,
        audience,
        pixAuthenticationService,
        obfuscationService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
        lastUserApplicationConnectionsRepository,
        requestedApplication,
      });

      // then
      expect(token).to.be.deep.equal(expectedToken);
    });

    it('saves last login date when authentication succeeds', async function () {
      // given
      const clock = sinon.useFakeTimers({
        now: new Date(),
        toFake: ['Date'],
      });
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
        userRepository,
        authenticationMethodRepository,
      });

      const expectedToken = 'expected returned token';

      sinon
        .stub(UserAccessToken, 'generateSamlUserToken')
        .withArgs({ userId: user.id, audience })
        .returns({ accessToken: expectedToken });

      // when
      await authenticateForSaml({
        username: user.email,
        password,
        externalUserToken,
        expectedUserId: user.id,
        audience,
        pixAuthenticationService,
        obfuscationService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
        lastUserApplicationConnectionsRepository,
        requestedApplication,
      });

      // then
      expect(userLoginRepository.updateLastLoggedAt).to.have.been.calledWithExactly({ userId: user.id });
      expect(authenticationMethodRepository.updateLastLoggedAtByIdentityProvider).to.have.been.calledWithExactly({
        userId: user.id,
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
      });
      expect(lastUserApplicationConnectionsRepository.upsert).to.have.been.calledWithExactly({
        userId: user.id,
        application: requestedApplication.applicationName,
        lastLoggedAt: new Date(),
      });
      clock.restore();
    });

    it("throws an UnexpectedUserAccountError (with expected user's username or email) when the authenticated user does not match the expected one", async function () {
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
      const error = await catchErr(authenticateForSaml)({
        username: user.email,
        password,
        externalUserToken: 'an external user token',
        expectedUserId,
        pixAuthenticationService,
        obfuscationService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
        lastUserApplicationConnectionsRepository,
        requestedApplication,
      });

      // then
      expect(error).to.be.an.instanceof(UnexpectedUserAccountError);
      expect(error.message).to.equal("Ce compte utilisateur n'est pas celui qui est attendu.");
      expect(error.code).to.equal('UNEXPECTED_USER_ACCOUNT');
      expect(error.meta.value).to.equal(emailObfuscated);
    });

    context('when adding GAR authentication method', function () {
      it('throws an error if user from external user token is not the same as found user from credentials', async function () {
        // given
        const password = 'Azerty123*';
        const userFromCredentials = createUserWithValidCredentials({
          password,
          pixAuthenticationService,
          userRepository,
        });

        const externalUserToken = 'EXTERNAL_USER_TOKEN';
        const samlId = 'samlId';
        sinon.stub(UserReconciliationSamlIdToken, 'decode').withArgs(externalUserToken).returns({ samlId });

        const userFromExternalUserToken = domainBuilder.buildUser({ id: userFromCredentials.id + 1 });
        userRepository.getBySamlId.withArgs(samlId).resolves(userFromExternalUserToken);

        // when
        const error = await catchErr(authenticateForSaml)({
          username: userFromCredentials.email,
          password,
          externalUserToken: externalUserToken,
          expectedUserId: userFromCredentials.id,
          pixAuthenticationService,
          authenticationMethodRepository,
          userRepository,
          userLoginRepository,
          lastUserApplicationConnectionsRepository,
          requestedApplication,
        });

        // then
        expect(error).to.be.instanceOf(UserAlreadyExistsWithAuthenticationMethodError);
      });

      it('adds GAR authentication method', async function () {
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
          userRepository,
          authenticationMethodRepository,
        });

        // when
        await authenticateForSaml({
          username: user.email,
          password,
          externalUserToken,
          expectedUserId: user.id,
          pixAuthenticationService,
          authenticationMethodRepository,
          userRepository,
          userLoginRepository,
          lastUserApplicationConnectionsRepository,
          requestedApplication,
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
      it('adds GAR authentication method', async function () {
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
          userRepository,
          authenticationMethodRepository,
        });

        // when
        await catchErr(authenticateForSaml)({
          username: user.email,
          password: oneTimePassword,
          externalUserToken,
          expectedUserId: user.id,
          pixAuthenticationService,
          authenticationMethodRepository,
          userRepository,
          userLoginRepository,
          lastUserApplicationConnectionsRepository,
          requestedApplication,
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

      it('creates and return password reset token', async function () {
        // given
        sinon.stub(PasswordExpirationToken, 'generate').returns('token');

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
          userRepository,
          authenticationMethodRepository,
        });

        // when
        const error = await catchErr(authenticateForSaml)({
          username: user.email,
          password: oneTimePassword,
          externalUserToken,
          expectedUserId: user.id,
          pixAuthenticationService,
          authenticationMethodRepository,
          userRepository,
          userLoginRepository,
          lastUserApplicationConnectionsRepository,
          requestedApplication,
        });

        // then
        expect(error).to.be.an.instanceOf(UserShouldChangePasswordError);
        expect(error.meta).to.equal('token');
      });
    });
  });

  context('when credentials are invalid', function () {
    it('rejects when user not found', async function () {
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
      const error = await catchErr(authenticateForSaml)({
        username: unknownUserEmail,
        password,
        pixAuthenticationService,
        userRepository,
        userLoginRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(MissingOrInvalidCredentialsError);
    });

    it('rejects when password does not match', async function () {
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
      const error = await catchErr(authenticateForSaml)({
        username: email,
        password: invalidPassword,
        pixAuthenticationService,
        userRepository,
        userLoginRepository,
        lastUserApplicationConnectionsRepository,
        requestedApplication,
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
  userRepository,
  authenticationMethodRepository,
  firstName = 'Hervé',
  lastName = 'Le Terrier',
}) {
  sinon
    .stub(UserReconciliationSamlIdToken, 'decode')
    .withArgs(externalUserToken)
    .returns({ samlId, firstName, lastName });
  userRepository.getBySamlId.withArgs(samlId).resolves(user);
  authenticationMethodRepository.create.resolves();
}
