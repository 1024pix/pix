const {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
} = require('../../test-helper');
// eslint-disable-next-line no-restricted-modules
const createServer = require('../../../server');

describe('Acceptance | Controller | certification-issue-report-controller', () => {

  describe('DELETE /api/certification-issue-reports/{id}', () => {

    it('should return 204 HTTP status code', async () => {
      // given
      const server = await createServer();
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId }).id;
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ sessionId }).id;
      const certificationIssueReportId = databaseBuilder.factory.buildCertificationIssueReport({ certificationCourseId }).id;
      const request = {
        method: 'DELETE',
        url: `/api/certification-issue-reports/${certificationIssueReportId}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };
      await databaseBuilder.commit();

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
