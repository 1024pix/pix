const { expect, sinon, catchErr } = require('../../../test-helper');

const User = require('../../../../lib/domain/models/User');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const { InvalidExternalUserTokenError, UnexpectedUserAccount } = require('../../../../lib/domain/errors');

const { updateUserSamlId } = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | update-user-samlId', () => {

  const authenticatedUserId = 10;
  const samlId = 'SAMLID';
  const externalUserToken = 'TOKEN';
  const expectedUserId = 10;

  let tokenService;
  let userRepository;
  let obfuscationService;
  let authenticationMethodRepository;

  beforeEach(() => {
    tokenService = { extractSamlId: sinon.stub().returns(samlId) };
    userRepository = {
      getBySamlId: sinon.stub(),
      getUserAuthenticationMethods: sinon.stub(),
    };
    authenticationMethodRepository = {
      create: sinon.stub(),
    };
    obfuscationService = { getUserAuthenticationMethodWithObfuscation: sinon.stub() };
  });

  context('when user exists', () => {

    it('should create a GAR authentication method for the user', async () => {
      // given
      userRepository.getBySamlId.resolves();
      authenticationMethodRepository.create.resolves();
      const expectedAuthenticationMethod = new AuthenticationMethod({
        identityProvider: AuthenticationMethod.identityProviders.GAR,
        externalIdentifier: samlId,
        userId: authenticatedUserId,
      });

      // when
      await updateUserSamlId({
        userId: authenticatedUserId, externalUserToken, expectedUserId, tokenService, userRepository, obfuscationService, authenticationMethodRepository,
      });

      // then
      expect(tokenService.extractSamlId).to.have.been.calledWith(externalUserToken);
      expect(userRepository.getBySamlId).to.have.been.calledWith(samlId);
      expect(authenticationMethodRepository.create).to.have.been.calledWith({ authenticationMethod: expectedAuthenticationMethod });
    });
  });

  context('when an error occurred', () => {

    it('should throw an InvalidExternalUserTokenError when externalUserToken is invalid', async () => {
      // given
      tokenService.extractSamlId.returns(null);

      // when
      const error = await catchErr(updateUserSamlId)({
        userId: authenticatedUserId, externalUserToken, expectedUserId, tokenService, userRepository, obfuscationService, authenticationMethodRepository,
      });

      // then
      expect(error).to.be.an.instanceof(InvalidExternalUserTokenError);
      expect(error.message).to.equal('Une erreur est survenue. Veuillez réessayer de vous connecter depuis le médiacentre.');
    });

    it('should throw an UnexpectedUserAccount when the authenticated user does not match the expected one', async () => {
      // given
      const unexpectedUserId = expectedUserId + 1;
      userRepository.getUserAuthenticationMethods.returns(new User());
      const expectedObfuscatedValue = 'ObfuscatedEmail';
      obfuscationService.getUserAuthenticationMethodWithObfuscation.returns({ value: expectedObfuscatedValue });

      // when
      const error = await catchErr(updateUserSamlId)({
        userId: unexpectedUserId, externalUserToken, expectedUserId, tokenService, userRepository, obfuscationService,
      });

      // then
      expect(error).to.be.an.instanceof(UnexpectedUserAccount);
      expect(error.message).to.equal('Ce compte utilisateur n\'est pas celui qui est attendu.');
      expect(error.code).to.equal('UNEXPECTED_USER_ACCOUNT');
      expect(error.meta.value).to.equal(expectedObfuscatedValue);
    });
  });

});
