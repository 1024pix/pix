import { createServer } from '../../../../../server.js';

import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | API | Badge Criteria', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PATCH /api/admin/badge-criteria/{badgeCriterionId}', function () {
    it('should update the badge criterion', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const initialBadgeCriterion = databaseBuilder.factory.buildBadgeCriterion({
        name: 'old name',
        threshold: 10,
      });
      await databaseBuilder.commit();

      const attributesToUpdate = {
        name: 'brand new name',
        threshold: 99,
      };

      const response = await server.inject({
        method: 'PATCH',
        url: `/api/admin/badge-criteria/${initialBadgeCriterion.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            type: 'badge-criteria',
            attributes: attributesToUpdate,
            relationships: {
              badge: {
                data: {
                  type: 'badges',
                  id: initialBadgeCriterion.badgeId,
                },
              },
            },
          },
        },
      });

      // then
      const updatedBadgeCriterion = await knex('badge-criteria')
        .select('*')
        .where({ id: initialBadgeCriterion.id })
        .first();

      expect(updatedBadgeCriterion).to.deep.equal({
        ...initialBadgeCriterion,
        ...attributesToUpdate,
      });

      expect(response.statusCode).to.equal(204);
    });
  });
});
