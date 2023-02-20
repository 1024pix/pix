import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  mockLearningContent,
  learningContentBuilder,
  knex,
} from '../../../test-helper';

import createServer from '../../../../server';
import Assessment from '../../../../lib/domain/models/Assessment';

const competenceId = 'recCompetence';
const skillWeb2Id = 'recAcquisWeb2';

const nonFocusedChallengeId = 'recFirstChallengeId';
const focusedChallengeId = 'recSecondChallengeId';
const anotherChallengeId = 'anotherChallengeId';

const learningContent = [
  {
    id: 'recArea1',
    title_i18n: {
      fr: 'area1_Title',
    },
    color: 'someColor',
    competences: [
      {
        id: competenceId,
        name_i18n: {
          fr: 'Mener une recherche et une veille d’information',
        },
        index: '1.1',
        tubes: [
          {
            id: 'recTube0_0',
            skills: [
              {
                id: skillWeb2Id,
                nom: '@web2',
                challenges: [
                  { id: nonFocusedChallengeId, alpha: 2.8, delta: 1.1, focusable: false, langues: ['Franco Français'] },
                  { id: focusedChallengeId, alpha: 2.8, delta: 1.1, focusable: true, langues: ['Franco Français'] },
                  { id: anotherChallengeId },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe('Acceptance | API | assessment-controller-update-last-challenge-state', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(learningContent);
    mockLearningContent(learningContentObjects);
  });

  describe('PATCH /api/assessments/{id}/last-challenge-state/{state}', function () {
    const assessmentId = 1;
    const userId = 1234;
    let user;
    let assessment;
    let newState;
    let options;

    context('Resource access management', function () {
      beforeEach(async function () {
        server = await createServer();

        user = databaseBuilder.factory.buildUser();
        assessment = databaseBuilder.factory.buildAssessment({
          lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
          userId: user.id,
        });
        newState = 'timeout';
        options = {
          method: 'PATCH',
          url: `/api/assessments/${assessment.id}/last-challenge-state/${newState}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        };

        return databaseBuilder.commit();
      });

      it('should respond with a 401 if requested user is not the same as the user of the assessment', async function () {
        // given
        const otherUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);
        options.payload = {};

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 400 when the state is not correct', async function () {
        // given
        options.url = `/api/assessments/${assessment.id}/last-challenge-state/truc`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when assessment lastQuestionState is not FOCUSEDOUT', function () {
      context('When current challenge is focused', function () {
        beforeEach(async function () {
          databaseBuilder.factory.buildUser({ id: userId });
          databaseBuilder.factory.buildAssessment({
            id: assessmentId,
            userId,
            lastQuestionDate: new Date('2020-01-20'),
            lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
            lastChallengeId: focusedChallengeId,
            state: 'started',
          });
          await databaseBuilder.commit();
        });

        it('should update assessment lastQuestionState if there is no payload', async function () {
          // given
          const state = 'focusedout';
          const options = {
            method: 'PATCH',
            url: `/api/assessments/${assessmentId}/last-challenge-state/${state}`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
            payload: {},
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
          const assessmentsInDb = await knex('assessments').where('id', assessmentId).first('lastQuestionState');
          expect(assessmentsInDb.lastQuestionState).to.deep.equal(Assessment.statesOfLastQuestion.FOCUSEDOUT);
        });

        it('should update assessment lastQuestionState', async function () {
          // given
          const state = 'focusedout';
          const payload = {
            data: {
              attributes: {
                'challenge-id': focusedChallengeId,
              },
            },
          };
          const options = {
            method: 'PATCH',
            url: `/api/assessments/${assessmentId}/last-challenge-state/${state}`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
            payload,
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
          const assessmentsInDb = await knex('assessments').where('id', assessmentId).first('lastQuestionState');
          expect(assessmentsInDb.lastQuestionState).to.deep.equal(Assessment.statesOfLastQuestion.FOCUSEDOUT);
        });
      });

      context('When current challenge is not focused', function () {
        beforeEach(async function () {
          databaseBuilder.factory.buildUser({ id: userId });
          databaseBuilder.factory.buildAssessment({
            id: assessmentId,
            userId,
            lastQuestionDate: new Date('2020-01-20'),
            lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
            lastChallengeId: nonFocusedChallengeId,
            state: 'started',
          });
          await databaseBuilder.commit();
        });

        it('should not update assessment lastQuestionState', async function () {
          // given
          const state = 'focusedout';
          const payload = {
            data: {
              attributes: {
                'challenge-id': nonFocusedChallengeId,
              },
            },
          };
          const options = {
            method: 'PATCH',
            url: `/api/assessments/${assessmentId}/last-challenge-state/${state}`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
            payload,
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
          const assessmentsInDb = await knex('assessments').where('id', assessmentId).first('lastQuestionState');
          expect(assessmentsInDb.lastQuestionState).to.deep.equal(Assessment.statesOfLastQuestion.ASKED);
        });
      });

      context('When current challengeId is not the lastChallengeId', function () {
        beforeEach(async function () {
          databaseBuilder.factory.buildUser({ id: userId });
          databaseBuilder.factory.buildAssessment({
            id: assessmentId,
            userId,
            lastQuestionDate: new Date('2020-01-20'),
            lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
            lastChallengeId: nonFocusedChallengeId,
            state: 'started',
          });
          await databaseBuilder.commit();
        });

        it('should not update assessment lastQuestionState', async function () {
          // given
          const state = 'focusedout';
          const payload = {
            data: {
              attributes: {
                'challenge-id': anotherChallengeId,
              },
            },
          };
          const options = {
            method: 'PATCH',
            url: `/api/assessments/${assessmentId}/last-challenge-state/${state}`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
            payload,
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
          const assessmentsInDb = await knex('assessments').where('id', assessmentId).first('lastQuestionState');
          expect(assessmentsInDb.lastQuestionState).to.deep.equal(Assessment.statesOfLastQuestion.ASKED);
        });
      });
    });
  });
});
