const { expect, databaseBuilder, knex, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | certification-report-controller-save-certification-issue-report', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });


  afterEach(async () => {
    await knex('certification-issue-reports').delete();
  });

  describe('POST /api/certification-reports/{id}/certification-issue-reports', function() {

    it('should return 201 HTTP status code', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
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
                  id: 'CertificationReport:103836'
                }
              }
            },
            type: 'certification-issue-reports',
          }
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      await databaseBuilder.commit();

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

});
