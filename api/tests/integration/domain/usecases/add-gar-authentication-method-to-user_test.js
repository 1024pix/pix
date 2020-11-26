const { expect, catchErr, databaseBuilder, knex } = require('../../../test-helper');

const tokenService = require('../../../../lib/domain/services/token-service');
const { InvalidExternalUserTokenError, UnexpectedUserAccount } = require('../../../../lib/domain/errors');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

const { addGarAuthenticationMethodToUser } = require('../../../../lib/domain/usecases');

describe('Integration | UseCases | add-gar-authentication-method-to-user', () => {

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
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  context('when user exists', () => {

    afterEach(() => {
      return knex('authentication-methods').delete();
    });

    it('should create GAR authentication method for the user', async () => {
      // when
      await addGarAuthenticationMethodToUser({ userId, externalUserToken, expectedUserId: userId });

      // then
      const authenticationMethod = await knex('authentication-methods').where({ userId, identityProvider: AuthenticationMethod.identityProviders.GAR });
      expect(authenticationMethod[0].externalIdentifier).to.equal(expectedSamlId);
    });
  });

  context('when an error occurred', () => {

    it('should throw an InvalidExternalUserTokenError when externalUserToken is invalid', async () => {
      // given
      externalUserToken = 'INVALID_TOKEN';

      // when
      const error = await catchErr(addGarAuthenticationMethodToUser)({ userId, externalUserToken, expectedUserId: userId });

      // then
      expect(error).to.be.an.instanceof(InvalidExternalUserTokenError);
      expect(error.message).to.equal('Une erreur est survenue. Veuillez réessayer de vous connecter depuis le médiacentre.');
    });

    it('should throw an InvalidUserAccount error when the authenticated user is not the expected one', async () => {
      // given
      const notExpectedUserId = userId + 1;

      // when
      const error = await catchErr(addGarAuthenticationMethodToUser)({ notExpectedUserId, externalUserToken, expectedUserId: userId });

      // then
      expect(error).to.be.an.instanceof(UnexpectedUserAccount);
      expect(error.message).to.equal('Ce compte utilisateur n\'est pas celui qui est attendu.');
    });
  });

});
