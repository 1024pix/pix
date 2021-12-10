const { databaseBuilder, expect, generateValidRequestAuthorizationHeader, knex } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const createServer = require('../../../../server');

describe('Acceptance | Controller | assessment-controller-end-assessment-by-supervisor', function () {
  let options;
  let server;
  let user, assessment, certificationCourse;

  beforeEach(async function () {
    server = await createServer();

    user = databaseBuilder.factory.buildUser({});

    certificationCourse = databaseBuilder.factory.buildCertificationCourse();

    assessment = databaseBuilder.factory.buildAssessment({
      state: Assessment.states.STARTED,
      certificationCourseId: certificationCourse.id,
    });

    databaseBuilder.factory.buildSupervisorAccess({
      userId: user.id,
      sessionId: certificationCourse.sessionId,
    });

    await databaseBuilder.commit();

    options = {
      method: 'PATCH',
      url: `/api/assessments/${assessment.id}/end-assessment-by-supervisor`,
      headers: {
        authorization: generateValidRequestAuthorizationHeader(user.id),
      },
    };
  });

  afterEach(async function () {
    return knex('assessment-results').delete();
  });

  describe('PATCH /assessments/{id}/end-assessment-by-supervisor', function () {
    context('when user is not the supervisor of the assessment session', function () {
      it('should return a 401 HTTP status code', async function () {
        // given
        options.headers.authorization = generateValidRequestAuthorizationHeader(user.id + 1);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when user is the supervisor of the assessment session', function () {
      it('should end the assessment by supervisor ', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
