const { databaseBuilder, expect, catchErr } = require('../../../test-helper');
const addPixAuthenticationMethodByEmail = require('../../../../lib/domain/usecases/add-pix-authentication-method-by-email');
const { AuthenticationMethodAlreadyExistsError } = require('../../../../lib/domain/errors');
const authenticationMethodRepository = require('../../../../lib/infrastructure/repositories/authentication-method-repository');

describe('Integration | UseCase | add-pix-authentication-method-by-email', function () {
  context('when user have already Pix authentication method', function () {
    it('should not create PIX authentication method', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ email: 'another@email.net' }).id;
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(addPixAuthenticationMethodByEmail)({
        userId,
        authenticationMethodRepository,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationMethodAlreadyExistsError);
    });
  });
});
