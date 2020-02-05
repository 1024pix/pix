const { databaseBuilder, expect, generateValidRequestAuthorizationHeader, knex } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const createServer = require('../../../../server');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');

describe('Acceptance | Controller | assessment-controller-complete-assessment', () => {

  let options;
  let server;
  let user, assessment;

  beforeEach(async () => {
    server = await createServer();

    user = databaseBuilder.factory.buildUser({});
    assessment = databaseBuilder.factory.buildAssessment({
      userId: user.id, state: Assessment.states.STARTED
    });

    await databaseBuilder.commit();

    options = {
      method: 'PATCH',
      url: `/api/assessments/${assessment.id}/complete-assessment`,
      headers: {
        authorization: generateValidRequestAuthorizationHeader(user.id)
      },
    };
  });

  afterEach(async () => {
    await cache.flushAll();
    return knex('assessment-results').delete();
  });

  describe('PATCH /assessments/{id}/complete-assessment', () => {

    context('when user is not the owner of the assessment', () => {

      it('should return a 401 HTTP status code', async () => {
        // given
        options.headers.authorization = generateValidRequestAuthorizationHeader(user.id + 1);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

    });

    context('when user is the owner of the assessment', () => {

      it('should return the serialized completed assessment', async () => {
        // given
        const expectedResult = {
          data: {
            type: 'assessments',
            id: `${assessment.id}`,
            attributes: {
              title: undefined,
              type: null,
              state: 'completed',
              'certification-number': null,
              'competence-id': 'recCompetenceId',
            },
            relationships: {
              answers: { data: [] },
              course: {
                data: {
                  id: 'recDefaultCourseId',
                  type: 'courses',
                },
              },
            },
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedResult);
      });
    });
  });
});
