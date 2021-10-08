const { expect, databaseBuilder, knex, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | certification-report-controller', function () {
  let server, certificationCourseId, userId, sessionId, certificationCenterId;

  beforeEach(async function () {
    server = await createServer();
    userId = databaseBuilder.factory.buildUser().id;
    ({ id: sessionId, certificationCenterId } = databaseBuilder.factory.buildSession());
    databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
    certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
      sessionId,
      isPublished: false,
      maxReachableLevelOnCertificationDate: 3,
    }).id;

    return databaseBuilder.commit();
  });

  describe('POST /api/certification-reports/{id}/certification-issue-reports', function () {
    afterEach(function () {
      return knex('certification-issue-reports').delete();
    });

    it('should return 201 HTTP status code', async function () {
      // given
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

  describe('POST /api/certification-reports/${id}/abort', function () {
    it('should return 200 HTTP status code if certification course is updated', async function () {
      // given
      const options = {
        method: 'POST',
        url: `/api/certification-reports/${certificationCourseId}/abort`,
        payload: { data: { attributes: { 'abort-reason': 'technical' } } },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
