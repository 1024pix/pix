const { expect, generateValidRequestAuthorizationHeader, airtableBuilder, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const { FRENCH_FRANCE } = require('../../../../lib/domain/constants').LOCALE;

describe('Acceptance | Controller | answer-controller-get-correction', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/answers/{id}/correction', function() {

    let assessment = null;
    let answer = null;
    let userId;
    let englishTutorial;
    let frenchTutorial;

    before(() => {
      const challenge = airtableBuilder.factory.buildChallenge({
        id: 'q_first_challenge',
        statut: 'validé',
        competences: ['competence_id'],
        acquis: ['@web3'],
        bonnesReponses: 'fromage',
        acquix: ['q_first_acquis'],
      });
      airtableBuilder.mockList({ tableName: 'Epreuves' }).returns([challenge]).activate();

      englishTutorial = airtableBuilder.factory.buildTutorial({ id: 'english-tutorial-id', langue: 'en-us' });
      frenchTutorial = airtableBuilder.factory.buildTutorial({ id: 'french-tutorial-id', langue: 'fr-fr' });
      airtableBuilder.mockList({ tableName: 'Tutoriels' }).returns([englishTutorial, frenchTutorial]).activate();

      const skill = airtableBuilder.factory.buildSkill({
        id: 'q_first_acquis',
        nom: '@web3',
        indiceFr: 'Geolocaliser ?',
        indiceEn: 'Geolocate ?',
        statutDeLIndice: 'Validé',
        compétenceViaTube: 'recABCD',
        comprendre: [englishTutorial.id, frenchTutorial.id],
        enSavoirPlus: [],
      });
      airtableBuilder.mockList({ tableName: 'Acquis' }).returns([skill]).activate();
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
        userId,
      });

      answer = databaseBuilder.factory.buildAnswer({
        value: 'any good answer',
        result: 'ok',
        challengeId: 'q_first_challenge',
        assessmentId: assessment.id,
      });

      await databaseBuilder.commit();
    });

    context('when Accept-Language header is specified', () => {
      it('should return the answer correction with tutorials restricted to given language', async () => {
        // given
        const options = {
          method: 'GET',
          url: `/api/answers/${answer.id}/correction`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
            'accept-language': FRENCH_FRANCE,
          },
        };

        const expectedBody = {
          data: {
            id: 'q_first_challenge',
            type: 'corrections',
            attributes: {
              solution: 'fromage',
              hint: 'Geolocaliser ?',
            },
            relationships: {
              tutorials: {
                data: [{
                  id: frenchTutorial.id,
                  type: 'tutorials',
                }],
              },
              'learning-more-tutorials': {
                data: [],
              },
            },
          },
          included: [{
            attributes: {
              duration: '00:03:31',
              format: 'vidéo',
              id: 'french-tutorial-id',
              link: 'http://www.example.com/this-is-an-example.html',
              source: 'Source Example, Example',
              title: 'Communiquer',
            },
            id: 'french-tutorial-id',
            type: 'tutorials',
          }],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedBody);
      });
    });

    it('should return 404 when user does not have access to this answer', async () => {
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

