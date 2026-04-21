import { databaseBuilder } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Session Management | Acceptance | Application | Routes| jury-comment', function () {
  describe('PUT /api/admin/sessions/{sessionId}/comment', function () {
    it('should respond with 204', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const session = databaseBuilder.factory.buildSession();
      await databaseBuilder.commit();

      const options = {
        method: 'PUT',
        payload: {
          data: {
            attributes: {
              'jury-comment': 'Pour la carotte, le lapin est la parfaite incarnation du Mal.',
            },
          },
        },
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        url: `/api/admin/sessions/${session.id}/comment`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('DELETE /api/admin/sessions/{sessionId}/comment', function () {
    it('should respond with 204', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const session = databaseBuilder.factory.buildSession();
      await databaseBuilder.commit();

      const options = {
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
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
