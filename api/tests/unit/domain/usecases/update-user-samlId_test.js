const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');

const User = require('../../../../lib/domain/models/User');
const { UserNotFoundError, InvalidExternalUserTokenError, UnexpectedUserAccount } = require('../../../../lib/domain/errors');

const { updateUserSamlId } = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | update-user-samlId', () => {

  const authenticatedUserId = 10;
  const samlId = 'SAMLID';
  const externalUserToken = 'TOKEN';
  const expectedUserId = 10;

  let tokenService;
  let userRepository;
  let obfuscationService;

  beforeEach(() => {
    tokenService = { extractSamlId: sinon.stub().returns(samlId) };
    userRepository = {
      getBySamlId: sinon.stub(),
      updateSamlId: sinon.stub(),
      getUserAuthenticationMethods: sinon.stub(),
    };
    obfuscationService = { getUserAuthenticationMethodWithObfuscation: sinon.stub() };
  });

  context('when user exists', () => {

    it('should update user samlId', async () => {
      // given
      const expectedUser = domainBuilder.buildUser({ id: authenticatedUserId, samlId });
      userRepository.getBySamlId.resolves(expectedUser);
      userRepository.updateSamlId.resolves(expectedUser);

      // when
      const user = await updateUserSamlId({
        userId: authenticatedUserId, externalUserToken, expectedUserId, tokenService, userRepository, obfuscationService,
      });

      // then
      expect(tokenService.extractSamlId).to.has.been.calledWith(externalUserToken);
      expect(userRepository.getBySamlId).to.has.been.calledWith(samlId);
      expect(userRepository.updateSamlId).to.has.been.calledWith({ userId: authenticatedUserId, samlId });
      expect(user).to.be.an.instanceOf(User);
      expect(user).to.be.equal(expectedUser);
    });
  });

  context('when an error occurred', () => {

    it('should throw an UserNotFoundError when user does not exist', async () => {
      // given
      userRepository.updateSamlId.rejects(new UserNotFoundError());

      // when
      const error = await catchErr(updateUserSamlId)({
        userId: authenticatedUserId, externalUserToken, expectedUserId, tokenService, userRepository, obfuscationService,
      });

      // then
      expect(error).to.be.an.instanceof(UserNotFoundError);
    });

    it('should throw an InvalidExternalUserTokenError when externalUserToken is invalid', async () => {
      // given
      tokenService.extractSamlId.returns(null);

      // when
      const error = await catchErr(updateUserSamlId)({
        userId: authenticatedUserId, externalUserToken, expectedUserId, tokenService, userRepository, obfuscationService,
      });

      // then
      expect(error).to.be.an.instanceof(InvalidExternalUserTokenError);
      expect(error.message).to.equal('Une erreur est survenue. Veuillez réessayer de vous connecter depuis le médiacentre.');
    });

    it('should throw an UnexpectedUserAccount when the authentified user does not match the expected one', async () => {
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
