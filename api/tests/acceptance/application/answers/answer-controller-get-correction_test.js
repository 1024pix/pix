import {
  expect,
  generateValidRequestAuthorizationHeader,
  databaseBuilder,
  mockLearningContent,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';
import { LOCALE } from '../../../../src/shared/domain/constants.js';

const { FRENCH_FRANCE } = LOCALE;

const buildOptions = (answerId, userId) => ({
  method: 'GET',
  url: `/api/answers/${answerId}/correction`,
  headers: {
    authorization: generateValidRequestAuthorizationHeader(userId),
    'accept-language': FRENCH_FRANCE,
  },
});
const solution =
  'l1:\n- chien\n- chat\n- cochon\nl2:\n- pigeon\n- poulet\n- veau\nl3:\n- canard\n- couincouin\nl4:\n- mouton';

const buildExpectedBody = (answersEvaluation, solutionsWithoutGoodAnswers) => ({
  data: {
    attributes: {
      hint: 'Animaux ?',
      solution,
      'solution-to-display': 'Des animaux rigolos',
      'answers-evaluation': answersEvaluation,
      'solutions-without-good-answers': solutionsWithoutGoodAnswers,
    },
    id: 'q_second_challenge',
    relationships: {
      'learning-more-tutorials': {
        data: [],
      },
      tutorials: {
        data: [
          {
            id: 'french-tutorial-id',
            type: 'tutorials',
          },
        ],
      },
    },
    type: 'corrections',
  },
  included: [
    {
      attributes: {
        id: 10002,
        status: 'LIKED',
        'tutorial-id': 'french-tutorial-id',
        'user-id': 111,
      },
      id: '10002',
      type: 'tutorial-evaluation',
    },
    {
      attributes: {
        id: 10001,
        'tutorial-id': 'french-tutorial-id',
        'user-id': 111,
      },
      id: '10001',
      type: 'user-saved-tutorial',
    },
    {
      attributes: {
        duration: '00:03:31',
        format: 'vidéo',
        id: 'french-tutorial-id',
        link: 'http://www.example.com/this-is-an-example.html',
        'skill-id': 'q_first_acquis',
        source: 'Source Example, Example',
        title: 'Communiquer',
      },
      id: 'french-tutorial-id',
      relationships: {
        'tutorial-evaluation': {
          data: {
            id: '10002',
            type: 'tutorial-evaluation',
          },
        },
        'user-saved-tutorial': {
          data: {
            id: '10001',
            type: 'user-saved-tutorial',
          },
        },
      },
      type: 'tutorials',
    },
  ],
});

const learningContent = {
  challenges: [
    {
      id: 'q_first_challenge',
      status: 'validé',
      competenceId: 'competence_id',
      solution: 'fromage',
      solutionToDisplay: 'camembert',
      skillId: 'q_first_acquis',
      type: 'QCM',
    },
    {
      id: 'q_second_challenge',
      status: 'validé',
      competenceId: 'competence_id',
      solution: solution,
      solutionToDisplay: 'Des animaux rigolos',
      skillId: 'q_first_acquis',
      type: 'QROCM-dep',
    },
  ],
  tutorials: [
    {
      id: 'english-tutorial-id',
      locale: 'en-us',
      duration: '00:00:54',
      format: 'video',
      link: 'https://tuto.com',
      source: 'tuto.com',
      title: 'tuto1',
    },
    {
      id: 'french-tutorial-id',
      locale: 'fr-fr',
      duration: '00:03:31',
      format: 'vidéo',
      link: 'http://www.example.com/this-is-an-example.html',
      source: 'Source Example, Example',
      title: 'Communiquer',
    },
  ],
  skills: [
    {
      id: 'q_first_acquis',
      name: '@web3',
      hint_i18n: {
        fr: 'Animaux ?',
        en: 'Animals ?',
      },
      hintStatus: 'Validé',
      competenceId: 'recABCD',
      tutorialIds: ['english-tutorial-id', 'french-tutorial-id'],
      learningMoreTutorialIds: [],
    },
  ],
};

describe('Acceptance | Controller | answer-controller-get-correction', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/answers/{id}/correction', function () {
    let assessment = null;
    let answer = null;
    let userId;
    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser({ id: 111 }).id;
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
      databaseBuilder.factory.buildUserSavedTutorial({
        id: 10001,
        userId,
        tutorialId: 'french-tutorial-id',
      });
      databaseBuilder.factory.buildTutorialEvaluation({
        id: 10002,
        userId,
        tutorialId: 'french-tutorial-id',
      });
      await databaseBuilder.commit();
      mockLearningContent(learningContent);
    });

    context('when Accept-Language header is specified', function () {
      it('should return the answer correction with tutorials restricted to given language', async function () {
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
              'answers-evaluation': [],
              solution: 'fromage',
              'solution-to-display': 'camembert',
              'solutions-without-good-answers': [],
              hint: 'Animaux ?',
            },
            relationships: {
              tutorials: {
                data: [
                  {
                    id: 'french-tutorial-id',
                    type: 'tutorials',
                  },
                ],
              },
              'learning-more-tutorials': {
                data: [],
              },
            },
          },
          included: [
            {
              attributes: {
                id: 10002,
                status: 'LIKED',
                'tutorial-id': 'french-tutorial-id',
                'user-id': 111,
              },
              id: '10002',
              type: 'tutorial-evaluation',
            },
            {
              attributes: {
                id: 10001,
                'tutorial-id': 'french-tutorial-id',
                'user-id': 111,
              },
              id: '10001',
              type: 'user-saved-tutorial',
            },
            {
              attributes: {
                duration: '00:03:31',
                format: 'vidéo',
                id: 'french-tutorial-id',
                link: 'http://www.example.com/this-is-an-example.html',
                'skill-id': 'q_first_acquis',
                source: 'Source Example, Example',
                title: 'Communiquer',
              },
              id: 'french-tutorial-id',
              type: 'tutorials',
              relationships: {
                'user-saved-tutorial': {
                  data: {
                    id: '10001',
                    type: 'user-saved-tutorial',
                  },
                },
                'tutorial-evaluation': {
                  data: {
                    id: '10002',
                    type: 'tutorial-evaluation',
                  },
                },
              },
            },
          ],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedBody);
      });
    });

    context('when challenge is a QROCM-dep type', function () {
      context('when the answer is valid', function () {
        it('should return expected correction block', async function () {
          // given
          answer = databaseBuilder.factory.buildAnswer({
            value: 'l1: cochon \nl2: pigeon',
            result: 'ok',
            challengeId: 'q_second_challenge',
            assessmentId: assessment.id,
          });
          await databaseBuilder.commit();
          // when
          const response = await server.inject(buildOptions(answer.id, userId));
          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.equal(buildExpectedBody([true, true], []));
        });
      });

      context('when the answer is false', function () {
        it('should return expected correction block', async function () {
          // given
          answer = databaseBuilder.factory.buildAnswer({
            value: 'l1: certainement_pas_une_bonne_réponse \nl2: chien',
            result: 'ko',
            challengeId: 'q_second_challenge',
            assessmentId: assessment.id,
          });

          await databaseBuilder.commit();
          const expectedBody = buildExpectedBody([false, true], ['pigeon', 'canard', 'mouton']);
          // when
          const response = await server.inject(buildOptions(answer.id, userId));
          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.equal(expectedBody);
        });
      });

      context('when the answer is skipped', function () {
        it('should return expected correction block', async function () {
          // given
          answer = databaseBuilder.factory.buildAnswer({
            value: '#ABAND#',
            result: 'ko',
            challengeId: 'q_second_challenge',
            assessmentId: assessment.id,
          });
          await databaseBuilder.commit();
          const expectedBody = buildExpectedBody([], []);
          // when
          const response = await server.inject(buildOptions(answer.id, userId));
          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.equal(expectedBody);
        });
      });
    });

    it('should return 404 when user does not have access to this answer', async function () {
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

    it('should return 404 when the answer id provided is not an integer', async function () {
      // given
      const options = {
        method: 'GET',
        url: '/api/answers/1/correction',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });
});
