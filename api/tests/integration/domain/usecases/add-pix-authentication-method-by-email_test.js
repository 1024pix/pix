import { databaseBuilder, expect, catchErr } from '../../../test-helper';
import addPixAuthenticationMethodByEmail from '../../../../lib/domain/usecases/add-pix-authentication-method-by-email';
import { AuthenticationMethodAlreadyExistsError } from '../../../../lib/domain/errors';
import authenticationMethodRepository from '../../../../lib/infrastructure/repositories/authentication-method-repository';
import userRepository from '../../../../lib/infrastructure/repositories/user-repository';

describe('Integration | UseCase | add-pix-authentication-method-by-email', function () {
  context('when user have already Pix authentication method', function () {
    it('should not create Pix authentication method', async function () {
      // given
      const email = 'newEmail@example.net';
      const userId = databaseBuilder.factory.buildUser({ email: 'user@email.net' }).id;
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(addPixAuthenticationMethodByEmail)({
        userId,
        email,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationMethodAlreadyExistsError);
    });
  });
});
