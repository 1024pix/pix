const { expect, catchErr, databaseBuilder } = require('../../../test-helper');

const tokenService = require('../../../../lib/domain/services/token-service');
const { UserNotFoundError, InvalidExternalUserTokenError } = require('../../../../lib/domain/errors');

const { updateUserSamlId } = require('../../../../lib/domain/usecases');

describe('Integration | UseCases | update-user-samlId', () => {

  const expectedSamlId = 'SAMLID';

  let externalUserToken;
  let userId;

  beforeEach(async () => {
    const userAttributes = {
      firstName: 'firstName',
      lastName: 'lastName',
      samlId: expectedSamlId,
    };
    externalUserToken = tokenService.createIdTokenForUserReconciliation(userAttributes);

    userId = databaseBuilder.factory.buildUser({ samlId: null }).id;
    await databaseBuilder.commit();
  });

  context('when user exists', () => {

    it('should update user samlId', async () => {
      // when
      const result = await updateUserSamlId({ userId, externalUserToken });

      // then
      expect(result).to.be.true;
    });
  });

  context('when an error occurred', () => {

    it('should throw an UserNotFoundError when user does not exist', async () => {
      // given
      userId = 1;

      // when
      const error = await catchErr(updateUserSamlId)({ userId, externalUserToken });

      // then
      expect(error).to.be.an.instanceof(UserNotFoundError);
    });

    it('should throw an InvalidExternalUserTokenError when externalUserToken is invalid', async () => {
      // given
      externalUserToken = 'INVALID_TOKEN';

      // when
      const error = await catchErr(updateUserSamlId)({ userId, externalUserToken });

      // then
      expect(error).to.be.an.instanceof(InvalidExternalUserTokenError);
      expect(error.message).to.equal('L’idToken de l’utilisateur externe est invalide.');
    });
  });

});
