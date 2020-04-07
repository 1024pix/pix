const { expect, generateValidRequestAuthorizationHeader, airtableBuilder, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');

describe('Acceptance | Controller | answer-controller-get-correction', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/answers/{id}/correction', function() {

    let assessment = null;
    let answer = null;
    let userId;

    before(() => {
      const challenge = airtableBuilder.factory.buildChallenge({
        id: 'q_first_challenge',
        statut: 'validé',
        competences: ['competence_id'],
        acquis: ['@web3'],
        bonnesReponses: 'fromage',
        acquix: ['q_first_acquis']
      });
      airtableBuilder.mockList({ tableName: 'Epreuves' }).returns([challenge]).activate();

      const skill = airtableBuilder.factory.buildSkill({
        id: 'q_first_acquis',
        nom: '@web3',
        indice: 'Indice web3',
        statutDeLIndice: 'Validé',
        compétenceViaTube: 'recABCD'
      });
      airtableBuilder.mockList({ tableName: 'Acquis' }).returns([skill]).activate();

      const tutorial = airtableBuilder.factory.buildTutorial();
      airtableBuilder.mockList({ tableName: 'Tutoriels' }).returns([tutorial]).activate();
    });

    after(() => {
      airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      assessment = databaseBuilder.factory.buildAssessment({
        courseId: 'adaptive_course_id',
        state: 'completed',
        userId
      });

      answer = databaseBuilder.factory.buildAnswer({
        value: 'any good answer',
        result: 'ok',
        challengeId: 'q_first_challenge',
        assessmentId: assessment.id
      });

      await databaseBuilder.commit();
    });

    it('should return the answer correction', async () => {
      // given
      const options = {
        method: 'GET',
        url: `/api/answers/${answer.id}/correction`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const expectedBody = {
        data: {
          id: 'q_first_challenge',
          type: 'corrections',
          attributes: {
            solution: 'fromage',
            hint: 'Indice web3',
          },
          relationships: {
            tutorials: {
              'data': [],
            },
            'learning-more-tutorials': {
              'data': [],
            }
          },
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedBody);
    });

    it('should return 404 when user does not has access to this answer', async () => {
      // given
      const options = {
        method: 'GET',
        url: `/api/answers/${answer.id}/correction`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId + 3) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return 404 when the answer id provided is not an integer', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/answers/coucou/correction',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });
});
