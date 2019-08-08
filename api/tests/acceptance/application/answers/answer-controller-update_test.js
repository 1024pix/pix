const { expect, databaseBuilder, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | answer-controller', () => {

  describe('PATCH /api/answers/:id', () => {

    let server;
    let options;

    beforeEach(async () => {
      const userId = 1;
      server = await createServer();
      const assessment = databaseBuilder.factory.buildAssessment({ userId, type: 'COMPETENCE_EVALUATION' });
      const answer = databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id, value: '1.2', result: 'ok', challengeId: 'rec1' });
      await databaseBuilder.commit();
      options = {
        method: 'PATCH',
        url: '/api/answers/' + answer.id,
        payload: {},
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
      };
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });
    
    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
