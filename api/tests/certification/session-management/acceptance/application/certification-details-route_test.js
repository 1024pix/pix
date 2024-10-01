import { CertificationAssessment } from '../../../../../src/certification/session-management/domain/models/CertificationAssessment.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Certification | Session Management | Acceptance | Application | Routes | certification-details', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/certifications/{certificationCourseId}/details', function () {
    context('when certification match an existing scoring rule', function () {
      it('Should respond with a status 200', async function () {
        // given
        await insertUserWithRoleSuperAdmin();
        const options = {
          method: 'GET',
          url: '/api/admin/certifications/1234/details',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(),
          },
        };

        const learningContent = [
          {
            id: '1. Information et données',
            competences: [
              {
                id: 'competence_id',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [
                      {
                        id: 'recSkill1',
                        challenges: [{ id: 'k_challenge_id' }],
                        level: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ];

        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        mockLearningContent(learningContentObjects);

        const sessionId = databaseBuilder.factory.buildSession().id;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({
          userId,
          sessionId,
          reconciledAt: new Date(),
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 1234, sessionId });
        const assessmentId = databaseBuilder.factory.buildAssessment({
          certificationCourseId: 1234,
          competenceId: 'competence_id',
        }).id;
        const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
          assessmentId,
          certificationCourseId: 1234,
        }).id;
        databaseBuilder.factory.buildCompetenceMark({ assessmentResultId, competenceId: 'competence_id' });

        databaseBuilder.factory.buildCertificationChallenge({
          courseId: 1234,
          competenceId: 'competence_id',
          challengeId: 'k_challenge_id',
        });

        databaseBuilder.factory.buildAnswer({ challengeId: 'k_challenge_id', assessmentId });

        await databaseBuilder.commit();

        // when
        const result = await server.inject(options);

        // then
        expect(result.statusCode).to.equal(200);
      });
    });

    context('when certification does not match an existing scoring rule', function () {
      it('Should respond with a status 400', async function () {
        // given
        await insertUserWithRoleSuperAdmin();
        const options = {
          method: 'GET',
          url: '/api/admin/certifications/1234/details',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(),
          },
        };

        const challenges = [
          { id: 'k_challenge_id_1' },
          { id: 'k_challenge_id_2' },
          { id: 'k_challenge_id_3' },
          { id: 'k_challenge_id_4' },
        ];
        const learningContent = [
          {
            id: '1. Information et données',
            competences: [
              {
                id: 'competence_id',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [
                      {
                        id: 'recSkill1',
                        challenges,
                        level: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ];

        const user = databaseBuilder.factory.buildUser({});

        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        mockLearningContent(learningContentObjects);

        const sessionId = databaseBuilder.factory.buildSession().id;
        databaseBuilder.factory.buildCertificationCandidate({
          userId: user.id,
          sessionId,
          reconciledAt: new Date(),
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 1234, userId: user.id, sessionId });
        const assessmentId = databaseBuilder.factory.buildAssessment({
          certificationCourseId: 1234,
          competenceId: 'competence_id',
          state: CertificationAssessment.states.STARTED,
          userId: user.id,
        }).id;

        challenges.forEach(({ id: challengeId }) => {
          databaseBuilder.factory.buildCertificationChallenge({
            courseId: 1234,
            competenceId: 'competence_id',
            challengeId,
          });

          const answerId = databaseBuilder.factory.buildAnswer({ challengeId, assessmentId, result: 'ok' }).id;
          databaseBuilder.factory.buildKnowledgeElement({
            source: KnowledgeElement.SourceType.DIRECT,
            skillId: challengeId,
            assessmentId,
            answerId,
            userId: user.id,
            competenceId: 'competence_id',
            earnedPix: 8,
            createdAt: new Date('2019-01-01'),
          });
        });

        await databaseBuilder.commit();

        // when
        const result = await server.inject(options);

        // then
        expect(result.statusCode).to.equal(400);
      });
    });
  });
});
