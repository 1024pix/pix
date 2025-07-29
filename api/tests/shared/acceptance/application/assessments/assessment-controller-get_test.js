import { Assessment } from '../../../../../src/shared/domain/models/index.js';
import { FRENCH_SPOKEN } from '../../../../../src/shared/domain/services/locale-service.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Acceptance | API | assessment-controller-get', function () {
  let server;
  const courseId = 'course_id';

  describe('(no provided answer) GET /api/assessments/:id', function () {
    let options;

    context(`when the assessment is of type CERTIFICATION`, function () {
      it('should return the expected assessment', async function () {
        // given
        server = await createServer();
        const userId = databaseBuilder.factory.buildUser().id;
        const sessionId = databaseBuilder.factory.buildSession().id;
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId, sessionId }).id;
        const assessmentId = databaseBuilder.factory.buildAssessment({
          userId,
          courseId,
          state: Assessment.states.STARTED,
          type: Assessment.types.CERTIFICATION,
          certificationCourseId,
        }).id;
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId, acceptLanguage: FRENCH_SPOKEN }),
        };

        // when
        const response = await server.inject(options);

        // then
        const expectedAssessment = {
          type: 'assessments',
          id: assessmentId.toString(),
          attributes: {
            state: Assessment.states.STARTED,
            title: certificationCourseId,
            type: Assessment.types.CERTIFICATION,
            'certification-number': certificationCourseId,
            'has-ongoing-challenge-live-alert': false,
            'has-ongoing-companion-live-alert': false,
            'last-question-state': Assessment.statesOfLastQuestion.ASKED,
            'competence-id': 'recCompetenceId',
            method: Assessment.methods.CERTIFICATION_DETERMINED,
            'has-checkpoints': false,
            'show-levelup': false,
            'show-progress-bar': false,
            'show-question-counter': true,
            'ordered-challenge-ids-answered': [],
          },
          relationships: {
            answers: {
              data: [],
              links: {
                related: `/api/answers?assessmentId=${assessmentId}`,
              },
            },
            'certification-course': {
              links: {
                related: `/api/certification-courses/${certificationCourseId}`,
              },
            },
            'next-challenge': {
              data: null,
            },
          },
        };

        expect(response.statusCode).to.equal(200);
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        const assessment = response.result.data;
        expect(assessment).to.deep.equal(expectedAssessment);
      });
    });

    context(`when the assessment is of type PREVIEW`, function () {
      it('should return the expected assessment', async function () {
        // given
        server = await createServer();
        const assessmentId = databaseBuilder.factory.buildAssessment({
          userId: null,
          courseId,
          state: Assessment.states.STARTED,
          type: Assessment.types.PREVIEW,
        }).id;
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}`,
        };

        // when
        const response = await server.inject(options);

        // then
        const expectedAssessment = {
          type: 'assessments',
          id: assessmentId.toString(),
          attributes: {
            state: Assessment.states.STARTED,
            title: 'Preview',
            type: Assessment.types.PREVIEW,
            'has-ongoing-challenge-live-alert': false,
            'has-ongoing-companion-live-alert': false,
            'last-question-state': Assessment.statesOfLastQuestion.ASKED,
            'competence-id': 'recCompetenceId',
            method: Assessment.methods.CHOSEN,
            'has-checkpoints': false,
            'show-levelup': false,
            'show-progress-bar': false,
            'show-question-counter': true,
            'ordered-challenge-ids-answered': [],
          },
          relationships: {
            answers: {
              data: [],
              links: {
                related: `/api/answers?assessmentId=${assessmentId}`,
              },
            },
            progression: {
              data: {
                id: `progression-${assessmentId}`,
                type: 'progressions',
              },
              links: {
                related: `/api/progressions/progression-${assessmentId}`,
              },
            },
            'next-challenge': {
              data: null,
            },
          },
        };

        expect(response.statusCode).to.equal(200);
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        const assessment = response.result.data;
        expect(assessment).to.deep.equal(expectedAssessment);
      });
    });

    context(`when the assessment is of type CAMPAIGN`, function () {
      it('should return the expected assessment', async function () {
        // given
        server = await createServer();
        const userId = databaseBuilder.factory.buildUser().id;
        const campaign = databaseBuilder.factory.buildCampaign();
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
        }).id;
        const assessmentId = databaseBuilder.factory.buildAssessment({
          userId,
          courseId,
          state: Assessment.states.STARTED,
          type: Assessment.types.CAMPAIGN,
          campaignParticipationId,
        }).id;
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId, acceptLanguage: FRENCH_SPOKEN }),
        };

        // when
        const response = await server.inject(options);

        // then
        const expectedAssessment = {
          type: 'assessments',
          id: assessmentId.toString(),
          attributes: {
            state: Assessment.states.STARTED,
            'code-campaign': campaign.code,
            title: campaign.title,
            type: Assessment.types.CAMPAIGN,
            'has-ongoing-challenge-live-alert': false,
            'has-ongoing-companion-live-alert': false,
            'last-question-state': Assessment.statesOfLastQuestion.ASKED,
            'competence-id': 'recCompetenceId',
            method: Assessment.methods.SMART_RANDOM,
            'has-checkpoints': true,
            'show-levelup': true,
            'show-progress-bar': true,
            'show-question-counter': true,
            'ordered-challenge-ids-answered': [],
          },
          relationships: {
            answers: {
              data: [],
              links: {
                related: `/api/answers?assessmentId=${assessmentId}`,
              },
            },
            progression: {
              data: {
                id: `progression-${assessmentId}`,
                type: 'progressions',
              },
              links: {
                related: `/api/progressions/progression-${assessmentId}`,
              },
            },
            'next-challenge': {
              data: null,
            },
          },
        };

        expect(response.statusCode).to.equal(200);
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        const assessment = response.result.data;
        expect(assessment).to.deep.equal(expectedAssessment);
      });
    });

    context(`when the assessment is of type DEMO`, function () {
      it('should return the expected assessment', async function () {
        // given
        server = await createServer();
        const courseName = 'Course name';
        const learningContent = [
          {
            id: '1. Information et données',
            competences: [],
            courses: [
              {
                id: courseId,
                name: courseName,
                isActive: true,
                competenceId: 'competence_id',
                challengeIds: ['first_challenge', 'second_challenge'],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        await mockLearningContent(learningContentObjects);

        const assessmentId = databaseBuilder.factory.buildAssessment({
          userId: null,
          courseId,
          state: Assessment.states.STARTED,
          type: Assessment.types.DEMO,
        }).id;
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}`,
        };

        // when
        const response = await server.inject(options);

        // then
        const expectedAssessment = {
          type: 'assessments',
          id: assessmentId.toString(),
          attributes: {
            state: Assessment.states.STARTED,
            title: courseName,
            type: Assessment.types.DEMO,
            'has-ongoing-challenge-live-alert': false,
            'has-ongoing-companion-live-alert': false,
            'last-question-state': Assessment.statesOfLastQuestion.ASKED,
            'competence-id': 'recCompetenceId',
            method: Assessment.methods.COURSE_DETERMINED,
            'has-checkpoints': false,
            'show-levelup': false,
            'show-progress-bar': true,
            'show-question-counter': true,
            'ordered-challenge-ids-answered': [],
          },
          relationships: {
            answers: {
              data: [],
              links: {
                related: `/api/answers?assessmentId=${assessmentId}`,
              },
            },
            course: {
              data: {
                id: courseId,
                type: 'courses',
              },
            },
            'next-challenge': {
              data: null,
            },
          },
        };

        expect(response.statusCode).to.equal(200);
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        const assessment = response.result.data;
        expect(assessment).to.deep.equal(expectedAssessment);
      });
    });

    context(`when the assessment is of type COMPETENCE_EVALUATION`, function () {
      it('should return the expected assessment', async function () {
        // given
        server = await createServer();
        const competenceId = 'competence_id';
        const learningContent = [
          {
            id: '1. Information et données',
            areas: [
              {
                competences: [
                  {
                    id: competenceId,
                    name_i18n: {
                      fr: 'Mener une recherche et une veille d’information',
                    },
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder(learningContent);
        await mockLearningContent(learningContentObjects);

        const userId = databaseBuilder.factory.buildUser().id;
        const assessmentId = databaseBuilder.factory.buildAssessment({
          userId,
          state: Assessment.states.STARTED,
          type: Assessment.types.COMPETENCE_EVALUATION,
          competenceId,
        }).id;
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId, acceptLanguage: FRENCH_SPOKEN }),
        };

        // when
        const response = await server.inject(options);

        // then
        const expectedAssessment = {
          type: 'assessments',
          id: assessmentId.toString(),
          attributes: {
            state: Assessment.states.STARTED,
            title: 'Mener une recherche et une veille d’information',
            type: Assessment.types.COMPETENCE_EVALUATION,
            'has-ongoing-challenge-live-alert': false,
            'has-ongoing-companion-live-alert': false,
            'last-question-state': Assessment.statesOfLastQuestion.ASKED,
            'competence-id': competenceId,
            method: Assessment.methods.SMART_RANDOM,
            'has-checkpoints': true,
            'show-levelup': true,
            'show-progress-bar': true,
            'show-question-counter': true,
            'ordered-challenge-ids-answered': [],
          },
          relationships: {
            answers: {
              data: [],
              links: {
                related: `/api/answers?assessmentId=${assessmentId}`,
              },
            },
            progression: {
              data: {
                id: `progression-${assessmentId}`,
                type: 'progressions',
              },
              links: {
                related: `/api/progressions/progression-${assessmentId}`,
              },
            },
            'next-challenge': {
              data: null,
            },
          },
        };

        expect(response.statusCode).to.equal(200);
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        const assessment = response.result.data;
        expect(assessment).to.deep.equal(expectedAssessment);
      });
    });
  });

  describe('(when userId and assessmentId match) GET /api/assessments/:id', function () {
    let options;

    beforeEach(async function () {
      server = await createServer();
      const userId = databaseBuilder.factory.buildUser({}).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({
        userId,
        courseId,
        type: Assessment.types.PREVIEW,
      }).id;
      await databaseBuilder.commit();
      options = {
        headers: generateAuthenticatedUserRequestHeaders({ userId, acceptLanguage: FRENCH_SPOKEN }),
        method: 'GET',
        url: `/api/assessments/${assessmentId}`,
      };
    });

    it('should return 200 HTTP status code, when userId provided is linked to assessment', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('(answers provided, assessment completed) GET /api/assessments/:id', function () {
    let assessmentId, userId, answer1, answer2;

    beforeEach(async function () {
      server = await createServer();
      userId = databaseBuilder.factory.buildUser({}).id;
      assessmentId = databaseBuilder.factory.buildAssessment({
        userId,
        courseId,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.PREVIEW,
      }).id;

      answer1 = databaseBuilder.factory.buildAnswer({
        assessmentId,
        challengeId: 'rec1',
        createdAt: new Date('2020-01-01'),
      });
      answer2 = databaseBuilder.factory.buildAnswer({
        assessmentId,
        challengeId: 'rec2',
        createdAt: new Date('2020-01-02'),
      });

      await databaseBuilder.commit();
    });

    it('should return 200 HTTP status code', async function () {
      const options = {
        method: 'GET',
        url: `/api/assessments/${assessmentId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId, acceptLanguage: FRENCH_SPOKEN }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return application/json', async function () {
      const options = {
        method: 'GET',
        url: `/api/assessments/${assessmentId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId, acceptLanguage: FRENCH_SPOKEN }),
      };

      // when
      const response = await server.inject(options);

      // then
      const contentType = response.headers['content-type'];
      expect(contentType).to.contain('application/json');
    });

    it('should return the expected assessment', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/assessments/${assessmentId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId, acceptLanguage: FRENCH_SPOKEN }),
      };

      // when
      const response = await server.inject(options);

      // then
      const expectedAssessment = {
        type: 'assessments',
        id: assessmentId.toString(),
        attributes: {
          state: 'completed',
          title: 'Preview',
          type: Assessment.types.PREVIEW,
          'has-ongoing-challenge-live-alert': false,
          'has-ongoing-companion-live-alert': false,
          'competence-id': 'recCompetenceId',
          'last-question-state': Assessment.statesOfLastQuestion.ASKED,
          method: Assessment.methods.CHOSEN,
          'has-checkpoints': false,
          'show-levelup': false,
          'show-progress-bar': false,
          'show-question-counter': true,
          'ordered-challenge-ids-answered': ['rec1', 'rec2'],
        },
        relationships: {
          answers: {
            data: [
              {
                type: 'answers',
                id: answer1.id.toString(),
              },
              {
                type: 'answers',
                id: answer2.id.toString(),
              },
            ],
          },
          'next-challenge': {
            data: null,
          },
        },
      };
      const assessment = response.result.data;
      expect(assessment.attributes).to.deep.equal(expectedAssessment.attributes);
      expect(assessment.relationships.answers.data).to.have.deep.members(expectedAssessment.relationships.answers.data);
      expect(assessment.relationships.course).to.deep.equal(expectedAssessment.relationships.course);
      expect(assessment.relationships['next-challenge']).to.deep.equal(
        expectedAssessment.relationships['next-challenge'],
      );
    });
  });
});
