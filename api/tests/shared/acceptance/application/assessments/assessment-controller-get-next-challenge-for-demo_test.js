import { Assessment } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Acceptance | API | assessment-controller-get-next-challenge-for-demo', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    const learningContent = [
      {
        id: '1. Information et données',
        competences: [
          {
            id: 'competence_id',
            name_i18n: {
              fr: "Mener une recherche et une veille d'information",
            },
            index: '1.1',
            tubes: [
              {
                id: 'recTube0_0',
                skills: [
                  {
                    id: '@web1',
                    nom: '@web1',
                    challenges: [{ id: 'first_challenge' }, { id: 'second_challenge' }, { id: 'third_challenge' }],
                  },
                ],
              },
            ],
          },
        ],
        courses: [
          {
            id: 'course_id',
            competenceId: 'competence_id',
            challengeIds: ['first_challenge', 'second_challenge'],
          },
        ],
      },
    ];

    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    await mockLearningContent(learningContentObjects);
  });

  describe('(demo) GET /api/assessments/:assessment_id/next', function () {
    const assessmentId = 1;

    context('when next challenge found', function () {
      beforeEach(function () {
        databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: 'DEMO',
          courseId: 'course_id',
          state: Assessment.states.STARTED,
        });
        return databaseBuilder.commit();
      });

      it('should return 200 HTTP status code', async function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/assessments/' + assessmentId + '/next',
        };

        // when
        const response = await server.inject(options);
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.contain('application/json');
        expect(response.result.data.id).to.equal('first_challenge');
      });
    });

    context('when the first challenge is already answered', function () {
      beforeEach(function () {
        databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: 'DEMO',
          courseId: 'course_id',
          state: Assessment.states.STARTED,
        });
        databaseBuilder.factory.buildAnswer({ challengeId: 'first_challenge', assessmentId });
        return databaseBuilder.commit();
      });

      it('should return the second challenge', async function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/assessments/' + assessmentId + '/next',
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data.id).to.equal('second_challenge');
      });
    });

    context('when the first challenge has not been answered yet', function () {
      beforeEach(function () {
        databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: 'DEMO',
          courseId: 'course_id',
          state: Assessment.states.STARTED,
          lastChallengeId: 'first_challenge',
        });
        databaseBuilder.factory.buildAnswer({ challengeId: 'some_other_challenge', assessmentId });
        return databaseBuilder.commit();
      });

      it('should return the first challenge again', async function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/assessments/' + assessmentId + '/next',
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data.id).to.equal('first_challenge');
      });
    });

    context('when all challenges are answered', function () {
      beforeEach(function () {
        databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: 'DEMO',
          courseId: 'course_id',
        });
        databaseBuilder.factory.buildAnswer({ challengeId: 'first_challenge', assessmentId });
        databaseBuilder.factory.buildAnswer({ challengeId: 'second_challenge', assessmentId });
        return databaseBuilder.commit();
      });

      it('should finish the test', async function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/assessments/' + assessmentId + '/next',
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: null,
        });
      });
    });
  });
});
