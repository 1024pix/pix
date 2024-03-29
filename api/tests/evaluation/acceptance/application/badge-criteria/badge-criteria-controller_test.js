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
      const { id: badgeCriterionId } = databaseBuilder.factory.buildBadgeCriterion({
        name: 'old name',
        threshold: 10,
      });
      await databaseBuilder.commit();

      const response = await server.inject({
        method: 'PATCH',
        url: `/api/admin/badge-criteria/${badgeCriterionId}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
        payload: {
          data: {
            type: 'badge-criteria',
            attributes: {
              name: 'brand new name',
              threshold: 99,
            },
          },
        },
      });

      // then
      const { id, name, threshold } = await knex('badge-criteria')
        .select(['id', 'name', 'threshold'])
        .where({ id: badgeCriterionId })
        .first();

      expect(id).to.equal(badgeCriterionId);
      expect(name).to.equal('brand new name');
      expect(threshold).to.equal(99);

      expect(response.statusCode).to.equal(204);
    });
  });
});
