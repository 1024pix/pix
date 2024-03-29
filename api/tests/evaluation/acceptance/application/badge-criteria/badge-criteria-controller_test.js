import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../../test-helper.js';

describe('Acceptance | API | Badge Criteria', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PATCH /api/admin/badge-criteria/{badgeCriterionId}', function () {
    it('should update the badge criterion', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
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
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
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
