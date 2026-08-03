import { createServer } from '../../../../../server.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../../tooling/learning-content-builder/index.js';

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
            name: 'Test statique de démo',
          },
        ],
      },
    ];

    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    databaseBuilder.factory.learningContent.build(learningContentObjects);
    await databaseBuilder.commit();
  });

  describe('(demo) GET /api/assessments/:assessment_id', function () {
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
          url: `/api/assessments/${assessmentId}`,
        };

        // when
        const response = await server.inject(options);
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.contain('application/json');
        expect(response.result.data.id).to.equal(assessmentId.toString());
        expect(response.result.data.attributes.title).to.equal('Test statique de démo');
        expect(response.result.data.relationships['next-challenge'].data.id).to.equal('first_challenge');
        expect(response.result.included.find(({ id }) => id === 'first_challenge')).to.exist;
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
          url: `/api/assessments/${assessmentId}`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data.id).to.equal(assessmentId.toString());
        expect(response.result.data.relationships['next-challenge'].data.id).to.equal('second_challenge');
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
          url: `/api/assessments/${assessmentId}`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data.id).to.equal(assessmentId.toString());
        expect(response.result.data.relationships['next-challenge'].data.id).to.equal('first_challenge');
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

      it('should return the assessment with no next challenge', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.id).to.equal(assessmentId.toString());
        expect(response.result.data.relationships['next-challenge'].data).to.be.null;
      });
    });
  });
});
