import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Controller | certification-issue-report-controller', function () {
  describe('DELETE /api/certification-issue-reports/{id}', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ sessionId }).id;
      const certificationIssueReportId = databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId,
      }).id;
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'DELETE',
        url: `/api/certification-issue-reports/${certificationIssueReportId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      });

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('PATCH /api/certification-issue-reports/{id}', function () {
    it('should resolve report and return 204 HTTP status code', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ sessionId }).id;
      const certificationIssueReportId = databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId,
      }).id;
      await databaseBuilder.commit();

      const request = {
        method: 'PATCH',
        url: `/api/certification-issue-reports/${certificationIssueReportId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            resolution: 'resolved',
          },
        },
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(204);
      const { resolution } = await knex
        .from('certification-issue-reports')
        .select('resolution')
        .where({ id: certificationIssueReportId })
        .first();
      expect(resolution).to.equal('resolved');
    });
  });
});
