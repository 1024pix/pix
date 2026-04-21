import { createServer } from '../../../../../server.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Organizational Entities | Application | Route | Admin | AdministrationTeam', function () {
  describe('GET /api/admin/administration-teams', function () {
    it('returns a list of administration teams with 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const team1 = databaseBuilder.factory.buildAdministrationTeam({ name: 'Team1' });
      const team2 = databaseBuilder.factory.buildAdministrationTeam({ name: 'Team2' });
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/admin/administration-teams',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([
        {
          attributes: {
            name: team1.name,
          },
          id: team1.id.toString(),
          type: 'administration-teams',
        },
        {
          attributes: {
            name: team2.name,
          },
          id: team2.id.toString(),
          type: 'administration-teams',
        },
      ]);
    });
  });
});
