import { databaseBuilder } from '../../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../../tooling/learning-content-builder/index.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Session Management | Acceptance | Application | Routes | certification-details', function () {
  describe('GET /api/admin/certifications/{certificationCourseId}/details', function () {
    context('when certification match an existing scoring rule', function () {
      it('Should respond with a status 200', async function () {
        // given
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: '/api/admin/certifications/1234/details',
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
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
        databaseBuilder.factory.learningContent.build(learningContentObjects);

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
  });
});
