const { expect, generateValidRequestAuthorizationHeader, nock, databaseBuilder } = require('../../../test-helper');
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
      nock('https://api.airtable.com')
        .get('/v0/test-base/Epreuves')
        .query(true)
        .times(2)
        .reply(200, {
          records: [{
            'id': 'q_first_challenge',
            'fields': {
              'id persistant': 'q_first_challenge',
              'Statut': 'validé',
              'competences': ['competence_id'],
              'acquis': ['@web3'],
              'Bonnes réponses': 'fromage',
              'Acquix (id persistant)': ['q_first_acquis']
            }
          }]
        });
      nock('https://api.airtable.com')
        .get('/v0/test-base/Acquis')
        .query(true)
        .times(2)
        .reply(200, {
          records: [{
            'id': 'q_first_acquis',
            'fields': {
              'id persistant': 'q_first_acquis',
              'Nom': '@web3',
              'Indice': 'Indice web3',
              'Statut de l\'indice': 'Validé',
              'Compétence (via Tube) (id persistant)': 'recABCD'
            }
          }]
        });
    });

    after(() => {
      nock.cleanAll();
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
