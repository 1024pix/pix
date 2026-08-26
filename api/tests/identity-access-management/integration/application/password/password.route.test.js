import sinon from 'sinon';

import { identityAccessManagementRoutes } from '../../../../../src/identity-access-management/application/routes.js';
import { resetPasswordService } from '../../../../../src/identity-access-management/domain/services/reset-password.service.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { config } from '../../../../../src/shared/config.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

const routesUnderTest = identityAccessManagementRoutes[0];

describe('Integration | Identity Access Management | Application | Route | password', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(routesUnderTest);
    httpTestServer.setupAuthentication();
  });

  describe('POST /api/update-password', function () {
    context('when the user does not exist', function () {
      it('throws a UserNotFoundError', async function () {
        // given
        const temporaryKey = await resetPasswordService.generateTemporaryKey();
        const user = databaseBuilder.factory.buildUser();
        const email = user.email;
        await databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });

        await databaseBuilder.commit();

        const newPassword = 'example-of-a-new-valid-password-az-AZ-01234';

        const nonExistentUserId = 999999;

        const payload = {
          'user-id': nonExistentUserId,
          password: newPassword,
          'temporary-key': temporaryKey,
        };
        const url = '/api/update-password';

        // when
        const response = await httpTestServer.request('POST', url, payload, null);

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.result.errors[0].code).to.equal('USER_ACCOUNT_NOT_FOUND');
      });
    });

    context('when the password reset demand is expired', function () {
      it('throws an InvalidTemporaryKeyError', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const userId = user.id;
        const email = user.email;

        sinon.stub(config.passwordResetDemand, 'lifespan').value(0);
        const temporaryKey = await resetPasswordService.generateTemporaryKey();
        databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });

        await databaseBuilder.commit();

        const newPassword = 'example-of-a-new-password';

        const payload = {
          'user-id': userId,
          password: newPassword,
          'temporary-key': temporaryKey,
        };
        const url = '/api/update-password';

        // when
        const response = await httpTestServer.request('POST', url, payload, null);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when user has a revokedHashedPassword', function () {
      context('when the given password is the same as the previous password', function () {
        it('throws a RevokedPasswordCannotBeReusedError', async function () {
          // given
          const initialPassword = 'example-of-a-valid-password-az-AZ-01234';
          const temporaryKey = await resetPasswordService.generateTemporaryKey();
          const user = databaseBuilder.factory.buildUser.withRawPassword({ rawPassword: initialPassword });
          const userId = user.id;
          const email = user.email;

          await databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });

          await databaseBuilder.commit();

          await usecases.revokeAccessForUsers({ userIds: [userId] });

          const newPassword = initialPassword;
          const payload = {
            'user-id': userId,
            password: newPassword,
            'temporary-key': temporaryKey,
          };
          const url = '/api/update-password';

          // when
          const response = await httpTestServer.request('POST', url, payload, null);

          // then
          expect(response.statusCode).to.equal(403);
          expect(response.result.errors[0].code).to.equal('REVOKED_PASSWORD_CANNOT_BE_REUSED');
        });
      });
    });
  });
});
