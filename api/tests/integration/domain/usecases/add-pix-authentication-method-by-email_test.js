import { AuthenticationMethodAlreadyExistsError } from '../../../../lib/domain/errors.js';
import { addPixAuthenticationMethodByEmail } from '../../../../lib/domain/usecases/add-pix-authentication-method-by-email.js';
import * as authenticationMethodRepository from '../../../../src/shared/infrastructure/repositories/authentication-method-repository.js';
import * as userRepository from '../../../../src/shared/infrastructure/repositories/user-repository.js';
import { catchErr, databaseBuilder, expect } from '../../../test-helper.js';

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
