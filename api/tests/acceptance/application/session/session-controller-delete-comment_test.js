import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper';

import createServer from '../../../../server';

describe('Acceptance | Controller | sessions-controller', function () {
  describe('DELETE /sessions/{id}/comment', function () {
    it('should respond with 204', async function () {
      // given
      const server = await createServer();
      await insertUserWithRoleSuperAdmin();
      const session = databaseBuilder.factory.buildSession();
      await databaseBuilder.commit();
      const options = {
        headers: {
          authorization: generateValidRequestAuthorizationHeader(),
        },
        method: 'DELETE',
        url: `/api/admin/sessions/${session.id}/comment`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
