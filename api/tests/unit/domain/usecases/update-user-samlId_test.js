const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');

const User = require('../../../../lib/domain/models/User');
const { UserNotFoundError, InvalidExternalUserTokenError } = require('../../../../lib/domain/errors');

const { updateUserSamlId } = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | update-user-samlId', () => {

  const userId = 10;
  const samlId = 'SAMLID';
  const externalUserToken = 'TOKEN';

  let tokenService;
  let userRepository;

  beforeEach(() => {
    tokenService = { extractSamlId: sinon.stub().returns(samlId) };
    userRepository = {
      getBySamlId: sinon.stub(),
      updateSamlId: sinon.stub(),
    };
  });

  context('when user exists', () => {

    it('should update user samlId', async () => {
      // given
      const expectedUser = domainBuilder.buildUser({ id: userId });
      expectedUser.samlId = samlId;
      userRepository.getBySamlId.resolves(expectedUser);
      userRepository.updateSamlId.resolves(expectedUser);

      // when
      const user = await updateUserSamlId({
        userId, externalUserToken, tokenService, userRepository,
      });

      // then
      expect(tokenService.extractSamlId).to.has.been.calledWith(externalUserToken);
      expect(userRepository.getBySamlId).to.has.been.calledWith(samlId);
      expect(userRepository.updateSamlId).to.has.been.calledWith({ userId, samlId });
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
        userId, externalUserToken, tokenService, userRepository,
      });

      // then
      expect(error).to.be.an.instanceof(UserNotFoundError);
    });

    it('should throw an InvalidExternalUserTokenError when externalUserToken is invalid', async () => {
      // given
      tokenService.extractSamlId.returns(null);

      // when
      const error = await catchErr(updateUserSamlId)({
        userId, externalUserToken, tokenService, userRepository,
      });

      // then
      expect(error).to.be.an.instanceof(InvalidExternalUserTokenError);
      expect(error.message).to.equal('Une erreur est survenue. Veuillez réessayer de vous connecter depuis le médiacentre.');
    });
  });

});
