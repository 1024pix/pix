import { userEmailRepository } from '../../../../src/identity-access-management/infrastructure/repositories/user-email.repository.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../test-helper.js';

describe('Acceptance | Route | Users', function () {
  describe('POST /api/users/{id}/update-email', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await createServer();

      const code = '999999';
      const newEmail = 'judy.new_email@example.net';
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        email: 'judy.howl@example.net',
      });
      await databaseBuilder.commit();

      await userEmailRepository.saveEmailModificationDemand({ userId: user.id, code, newEmail });

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            code,
          },
        },
      };

      const options = {
        method: 'POST',
        url: `/api/users/${user.id}/update-email`,
        payload,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(user.id),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
