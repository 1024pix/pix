const { databaseBuilder, expect, generateValidRequestAuhorizationHeader } = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-reset-competence-evaluation', () => {

  let options;
  let server;
  const userId = 5678;
  const competenceId = 1234;

  beforeEach(async () => {

    options = {
      method: 'PATCH',
      url: `/api/users/${userId}/competences/${competenceId}/reset`,
      payload: {},
      headers: {},
    };
    server = await createServer();
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

    describe('Precondition verification', () => {

      const competenceEvaluationId = 111;

      beforeEach(async () => {
        options.headers.authorization = generateValidRequestAuhorizationHeader(userId);

        databaseBuilder.factory.buildCompetenceEvaluation({
          id: competenceEvaluationId,
          userId,
          competenceId,
        });

        databaseBuilder.factory.buildKnowledgeElement({
          id: 1,
          userId,
          competenceId,
        });

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should respond with a 421 - precondition failed - if last knowledge element date is not old enough', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(421);
        });
      });
    });

    describe('Success case', () => {

      const competenceEvaluationId = 111;

      beforeEach(async () => {
        options.headers.authorization = generateValidRequestAuhorizationHeader(userId);

        databaseBuilder.factory.buildCompetenceEvaluation({
          id: competenceEvaluationId,
          userId,
          competenceId,
        });

        databaseBuilder.factory.buildKnowledgeElement({
          id: 1,
          userId,
          competenceId,
          createdAt: new Date('2018-02-15T15:15:52Z'),
        });

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
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
