import { MissingOrInvalidCredentialsError } from '../../../../../src/identity-access-management/domain/errors.js';
import { authenticationSessionService } from '../../../../../src/identity-access-management/domain/services/authentication-session.service.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Domain | UseCase | findUserForOidcReconciliation', function () {
  context('when user exists', function () {
    const email = 'some_user@example.net';

    beforeEach(async function () {
      databaseBuilder.factory.buildUser.withRawPassword({ email });
      await databaseBuilder.commit();
    });

    context('when given password is wrong', function () {
      it('throws a MissingOrInvalidCredentialsError', async function () {
        // given
        const authenticationContent = {
          sessionContent: {},
          userInfo: {
            email,
            firstName: 'aFirstName',
            lastName: 'aLastName',
            externalIdentityId: 'some-user-unique-id',
          },
        };
        const authenticationKey = await authenticationSessionService.save(authenticationContent);

        const wrongPassword = 'a wrong password';

        // when & then
        await expect(
          usecases.findUserForOidcReconciliation({
            authenticationKey,
            email,
            password: wrongPassword,
            identityProvider: 'OIDC_EXAMPLE_NET',
          }),
        ).to.be.rejectedWith(MissingOrInvalidCredentialsError);
      });
    });
  });
});
