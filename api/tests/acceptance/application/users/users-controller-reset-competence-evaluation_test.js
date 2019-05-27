const { databaseBuilder, expect, generateValidRequestAuhorizationHeader } = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-reset-competence-evaluation', () => {

  let options;
  let server;
  const userId = 1234;
  const competenceId = 5678;

  beforeEach(async () => {

    options = {
      method: 'PATCH',
      url: `/api/users/${userId}/competences/${competenceId}/reset`,
      payload: {},
      headers: {},
    };
    server = await createServer();
  });

  afterEach(async () => {
    await databaseBuilder.clean();
  });

  describe('GET /users/:id/competences/:id/reset', () => {

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });

    describe('Success case', () => {

      const competenceEvaluationId = 111;

      beforeEach(async () => {
        options.headers.authorization = generateValidRequestAuhorizationHeader();

        databaseBuilder.factory.buildCompetenceEvaluation({
          id: competenceEvaluationId,
          userId,
          competenceId,
        });

        await databaseBuilder.commit();
      });

      it('should return 204', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
        expect(response.result).to.be.null;
      });
    });
  });
});
