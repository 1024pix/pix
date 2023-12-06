import { expect, databaseBuilder, mockLearningContent, learningContentBuilder } from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';

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
    mockLearningContent(learningContentObjects);
  });

  describe('(demo) GET /api/assessments/:assessment_id/next', function () {
    const assessmentId = 1;

    context('when no challenge is answered', function () {
      beforeEach(function () {
        databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: 'DEMO',
          courseId: 'course_id',
        });
        return databaseBuilder.commit();
      });

      it('should return 200 HTTP status code', function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/assessments/' + assessmentId + '/next',
        };

        // when
        return server.inject(options).then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });

      it('should return application/json', function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/assessments/' + assessmentId + '/next',
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          const contentType = response.headers['content-type'];
          expect(contentType).to.contain('application/json');
        });
      });

      it('should return the first challenge if none already answered', function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/assessments/' + assessmentId + '/next',
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.result.data.id).to.equal('first_challenge');
        });
      });
    });

    context('when the first challenge is already answered', function () {
      beforeEach(function () {
        databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: 'DEMO',
          courseId: 'course_id',
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
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.result.data.id).to.equal('second_challenge');
        });
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
