import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../test-helper';

import createServer from '../../../../server';

describe('Acceptance | Controller | certification-issue-report-controller', function () {
  describe('DELETE /api/certification-issue-reports/{id}', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      const server = await createServer();
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
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      });

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('PATCH /api/certification-issue-reports/{id}', function () {
    it('should resolve report and return 204 HTTP status code', async function () {
      // given
      const server = await createServer();
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ sessionId }).id;
      const certificationIssueReportId = databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId,
      }).id;
      await databaseBuilder.commit();

      const request = {
        method: 'PATCH',
        url: `/api/certification-issue-reports/${certificationIssueReportId}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
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
