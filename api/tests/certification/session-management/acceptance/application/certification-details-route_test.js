import { KnowledgeElement } from '../../../../../lib/domain/models/index.js';
import { CertificationAssessment } from '../../../../../src/certification/session-management/domain/models/CertificationAssessment.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Certification | Session-management | Acceptance | Application | certification-details-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/certifications/{id}/details', function () {
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

        databaseBuilder.factory.buildCertificationCourse({ id: 1234 });
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

        databaseBuilder.factory.buildCertificationCourse({ id: 1234, userId: user.id });
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
