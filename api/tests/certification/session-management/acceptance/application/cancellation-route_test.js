import { createServer } from '../../../../../server.js';
import { AlgorithmEngineVersion } from '../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { PIX_ADMIN } from '../../../../../src/shared/domain/constants.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { AssessmentResult } from '../../../../../src/shared/domain/models/AssessmentResult.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../../tooling/learning-content-builder/index.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

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
    databaseBuilder.factory.learningContent.build(learningContentObjects);
    await databaseBuilder.commit();
  });

  describe('PATCH /api/admin/certification-courses/{certificationCourseId}/cancel', function () {
    context('when certification is v2', function () {
      it('should create a new cancelled assessment-result', async function () {
        // given
        const juryMember = databaseBuilder.factory.buildUser.withRole({ roles: PIX_ADMIN.ROLES.SUPER_ADMIN });
        const session = databaseBuilder.factory.buildSession({
          version: AlgorithmEngineVersion.V2,
          finalizedAt: new Date('2024-01-15'),
        });
        const userId = databaseBuilder.factory.buildUser().id;
        const candidate = databaseBuilder.factory.buildCertificationCandidate({
          userId,
          reconciledAt: new Date('2024-01-15'),
          sessionId: session.id,
        });
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          id: 123,
          userId,
          version: AlgorithmEngineVersion.V2,
          sessionId: session.id,
          candidateId: candidate.id,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
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
        const versionId = databaseBuilder.factory.buildCertificationVersion({
          startDate: new Date('2024-01-14'),
          competencesScoringConfiguration: [
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
        }).id;
        const juryMember = databaseBuilder.factory.buildUser.withRole({ roles: PIX_ADMIN.ROLES.SUPER_ADMIN });
        const session = databaseBuilder.factory.buildSession({
          version: AlgorithmEngineVersion.V3,
          finalizedAt: new Date('2024-01-15'),
        });
        const userId = databaseBuilder.factory.buildUser().id;
        const candidateId = databaseBuilder.factory.buildCertificationCandidate({
          userId,
          reconciledAt: new Date('2024-01-15'),
          sessionId: session.id,
          finalizedAt: new Date('2024-01-15'),
        }).id;
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          id: 123,
          userId,
          version: AlgorithmEngineVersion.V3,
          sessionId: session.id,
          createdAt: new Date('2024-01-15'),
          abortReason: 'technical',
          candidateId,
          versionId,
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
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        const cancelledAssessmentResult = await knex('assessment-results')
          .where({
            assessmentId: assessment.id,
            status: AssessmentResult.status.CANCELLED_BY_JURY,
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
        expect(competenceMarks).to.have.lengthOf(0);
      });
    });
  });

  describe('PATCH /api/admin/certification-courses/{certificationCourseId}/uncancel', function () {
    it('should uncancel the certification with a new assessment-result', async function () {
      // given
      const versionId = databaseBuilder.factory.buildCertificationVersion({
        startDate: new Date('2024-01-14'),
        challengesConfiguration: {
          maximumAssessmentLength: 1,
        },
        competencesScoringConfiguration: [
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
        minimumAnswersRequiredToValidateACertification: 1,
      }).id;
      const juryMember = databaseBuilder.factory.buildUser.withRole({ roles: PIX_ADMIN.ROLES.SUPER_ADMIN });
      const session = databaseBuilder.factory.buildSession({
        version: AlgorithmEngineVersion.V3,
        finalizedAt: new Date('2024-01-15'),
      });
      const userId = databaseBuilder.factory.buildUser().id;
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        userId,
        reconciledAt: new Date('2024-01-15'),
        sessionId: session.id,
        finalizedAt: new Date('2024-01-15'),
      }).id;
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        id: 123,
        userId,
        version: AlgorithmEngineVersion.V3,
        sessionId: session.id,
        createdAt: new Date('2024-01-15'),
        abortReason: 'candidate',
        candidateId,
        versionId,
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
      databaseBuilder.factory.buildAnswer({
        assessmentId: assessment.id,
        challengeId: certificationChallengeOk.challengeId,
        result: AnswerStatus.OK.status,
      });

      const options = {
        method: 'PATCH',
        url: '/api/admin/certification-courses/123/uncancel',
        headers: generateAuthenticatedUserRequestHeaders({ userId: juryMember.id }),
      };
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      const rejectedAssessmentResult = await knex('assessment-results')
        .where({
          assessmentId: assessment.id,
          status: AssessmentResult.status.VALIDATED,
          juryId: juryMember.id,
        })
        .first();

      expect(response.statusCode).to.equal(204);
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
