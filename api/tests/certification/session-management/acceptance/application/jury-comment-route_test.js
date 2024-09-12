import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Certification | Session Management | Acceptance | Application | Routes| jury-comment', function () {
  describe('PUT /api/admin/sessions/{sessionId}/comment', function () {
    it('should respond with 204', async function () {
      // given
      const server = await createServer();
      await insertUserWithRoleSuperAdmin();
      const session = databaseBuilder.factory.buildSession();
      const options = {
        method: 'PUT',
        payload: {
          data: {
            attributes: {
              'jury-comment': 'Pour la carotte, le lapin est la parfaite incarnation du Mal.',
            },
          },
        },
        headers: {
          authorization: generateValidRequestAuthorizationHeader(),
        },
        url: `/api/admin/sessions/${session.id}/comment`,
      };
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
