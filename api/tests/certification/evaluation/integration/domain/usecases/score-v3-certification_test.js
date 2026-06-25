import { CertificationCompletedJob } from '../../../../../../src/certification/evaluation/domain/events/CertificationCompleted.js';
import { usecases } from '../../../../../../src/certification/evaluation/domain/usecases/index.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { FRENCH_SPOKEN } from '../../../../../../src/shared/domain/services/locale-service.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../../../tooling/learning-content-builder/index.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

const challengeParams = {
  alpha: 1,
  delta: -3,
  langues: ['Franco Français'],
};

describe('Certification | Evaluation | Integration | Domain | Usecases | Score v3 certification', function () {
  let certificationVersionId;

  beforeEach(async function () {
    const learningContent = [
      {
        id: 'recArea0',
        code: 'area0',
        competences: [
          {
            id: 'recCompetence0',
            index: '1.1',
            tubes: [
              {
                id: 'recTube0_0',
                skills: [
                  {
                    id: 'recSkill0_0',
                    nom: '@recSkill0_0',
                    level: 2,
                    challenges: [{ id: 'recChallenge0_0_0', ...challengeParams }],
                  },
                  {
                    id: 'recSkill0_1',
                    nom: '@recSkill0_1',
                    challenges: [{ id: 'recChallenge0_1_0', ...challengeParams }],
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence1',
            index: '1.2',
            tubes: [
              {
                id: 'recTube1_0',
                skills: [
                  {
                    id: 'recSkill1_0',
                    nom: '@recSkill1_0',
                    challenges: [{ id: 'recChallenge1_0_0', ...challengeParams }],
                  },
                  {
                    id: 'recSkill1_1',
                    nom: '@recSkill1_1',
                    challenges: [{ id: 'recChallenge1_1_0', ...challengeParams }],
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence2',
            index: '1.3',
            tubes: [
              {
                id: 'recTube2_0',
                skills: [
                  {
                    id: 'recSkill2_0',
                    nom: '@recSkill2_0',
                    challenges: [{ id: 'recChallenge2_0_0', ...challengeParams }],
                  },
                  {
                    id: 'recSkill2_1',
                    nom: '@recSkill2_1',
                    challenges: [{ id: 'recChallenge2_1_0', ...challengeParams }],
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence3',
            index: '1.4',
            tubes: [
              {
                id: 'recTube3_0',
                skills: [
                  {
                    id: 'recSkill3_0',
                    nom: '@recSkill3_0',
                    challenges: [{ id: 'recChallenge3_0_0', ...challengeParams }],
                  },
                  {
                    id: 'recSkill3_1',
                    nom: '@recSkill3_1',
                    challenges: [{ id: 'recChallenge3_1_0', ...challengeParams }],
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence4',
            index: '1.5',
            tubes: [
              {
                id: 'recTube4_0',
                skills: [
                  {
                    id: 'recSkill4_0',
                    nom: '@recSkill4_0',
                    challenges: [{ id: 'recChallenge4_0_0', ...challengeParams }],
                  },
                  {
                    id: 'recSkill4_1',
                    nom: '@recSkill4_1',
                    challenges: [{ id: 'recChallenge4_1_0', ...challengeParams }],
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

    certificationVersionId = databaseBuilder.factory.buildCertificationVersion({
      challengesConfiguration: { maximumAssessmentLength: 10 },
      minimumAnswersRequiredToValidateACertification: 10,
      competencesScoringConfiguration: [
        {
          competence: '1.1',
          competenceId: 'recCompetence0',
          values: [
            { bounds: { max: -2, min: Number.MIN_SAFE_INTEGER }, competenceLevel: 0 },
            { bounds: { max: -1, min: -2 }, competenceLevel: 1 },
            { bounds: { max: 0.5, min: -1 }, competenceLevel: 2 },
            { bounds: { max: 1, min: 0.5 }, competenceLevel: 3 },
            { bounds: { max: 2, min: 1 }, competenceLevel: 4 },
            { bounds: { max: 3, min: 2 }, competenceLevel: 5 },
            { bounds: { max: 4, min: 3 }, competenceLevel: 6 },
            { bounds: { max: Number.MAX_SAFE_INTEGER, min: 4 }, competenceLevel: 7 },
          ],
        },
      ],
    }).id;

    await databaseBuilder.commit();
  });

  context('when certification is a Pix Core', function () {
    let certifiableUserId, certificationCourseId, completedCertificationAssessmentId;

    beforeEach(async function () {
      const limitDate = new Date('2020-01-01T00:00:00Z');
      certifiableUserId = databaseBuilder.factory.buildUser().id;

      const session = databaseBuilder.factory.buildSession({
        version: AlgorithmEngineVersion.V3,
      });

      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId: session.id,
        userId: certifiableUserId,
      }).id;

      certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
        userId: certifiableUserId,
        createdAt: limitDate,
        version: AlgorithmEngineVersion.V3,
        candidateId,
        versionId: certificationVersionId,
      }).id;

      completedCertificationAssessmentId = databaseBuilder.factory.buildAssessment({
        certificationCourseId,
        userId: certifiableUserId,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CERTIFICATION,
        createdAt: limitDate,
      }).id;

      _buildValidAnswersAndCertificationChallenges({
        assessmentId: completedCertificationAssessmentId,
        certificationCourseId,
        versionId: certificationVersionId,
      });

      await databaseBuilder.commit();
    });

    context('when pix score is not 0 (so competence marks are created)', function () {
      it('should score the certification', async function () {
        // given
        _buildValidAnswersAndCertificationChallenges({
          assessmentId: completedCertificationAssessmentId,
          certificationCourseId,
          versionId: certificationVersionId,
        });
        await databaseBuilder.commit();
        const event = new CertificationCompletedJob({
          certificationCourseId,
          locale: FRENCH_SPOKEN,
        });

        // when
        await usecases.scoreV3Certification({ certificationCourseId, event });

        // then
        const results = await knex('assessment-results').where({ assessmentId: completedCertificationAssessmentId });
        expect(results).to.have.lengthOf(1);

        const linkToCertifCourse = await knex('certification-courses-last-assessment-results')
          .where({
            lastAssessmentResultId: results[0].id,
            certificationCourseId: certificationCourseId,
          })
          .first();
        expect(linkToCertifCourse).to.deep.equal({
          lastAssessmentResultId: results[0].id,
          certificationCourseId: certificationCourseId,
        });

        const competenceMarks = await knex('competence-marks').where({ assessmentResultId: results[0].id });
        expect(competenceMarks).to.have.lengthOf(1);
        expect(competenceMarks[0].assessmentResultId).to.equal(results[0].id);

        const certificationChallengeCapacities = await knex('certification-challenge-capacities').whereIn(
          'certificationChallengeId',
          knex('certification-challenges').select('id').where({ courseId: certificationCourseId }),
        );
        expect(certificationChallengeCapacities).to.have.lengthOf(10);
      });
    });

    context('when pix score is 0, thus creating no competence mark', function () {
      it('should score a certification without competence marks when pixScore is 0', async function () {
        // given
        _buildInvalidAnswersAndCertificationChallenges({
          assessmentId: completedCertificationAssessmentId,
          certificationCourseId,
          versionId: certificationVersionId,
        });
        await databaseBuilder.commit();
        const event = new CertificationCompletedJob({
          certificationCourseId,
          locale: FRENCH_SPOKEN,
        });

        // when
        await usecases.scoreV3Certification({ certificationCourseId, event });

        // then
        const results = await knex('assessment-results').where({ assessmentId: completedCertificationAssessmentId });
        expect(results).to.have.lengthOf(1);

        const linkToCertifCourse = await knex('certification-courses-last-assessment-results')
          .where({
            lastAssessmentResultId: results[0].id,
            certificationCourseId: certificationCourseId,
          })
          .first();
        expect(linkToCertifCourse).to.deep.equal({
          lastAssessmentResultId: results[0].id,
          certificationCourseId: certificationCourseId,
        });

        const competenceMarks = await knex('competence-marks').where({ assessmentResultId: results[0].id });
        expect(competenceMarks).to.have.lengthOf(0);

        const certificationChallengeCapacities = await knex('certification-challenge-capacities').whereIn(
          'certificationChallengeId',
          knex('certification-challenges').select('id').where({ courseId: certificationCourseId }),
        );
        expect(certificationChallengeCapacities).to.have.lengthOf(10);
      });
    });

    it('should rollback scoring if any error happens', async function () {
      // given
      _buildValidAnswersAndCertificationChallenges({
        assessmentId: completedCertificationAssessmentId,
        certificationCourseId,
        versionId: certificationVersionId,
      });
      await databaseBuilder.commit();
      const event = new CertificationCompletedJob({
        certificationCourseId,
        locale: FRENCH_SPOKEN,
      });

      // when
      const errorDuringTransaction = await catchErr(async () => {
        await DomainTransaction.execute(async () => {
          await usecases.scoreV3Certification({ certificationCourseId, event });
          throw new Error('test error');
        });
      })();

      // then
      expect(errorDuringTransaction.message).to.equal('test error');

      const noScoring = await knex('assessment-results').where({
        assessmentId: completedCertificationAssessmentId,
      });
      expect(noScoring).to.have.lengthOf(0);

      const noResultForCertifCourse = await knex('certification-courses-last-assessment-results')
        .where({
          certificationCourseId: certificationCourseId,
        })
        .first();
      expect(noResultForCertifCourse).not.to.exist;

      const noCompetenceMarks = await knex('competence-marks').whereIn(
        'assessmentResultId',
        knex('assessment-results').select('id').where({ assessmentId: completedCertificationAssessmentId }),
      );
      expect(noCompetenceMarks).to.have.lengthOf(0);

      const noCertificationChallengeCapacities = await knex('certification-challenge-capacities').whereIn(
        'certificationChallengeId',
        knex('certification-challenges').select('id').where({ courseId: certificationCourseId }),
      );
      expect(noCertificationChallengeCapacities).to.have.lengthOf(0);
    });
  });

  context('when certification is a Pix+ Édu and the candidate does not reach the minimum mesh', function () {
    let certifiableUserId, certificationCourseId, completedCertificationAssessmentId, eduCertificationVersion;

    beforeEach(async function () {
      const limitDate = new Date('2025-01-01T00:00:00Z');
      certifiableUserId = databaseBuilder.factory.buildUser().id;

      eduCertificationVersion = databaseBuilder.factory.buildCertificationVersion({
        scope: Frameworks.EDU_1ER_DEGRE,
        challengesConfiguration: { maximumAssessmentLength: 10 },
        minimumAnswersRequiredToValidateACertification: 10,
        globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: 10, max: 20 } }],
        competencesScoringConfiguration: [
          {
            competence: '1.1',
            competenceId: 'recCompetence0',
            values: [{ bounds: { max: Number.MAX_SAFE_INTEGER, min: Number.MIN_SAFE_INTEGER }, competenceLevel: 0 }],
          },
        ],
      });

      const session = databaseBuilder.factory.buildSession({
        version: AlgorithmEngineVersion.V3,
      });

      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId: session.id,
        userId: certifiableUserId,
        subscription: eduCertificationVersion.scope,
      }).id;

      certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
        userId: certifiableUserId,
        createdAt: limitDate,
        version: AlgorithmEngineVersion.V3,
        candidateId,
        versionId: eduCertificationVersion.id,
        framework: eduCertificationVersion.scope,
      }).id;

      completedCertificationAssessmentId = databaseBuilder.factory.buildAssessment({
        certificationCourseId,
        userId: certifiableUserId,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CERTIFICATION,
        createdAt: limitDate,
      }).id;

      _buildInvalidAnswersAndCertificationChallenges({
        assessmentId: completedCertificationAssessmentId,
        certificationCourseId,
        versionId: eduCertificationVersion.id,
      });

      await databaseBuilder.commit();
    });

    it('should persist an auto-jury comment REJECTED_EDU_NOT_ELIGIBLE on the assessment result', async function () {
      // given
      const event = new CertificationCompletedJob({
        certificationCourseId,
        locale: FRENCH_SPOKEN,
      });

      // when
      await usecases.scoreV3Certification({ certificationCourseId, event });

      // then
      const results = await knex('assessment-results').where({ assessmentId: completedCertificationAssessmentId });
      expect(results).to.have.lengthOf(1);
      expect(results[0].commentByAutoJury).to.equal('REJECTED_EDU_NOT_ELIGIBLE');
      expect(results[0].reachedMeshIndex).to.be.null;
      expect(results[0].status).to.equal('rejected');
    });
  });

  context(
    'when certification is a Pix+ (DROIT, PRO_SANTE) and the candidate does not reach the minimum mesh',
    function () {
      let certifiableUserId, certificationCourseId, completedCertificationAssessmentId, droitCertificationVersion;

      beforeEach(async function () {
        const limitDate = new Date('2025-01-01T00:00:00Z');
        certifiableUserId = databaseBuilder.factory.buildUser().id;

        droitCertificationVersion = databaseBuilder.factory.buildCertificationVersion({
          scope: Frameworks.DROIT,
          challengesConfiguration: { maximumAssessmentLength: 10 },
          minimumAnswersRequiredToValidateACertification: 10,
          globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: 10, max: 20 } }],
          competencesScoringConfiguration: [
            {
              competence: '1.1',
              competenceId: 'recCompetence0',
              values: [{ bounds: { max: Number.MAX_SAFE_INTEGER, min: Number.MIN_SAFE_INTEGER }, competenceLevel: 0 }],
            },
          ],
        });

        const session = databaseBuilder.factory.buildSession({
          version: AlgorithmEngineVersion.V3,
        });

        const candidateId = databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
          userId: certifiableUserId,
          subscription: droitCertificationVersion.scope,
        }).id;

        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
          userId: certifiableUserId,
          createdAt: limitDate,
          version: AlgorithmEngineVersion.V3,
          candidateId,
          versionId: droitCertificationVersion.id,
          framework: droitCertificationVersion.scope,
        }).id;

        completedCertificationAssessmentId = databaseBuilder.factory.buildAssessment({
          certificationCourseId,
          userId: certifiableUserId,
          state: Assessment.states.COMPLETED,
          type: Assessment.types.CERTIFICATION,
          createdAt: limitDate,
        }).id;

        _buildInvalidAnswersAndCertificationChallenges({
          assessmentId: completedCertificationAssessmentId,
          certificationCourseId,
          versionId: droitCertificationVersion.id,
        });

        await databaseBuilder.commit();
      });

      it('should persist an auto-jury comment REJECTED_PIX_PLUS_NOT_OBTAINED on the assessment result', async function () {
        // given
        const event = new CertificationCompletedJob({
          certificationCourseId,
          locale: FRENCH_SPOKEN,
        });

        // when
        await usecases.scoreV3Certification({ certificationCourseId, event });

        // then
        const results = await knex('assessment-results').where({ assessmentId: completedCertificationAssessmentId });
        expect(results).to.have.lengthOf(1);
        expect(results[0].commentByAutoJury).to.equal('REJECTED_PIX_PLUS_NOT_OBTAINED');
        expect(results[0].reachedMeshIndex).to.be.null;
        expect(results[0].status).to.equal('rejected');
      });
    },
  );

  context('when certification is a Double Certification', function () {
    let certifiableUserId,
      certificationCourseId,
      completedCertificationAssessmentId,
      complementaryCertificationBadgeId,
      complementaryCertificationCourseId;

    beforeEach(async function () {
      const limitDate = new Date('2020-01-01T00:00:00Z');
      certifiableUserId = databaseBuilder.factory.buildUser().id;

      const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification.clea({});

      const badgeId = databaseBuilder.factory.buildBadge({ isCertifiable: true }).id;
      complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId,
        complementaryCertificationId: cleaComplementaryCertification.id,
      }).id;

      databaseBuilder.factory.buildBadgeAcquisition({
        userId: certifiableUserId,
        badgeId,
        createdAt: new Date('2020-01-01'),
      });

      const session = databaseBuilder.factory.buildSession({
        version: AlgorithmEngineVersion.V3,
      });

      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId: session.id,
        userId: certifiableUserId,
      }).id;

      certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
        userId: certifiableUserId,
        createdAt: limitDate,
        version: AlgorithmEngineVersion.V3,
        candidateId,
        versionId: certificationVersionId,
        framework: Frameworks.CLEA,
      }).id;

      complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
        certificationCourseId,
        complementaryCertificationBadgeId,
        complementaryCertificationId: cleaComplementaryCertification.id,
      }).id;

      completedCertificationAssessmentId = databaseBuilder.factory.buildAssessment({
        certificationCourseId,
        userId: certifiableUserId,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CERTIFICATION,
        createdAt: limitDate,
      }).id;

      _buildValidAnswersAndCertificationChallenges({
        assessmentId: completedCertificationAssessmentId,
        certificationCourseId,
        versionId: certificationVersionId,
      });

      await databaseBuilder.commit();
    });

    it('should acquire the double certification', async function () {
      // given
      const event = new CertificationCompletedJob({
        certificationCourseId,
        locale: FRENCH_SPOKEN,
      });

      // when
      await usecases.scoreV3Certification({ certificationCourseId, event });

      // then
      const results = await knex('assessment-results').where({ assessmentId: completedCertificationAssessmentId });
      expect(results).to.have.lengthOf(1);

      const linkToCertifCourse = await knex('certification-courses-last-assessment-results')
        .where({
          lastAssessmentResultId: results[0].id,
          certificationCourseId: certificationCourseId,
        })
        .first();
      expect(linkToCertifCourse).to.deep.equal({
        lastAssessmentResultId: results[0].id,
        certificationCourseId: certificationCourseId,
      });

      const certificationChallengeCapacities = await knex('certification-challenge-capacities').whereIn(
        'certificationChallengeId',
        knex('certification-challenges').select('id').where({ courseId: certificationCourseId }),
      );
      expect(certificationChallengeCapacities).to.have.lengthOf(10);

      const complementaryResults = await knex('complementary-certification-course-results').where({
        complementaryCertificationCourseId,
        complementaryCertificationBadgeId,
      });
      expect(complementaryResults).to.have.lengthOf(1);
      expect(complementaryResults[0].acquired).to.be.true;
      const competenceMarks = await knex('competence-marks').where({ assessmentResultId: results[0].id });
      expect(competenceMarks).to.have.lengthOf(1);
      expect(competenceMarks[0].assessmentResultId).to.equal(results[0].id);
    });

    it('should rollback scoring if any error happens', async function () {
      // given
      const event = new CertificationCompletedJob({
        certificationCourseId,
        locale: FRENCH_SPOKEN,
      });

      // when
      const errorDuringTransaction = await catchErr(async () => {
        await DomainTransaction.execute(async () => {
          await usecases.scoreV3Certification({ certificationCourseId, event });
          throw new Error('test error');
        });
      })();

      // then
      expect(errorDuringTransaction.message).to.equal('test error');

      const noScoring = await knex('assessment-results').where({
        assessmentId: completedCertificationAssessmentId,
      });
      expect(noScoring).to.have.lengthOf(0);

      const noResultForCertifCourse = await knex('certification-courses-last-assessment-results')
        .where({
          certificationCourseId: certificationCourseId,
        })
        .first();
      expect(noResultForCertifCourse).not.to.exist;

      const noCertificationChallengeCapacities = await knex('certification-challenge-capacities').whereIn(
        'certificationChallengeId',
        knex('certification-challenges').select('id').where({ courseId: certificationCourseId }),
      );
      expect(noCertificationChallengeCapacities).to.have.lengthOf(0);

      const noComplementaryScoring = await knex('complementary-certification-course-results').where({
        complementaryCertificationCourseId,
        complementaryCertificationBadgeId,
      });
      expect(noComplementaryScoring).to.have.lengthOf(0);
      const noCompetenceMarks = await knex('competence-marks').whereIn(
        'assessmentResultId',
        knex('assessment-results').select('id').where({ assessmentId: completedCertificationAssessmentId }),
      );
      expect(noCompetenceMarks).to.have.lengthOf(0);
    });
  });
});

function _buildValidAnswersAndCertificationChallenges({ certificationCourseId, assessmentId, versionId }) {
  for (let iCompetence = 0; iCompetence < 5; iCompetence++) {
    for (let i = 0; i < 2; ++i) {
      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        challengeId: `recChallenge${iCompetence}_${i}_0`,
        versionId,
        discriminant: challengeParams.delta,
        difficulty: challengeParams.alpha,
      });
      databaseBuilder.factory.buildAnswer({
        challengeId: `recChallenge${iCompetence}_${i}_0`,
        result: 'ok',
        assessmentId: assessmentId,
      });
      databaseBuilder.factory.buildCertificationChallenge({
        challengeId: `recChallenge${iCompetence}_${i}_0`,
        courseId: certificationCourseId,
        discriminant: challengeParams.delta,
        difficulty: challengeParams.alpha,
      });
    }
  }
}

function _buildInvalidAnswersAndCertificationChallenges({ assessmentId, certificationCourseId, versionId }) {
  for (let iCompetence = 0; iCompetence < 5; iCompetence++) {
    for (let i = 0; i < 2; ++i) {
      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        challengeId: `recChallenge${iCompetence}_${i}_0`,
        versionId,
        discriminant: -8,
        difficulty: -8,
      });
      databaseBuilder.factory.buildAnswer({
        challengeId: `recChallenge${iCompetence}_${i}_0`,
        result: 'ko',
        assessmentId: assessmentId,
      });
      databaseBuilder.factory.buildCertificationChallenge({
        challengeId: `recChallenge${iCompetence}_${i}_0`,
        courseId: certificationCourseId,
        discriminant: challengeParams.delta,
        difficulty: challengeParams.alpha,
      });
    }
  }
}
