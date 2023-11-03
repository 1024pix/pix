import {
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';

describe('Acceptance | Controller | Session | update-cpf-import-status-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PUT /api/admin/cpf/receipts', function () {
    it('should return an OK (200) status', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const options = {
        method: 'PUT',
        url: '/api/admin/cpf/receipts',
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    describe('when user cant access the session', function () {
      it('should respond with a 403', async function () {
        // when
        const options = {
          method: 'PUT',
          url: '/api/admin/cpf/receipts',
          headers: { authorization: generateValidRequestAuthorizationHeader(1) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
