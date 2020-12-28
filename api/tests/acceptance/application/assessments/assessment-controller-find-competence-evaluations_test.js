const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | API | assessment-controller-find-competence-evaluations', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/assessments/:id/competence-evaluations', () => {

    it('should return 200 HTTP status code', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
      const competenceEvaluationId = databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, userId }).id;
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: `/api/assessments/${assessmentId}/competence-evaluations`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].id).to.deep.equal(competenceEvaluationId.toString());
    });
  });
});
