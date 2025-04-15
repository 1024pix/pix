import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { AlgorithmEngineVersion } from '../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { SESSIONS_VERSIONS } from '../../../../../src/certification/shared/domain/models/SessionVersion.js';
import { Assessment } from '../../../../../src/shared/domain/models/index.js';
import { AssessmentResult } from '../../../../../src/shared/domain/models/index.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  insertUserWithRoleSuperAdmin,
  knex,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Certification | Session-management | Acceptance | Application | Routes | cancellation', function () {
  let server;
  const challengeId = 'k_challenge_id';

  beforeEach(async function () {
    server = await createServer();

    const learningContent = [
      {
        id: '1. Information et données',
        competences: [
          {
            id: 'index Compétence A',
            tubes: [
              {
                id: 'recTube1',
                skills: [
                  {
                    id: 'recSkill0_0',
                    nom: '@recSkill0_0',
                    challenges: [{ id: challengeId }],
                  },
                ],
              },
            ],
          },
        ],
        courses: [
          {
            id: 'rec_active_course_id',
            name: "A la recherche de l'information #01",
            description: "Mener une recherche et une veille d'information",
            isActive: true,
            competenceId: 'index Compétence A',
            challengeIds: [challengeId],
          },
        ],
      },
    ];

    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    await mockLearningContent(learningContentObjects);
  });

  describe('PATCH /api/admin/certification-courses/{certificationCourseId}/cancel', function () {
    context('when certification is v2', function () {
      it('should create a new cancelled assessment-result', async function () {
        // given
        const juryMember = databaseBuilder.factory.buildUser.withRole({ roles: PIX_ADMIN.ROLES.SUPER_ADMIN });
        const session = databaseBuilder.factory.buildSession({
          version: SESSIONS_VERSIONS.V2,
          finalizedAt: new Date('2024-01-15'),
        });
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          id: 123,
          version: AlgorithmEngineVersion.V2,
          sessionId: session.id,
        });
        databaseBuilder.factory.buildCertificationCandidate({
          userId: certificationCourse.userId,
          reconciledAt: new Date('2024-01-15'),
          sessionId: session.id,
        });
        const assessment = databaseBuilder.factory.buildAssessment({
          id: 456,
          type: Assessment.types.CERTIFICATION,
          userId: certificationCourse.userId,
          certificationCourseId: certificationCourse.id,
        });
        databaseBuilder.factory.buildCertificationChallenge({
          courseId: certificationCourse.id,
          challengeId,
        });
        const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
          assessmentId: assessment.id,
        });
        databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
          certificationCourseId: certificationCourse.id,
          lastAssessmentResultId: assessmentResult.id,
        });
        databaseBuilder.factory.buildCompetenceMark({ assessmentResultId: assessmentResult.id });
        const certificationChallengeOk = databaseBuilder.factory.buildCertificationChallenge({
          courseId: certificationCourse.id,
          isNeutralized: false,
          challengeId,
          competenceId: 'index Compétence A',
          associatedSkillName: '@recSkill0_0',
          associatedSkillId: 'recSkill0_0',
        });
        const answerId = databaseBuilder.factory.buildAnswer({
          assessmentId: assessment.id,
          challengeId: certificationChallengeOk.challengeId,
          result: AnswerStatus.OK.status,
        }).id;

        databaseBuilder.factory.buildKnowledgeElement({
          assessmentId: assessment.id,
          answerId,
          skillId: 'recSkill0_0',
          competenceId: 'index Compétence A',
          userId: certificationCourse.userId,
          earnedPix: 16,
        });

        const options = {
          method: 'PATCH',
          url: '/api/admin/certification-courses/123/cancel',
          headers: generateAuthenticatedUserRequestHeaders({ userId: juryMember.id }),
        };
        await insertUserWithRoleSuperAdmin();
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
        const cancelledAssessmentResult = await knex('assessment-results')
          .where({
            assessmentId: assessment.id,
            status: AssessmentResult.status.CANCELLED,
            juryId: juryMember.id,
          })
          .first();
        expect(cancelledAssessmentResult).not.to.be.undefined;
        expect(
          await knex('certification-courses-last-assessment-results').where({
            lastAssessmentResultId: cancelledAssessmentResult.id,
            certificationCourseId: certificationCourse.id,
          }),
        ).not.to.be.null;
        const competenceMarks = await knex('competence-marks').where({
          assessmentResultId: cancelledAssessmentResult.id,
        });
        expect(competenceMarks).to.have.lengthOf(1);
        expect(response.statusCode).to.equal(204);
      });
    });

    context('when certification is v3', function () {
      it('should create a new cancelled assessment-result', async function () {
        // given
        const juryMember = databaseBuilder.factory.buildUser.withRole({ roles: PIX_ADMIN.ROLES.SUPER_ADMIN });
        const session = databaseBuilder.factory.buildSession({
          version: SESSIONS_VERSIONS.V3,
          finalizedAt: new Date('2024-01-15'),
        });
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          id: 123,
          version: AlgorithmEngineVersion.V3,
          sessionId: session.id,
          createdAt: new Date('2024-01-15'),
          abortReason: 'technical',
        });
        databaseBuilder.factory.buildCertificationCandidate({
          userId: certificationCourse.userId,
          reconciledAt: new Date('2024-01-15'),
          sessionId: session.id,
          finalizedAt: new Date('2024-01-15'),
        });
        const assessment = databaseBuilder.factory.buildAssessment({
          id: 456,
          type: Assessment.types.CERTIFICATION,
          userId: certificationCourse.userId,
          certificationCourseId: certificationCourse.id,
        });
        databaseBuilder.factory.buildCertificationChallenge({
          courseId: certificationCourse.id,
          challengeId,
        });
        const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
          assessmentId: assessment.id,
        });
        databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
          certificationCourseId: certificationCourse.id,
          lastAssessmentResultId: assessmentResult.id,
        });
        databaseBuilder.factory.buildCompetenceMark({ assessmentResultId: assessmentResult.id });
        const certificationChallengeOk = databaseBuilder.factory.buildCertificationChallenge({
          courseId: certificationCourse.id,
          isNeutralized: false,
          challengeId,
          competenceId: 'index Compétence A',
          associatedSkillName: '@recSkill0_0',
          associatedSkillId: 'recSkill0_0',
        });
        const answerId = databaseBuilder.factory.buildAnswer({
          assessmentId: assessment.id,
          challengeId: certificationChallengeOk.challengeId,
          result: AnswerStatus.OK.status,
        }).id;

        databaseBuilder.factory.buildKnowledgeElement({
          assessmentId: assessment.id,
          answerId,
          skillId: 'recSkill0_0',
          competenceId: 'index Compétence A',
          userId: certificationCourse.userId,
          earnedPix: 16,
        });

        databaseBuilder.factory.buildFlashAlgorithmConfiguration({});
        databaseBuilder.factory.buildScoringConfiguration({
          createdAt: new Date('2024-01-14'),
          createdByUserId: juryMember.id,
        });
        databaseBuilder.factory.buildCompetenceScoringConfiguration({
          configuration: [
            {
              competence: 'index Compétence A',
              values: [
                {
                  bounds: {
                    max: 0,
                    min: -5,
                  },
                  competenceLevel: 0,
                },
                {
                  bounds: {
                    max: 5,
                    min: 0,
                  },
                  competenceLevel: 1,
                },
              ],
            },
          ],
          createdAt: new Date('2024-01-14'),
          createdByUserId: juryMember.id,
        });

        const options = {
          method: 'PATCH',
          url: '/api/admin/certification-courses/123/cancel',
          headers: generateAuthenticatedUserRequestHeaders({ userId: juryMember.id }),
        };
        await insertUserWithRoleSuperAdmin();
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        const cancelledAssessmentResult = await knex('assessment-results')
          .where({
            assessmentId: assessment.id,
            status: AssessmentResult.status.CANCELLED,
            juryId: juryMember.id,
          })
          .first();

        expect(response.statusCode).to.equal(204);
        expect(cancelledAssessmentResult).not.to.be.undefined;
        expect(
          await knex('certification-courses-last-assessment-results').where({
            lastAssessmentResultId: cancelledAssessmentResult.id,
            certificationCourseId: certificationCourse.id,
          }),
        ).not.to.be.null;
        const competenceMarks = await knex('competence-marks').where({
          assessmentResultId: cancelledAssessmentResult.id,
        });
        expect(competenceMarks).to.have.lengthOf(1);
      });
    });
  });

  describe('PATCH /api/admin/certification-courses/{certificationCourseId}/uncancel', function () {
    it('should uncancel the certification with a new assessment-result', async function () {
      // given
      const juryMember = databaseBuilder.factory.buildUser.withRole({ roles: PIX_ADMIN.ROLES.SUPER_ADMIN });
      const session = databaseBuilder.factory.buildSession({
        version: SESSIONS_VERSIONS.V3,
        finalizedAt: new Date('2024-01-15'),
      });
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        id: 123,
        version: AlgorithmEngineVersion.V3,
        sessionId: session.id,
        createdAt: new Date('2024-01-15'),
        abortReason: 'candidate',
        isCancelled: true,
      });
      databaseBuilder.factory.buildCertificationCandidate({
        userId: certificationCourse.userId,
        reconciledAt: new Date('2024-01-15'),
        sessionId: session.id,
        finalizedAt: new Date('2024-01-15'),
      });
      const assessment = databaseBuilder.factory.buildAssessment({
        id: 456,
        type: Assessment.types.CERTIFICATION,
        userId: certificationCourse.userId,
        certificationCourseId: certificationCourse.id,
      });
      databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourse.id,
        challengeId,
      });
      const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessment.id,
        status: AssessmentResult.status.CANCELLED,
      });
      databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResult.id,
      });
      databaseBuilder.factory.buildCompetenceMark({ assessmentResultId: assessmentResult.id });
      const certificationChallengeOk = databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourse.id,
        isNeutralized: false,
        challengeId,
        competenceId: 'index Compétence A',
        associatedSkillName: '@recSkill0_0',
        associatedSkillId: 'recSkill0_0',
      });
      const answerId = databaseBuilder.factory.buildAnswer({
        assessmentId: assessment.id,
        challengeId: certificationChallengeOk.challengeId,
        result: AnswerStatus.OK.status,
      }).id;

      databaseBuilder.factory.buildKnowledgeElement({
        assessmentId: assessment.id,
        answerId,
        skillId: 'recSkill0_0',
        competenceId: 'index Compétence A',
        userId: certificationCourse.userId,
        earnedPix: 16,
      });

      databaseBuilder.factory.buildFlashAlgorithmConfiguration({});
      databaseBuilder.factory.buildScoringConfiguration({
        createdAt: new Date('2024-01-14'),
        createdByUserId: juryMember.id,
      });
      databaseBuilder.factory.buildCompetenceScoringConfiguration({
        configuration: [
          {
            competence: 'index Compétence A',
            values: [
              {
                bounds: {
                  max: 0,
                  min: -5,
                },
                competenceLevel: 0,
              },
              {
                bounds: {
                  max: 5,
                  min: 0,
                },
                competenceLevel: 1,
              },
            ],
          },
        ],
        createdAt: new Date('2024-01-14'),
        createdByUserId: juryMember.id,
      });

      const options = {
        method: 'PATCH',
        url: '/api/admin/certification-courses/123/uncancel',
        headers: generateAuthenticatedUserRequestHeaders({ userId: juryMember.id }),
      };
      await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      const rejectedAssessmentResult = await knex('assessment-results')
        .where({
          assessmentId: assessment.id,
          status: AssessmentResult.status.REJECTED,
          juryId: juryMember.id,
        })
        .first();
      const certificationCourseUncancelled = await knex('certification-courses')
        .where({
          id: certificationCourse.id,
        })
        .first();

      expect(response.statusCode).to.equal(204);

      expect(certificationCourseUncancelled.isCancelled).to.equal(false);
      expect(rejectedAssessmentResult).not.to.be.undefined;
      expect(
        await knex('certification-courses-last-assessment-results').where({
          lastAssessmentResultId: rejectedAssessmentResult.id,
          certificationCourseId: certificationCourse.id,
        }),
      ).not.to.be.null;
      const competenceMarks = await knex('competence-marks').where({
        assessmentResultId: rejectedAssessmentResult.id,
      });
      expect(competenceMarks).to.have.lengthOf(1);
    });
  });
});
