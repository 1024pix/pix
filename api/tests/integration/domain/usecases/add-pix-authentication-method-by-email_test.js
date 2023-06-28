import { databaseBuilder, expect, catchErr } from '../../../test-helper.js';
import { addPixAuthenticationMethodByEmail } from '../../../../lib/shared/domain/usecases/add-pix-authentication-method-by-email.js';
import { AuthenticationMethodAlreadyExistsError } from '../../../../lib/shared/domain/errors.js';
import * as authenticationMethodRepository from '../../../../lib/shared/infrastructure/repositories/authentication-method-repository.js';
import * as userRepository from '../../../../lib/shared/infrastructure/repositories/user-repository.js';

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
