import { expect, generateValidRequestAuthorizationHeader, databaseBuilder } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | API | assessment-controller-find-competence-evaluations', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/assessments/:id/competence-evaluations', function () {
    it('should return 200 HTTP status code', async function () {
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
