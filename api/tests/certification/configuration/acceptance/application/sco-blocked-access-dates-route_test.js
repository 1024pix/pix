import { ScoOrganizationTagName } from '../../../../../src/certification/configuration/domain/models/ScoOrganizationTagName.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Configuration | Acceptance | API | sco-blocked-access-dates-route', function () {
  describe('PATCH /api/admin/sco-blocked-access-dates', function () {
    it('should return 200 HTTP status code when updating valid entry', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      databaseBuilder.factory.buildDefaultScoBlockedAccessDates();
      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: '/api/admin/sco-blocked-access-dates/LYCEE',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: { data: { attributes: { value: '2025-12-15' } } },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      const [updatedValue] = await knex('certification_sco_blocked_access_dates')
        .where({ scoOrganizationTagName: ScoOrganizationTagName.LYCEE })
        .pluck('reopeningDate');
      expect(updatedValue.toDateString()).to.equal(new Date('2025-12-15').toDateString());
    });
    it('should return 404 HTTP status code when updating invalid entry', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: '/api/admin/sco-blocked-access-dates/LYCEE',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: { data: { attributes: { value: '2025-12-15' } } },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });

  describe('GET /api/admin/sco-blocked-access-dates', function () {
    it('should return 200 HTTP status code and values', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const collegeReopeningDate = new Date('2025-10-23');
      const lyceeReopeningDate = new Date('2025-12-23');
      databaseBuilder.factory.buildCollegeScoBlockedAccessDate(collegeReopeningDate);
      databaseBuilder.factory.buildLyceeScoBlockedAccessDate(lyceeReopeningDate);
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/admin/sco-blocked-access-dates',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      const result = JSON.parse(response.payload);
      expect(result.data).to.deep.equal([
        {
          type: 'sco-blocked-access-dates',
          id: ScoOrganizationTagName.COLLEGE,
          attributes: {
            'reopening-date': collegeReopeningDate.toISOString(),
          },
        },
        {
          type: 'sco-blocked-access-dates',
          id: ScoOrganizationTagName.LYCEE,
          attributes: {
            'reopening-date': lyceeReopeningDate.toISOString(),
          },
        },
      ]);
    });
  });
});
