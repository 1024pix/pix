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
      createAccessTokenFromUser: sinon.stub(),
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
      const expectedToken = Symbol();
      const userId = 1;
      const source = 'external';
      const samlId = 'samlId';
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

      tokenService.extractSamlId.returns(samlId);
      userRepository.getBySamlId.withArgs(samlId).resolves(user);
      authenticationMethodRepository.create.resolves();

      // when
      const token = await authenticateExternalUser({
        username: email,
        password,
        expectedUserId: userId,
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
      const userId = 1;
      const email = 'john.doe@example.net';
      const emailObfusced = 'j*****@e*****.n**';
      const externalUserToken = 'EXTERNAL_USER_TOKEN';
      const expectedUserId = 7;
      const password = 'a password';

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

      const authenticatedByAndValue = { value: emailObfusced };
      obfuscationService.getUserAuthenticationMethodWithObfuscation
        .withArgs(user)
        .resolves(authenticatedByAndValue);

      // when
      const error = await catchErr(authenticateExternalUser)({
        username: email,
        password,
        externalUserToken,
        expectedUserId,
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
        const userId = 1;
        const email = 'john.doe@example.net';
        const password = 'Azerty123*';
        const invalidExternalUserToken = 'INVALID_EXTERNAL_USER_TOKEN';

        const emailAuthenticationMethod = domainBuilder.buildAuthenticationMethod.buildWithHashedPassword({
          hashedPassword: password,
          shouldChangePassword: false,
        });

        const user = domainBuilder.buildUser({
          id: userId,
          email,
          authenticationMethods: [emailAuthenticationMethod],
        });

        authenticationService.getUserByUsernameAndPassword.withArgs({
          username: email,
          password: password,
          userRepository,
        }).resolves(user);

        tokenService.extractSamlId.withArgs(invalidExternalUserToken).returns(null);

        // when
        const error = await catchErr(authenticateExternalUser)({
          username: email,
          password,
          externalUserToken: invalidExternalUserToken,
          expectedUserId: userId,
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
        const userId = 1;
        const email = 'john.doe@example.net';
        const password = 'Azerty123*';
        const externalUserToken = 'EXTERNAL_USER_TOKEN';
        const samlId = Symbol('samlId');

        const emailAuthenticationMethod = domainBuilder.buildAuthenticationMethod.buildWithHashedPassword({
          hashedPassword: password,
          shouldChangePassword: false,
        });
        const userFromCredentials = domainBuilder.buildUser({
          id: userId,
          email,
          authenticationMethods: [emailAuthenticationMethod],
        });
        authenticationService.getUserByUsernameAndPassword.withArgs({
          username: email,
          password: password,
          userRepository,
        }).resolves(userFromCredentials);

        tokenService.extractSamlId.withArgs(externalUserToken).returns(samlId);

        const userFromExternalUserToken = domainBuilder.buildUser({ id: userId + 1 });
        userRepository.getBySamlId.withArgs(samlId).resolves(userFromExternalUserToken);

        // when
        const error = await catchErr(authenticateExternalUser)({
          username: email,
          password,
          externalUserToken: externalUserToken,
          expectedUserId: userId,
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
        const userId = 1;
        const email = 'john.doe@example.net';
        const password = 'Azerty123*';
        const externalIdentifier = 'EXTERNAL_IDENTIFIER';
        const externalUserToken = 'EXTERNAL_USER_TOKEN';

        const emailAuthenticationMethod = domainBuilder.buildAuthenticationMethod.buildWithHashedPassword({
          hashedPassword: password,
          shouldChangePassword: false,
        });

        const user = domainBuilder.buildUser({
          id: userId,
          email,
          authenticationMethods: [emailAuthenticationMethod],
        });

        authenticationService.getUserByUsernameAndPassword.withArgs({
          username: email,
          password: password,
          userRepository,
        }).resolves(user);

        tokenService.extractSamlId.withArgs(externalUserToken).returns(externalIdentifier);

        // when
        await authenticateExternalUser({
          username: email,
          password,
          externalUserToken,
          expectedUserId: userId,
          tokenService,
          authenticationService,
          authenticationMethodRepository,
          userRepository,
        });

        // then
        const expectedAuthenticationMethod = new AuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier,
          userId,
        });
        expect(authenticationMethodRepository.create).to.have.been.calledWith({ authenticationMethod: expectedAuthenticationMethod });
      });

    });

    context('when user should change password', () => {

      it('should also add GAR authentication method', async () => {
        // given
        const userId = 1;
        const email = 'john.doe@example.net';
        const oneTimePassword = 'Azerty123*';
        const externalIdentifier = 'EXTERNAL_IDENTIFIER';
        const externalUserToken = 'EXTERNAL_USER_TOKEN';

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

        tokenService.extractSamlId.withArgs(externalUserToken).returns(externalIdentifier);

        // when
        await catchErr(authenticateExternalUser)({
          username: email,
          password: oneTimePassword,
          externalUserToken,
          expectedUserId: userId,
          tokenService,
          authenticationService,
          authenticationMethodRepository,
          userRepository,
        });

        // then
        const expectedAuthenticationMethod = new AuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier,
          userId,
        });
        expect(authenticationMethodRepository.create).to.have.been.calledWith({ authenticationMethod: expectedAuthenticationMethod });
      });

      it('should throw UserShouldChangePasswordError', async () => {
        // given
        const userId = 1;
        const email = 'john.doe@example.net';
        const oneTimePassword = 'Azerty123*';
        const samlId = 'samlId';

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

        tokenService.extractSamlId.returns(samlId);
        userRepository.getBySamlId.withArgs(samlId).resolves(user);
        authenticationMethodRepository.create.resolves();

        // when
        const error = await catchErr(authenticateExternalUser)({
          username: email,
          password: oneTimePassword,
          expectedUserId: userId,
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
