const { expect, generateValidRequestAuthorizationHeader, knex, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Acceptance | Controller | update-last-question-state', function () {
  let server;
  let assessment;
  let options;
  let newState;
  let user;

  beforeEach(async function () {
    server = await createServer();

    user = databaseBuilder.factory.buildUser();
    assessment = databaseBuilder.factory.buildAssessment({
      lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
      userId: user.id,
    });
    newState = 'timeout';
    options = {
      method: 'PATCH',
      url: `/api/assessments/${assessment.id}/last-challenge-state/${newState}`,
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };

    return databaseBuilder.commit();
  });

  describe('Resource access management', function () {
    it('should respond with a 401 if requested user is not the same as the user of the assessment', async function () {
      // given
      const otherUserId = 9999;
      options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('should respond with a 400 when the state is not correct', async function () {
      // given
      options.url = `/api/assessments/${assessment.id}/last-challenge-state/truc`;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('Success case', function () {
    it('should return a 204 status code', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should update the lastQuestionState in database', async function () {
      // when
      await server.inject(options);

      // then
      const result = await knex('assessments').select('lastQuestionState').where('id', assessment.id).first();
      expect(result.lastQuestionState).to.equal(newState);
    });
  });
});
