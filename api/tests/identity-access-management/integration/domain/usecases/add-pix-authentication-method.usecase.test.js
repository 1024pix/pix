import { addPixAuthenticationMethod } from '../../../../../src/identity-access-management/domain/usecases/add-pix-authentication-method.usecase.js';
import * as authenticationMethodRepository from '../../../../../src/identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import * as userRepository from '../../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { AuthenticationMethodAlreadyExistsError } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Identity Access Management | Domain | UseCase | add-pix-authentication-method', function () {
  context('when user have already Pix authentication method', function () {
    it('does not create Pix authentication method', async function () {
      // given
      const email = 'newEmail@example.net';
      const userId = databaseBuilder.factory.buildUser({ email: 'user@email.net' }).id;
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(addPixAuthenticationMethod)({
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
