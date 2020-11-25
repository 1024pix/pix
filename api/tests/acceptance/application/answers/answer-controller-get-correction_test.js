const { expect, generateValidRequestAuthorizationHeader, databaseBuilder, mockLearningContent } = require('../../../test-helper');
const createServer = require('../../../../server');
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
      
      const learningContent = {
        challenges: [{
          id: 'q_first_challenge',
          status: 'validé',
          competenceId: 'competence_id',
          skills: ['@web3'],
          solution: 'fromage',
          skillIds: ['q_first_acquis'],
        }],
        tutorials: [{
          id: 'english-tutorial-id',
          locale: 'en-us',
          duration: '00:00:54',
          format: 'video',
          link: 'https://tuto.com',
          source: 'tuto.com',
          title: 'tuto1',
        },{
          id: 'french-tutorial-id',
          locale: 'fr-fr',
          duration: '00:03:31',
          format: 'vidéo',
          link: 'http://www.example.com/this-is-an-example.html',
          source: 'Source Example, Example',
          title: 'Communiquer',
        }],
        skills: [{
          id: 'q_first_acquis',
          name: '@web3',
          hintFrFr: 'Geolocaliser ?',
          hintEnUs: 'Geolocate ?',
          hintStatus: 'Validé',
          competenceId: 'recABCD',
          tutorialIds: ['english-tutorial-id', 'french-tutorial-id'],
          learningMoreTutorialIds: [],
        }],
      };
      mockLearningContent(learningContent);
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
                  id: 'french-tutorial-id',
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

