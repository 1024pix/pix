const {
  expect,
  databaseBuilder,
  knex,
  generateValidRequestAuthorizationHeader,
} = require('../../test-helper');
// eslint-disable-next-line no-restricted-modules
const createServer = require('../../../server');

describe('Acceptance | Controller | certification-report-controller', () => {

  describe('POST /api/certification-reports/{id}/certification-issue-reports', () => {

    afterEach(() => {
      return knex('certification-issue-reports').delete();
    });

    it('should return 201 HTTP status code', async () => {
      // given
      const server = await createServer();
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId }).id;
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ sessionId }).id;
      const request = {
        method: 'POST',
        url: `/api/certification-reports/${certificationCourseId}/certification-issue-reports`,
        payload: {
          data: {
            attributes: {
              category: 'OTHER',
              description: 'Houston nous avons un problème',
            },
            relationships: {
              'certification-report': {
                data: {
                  type: 'certification-reports',
                  id: 'CertificationReport:103836',
                },
              },
            },
            type: 'certification-issue-reports',
          },
        },
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };
      await databaseBuilder.commit();

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.type).to.equal('certification-issue-reports');
      expect(response.result.data.attributes.category).to.equal('OTHER');
      expect(response.result.data.attributes.description).to.equal('Houston nous avons un problème');
    });
  });
});
