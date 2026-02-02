import { CertificationCompletedJob } from '../../../../../../src/certification/evaluation/domain/events/CertificationCompleted.js';
import { usecases } from '../../../../../../src/certification/evaluation/domain/usecases/index.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { FRENCH_SPOKEN } from '../../../../../../src/shared/domain/services/locale-service.js';
import {
  catchErr,
  databaseBuilder,
  expect,
  knex,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../../test-helper.js';

const challengeParams = {
  alpha: 1,
  delta: -3,
  langues: ['Franco Français'],
};

describe('Certification | Evaluation | Integration | Domain | Usecases | Scoring V3', function () {
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
        ],
      },
    ];
    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    await mockLearningContent(learningContentObjects);

    certificationVersionId = databaseBuilder.factory.buildCertificationVersion({
      challengesConfiguration: { maximumAssessmentLength: 8 },
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

      databaseBuilder.factory.buildCertificationCandidate({
        sessionId: session.id,
        userId: certifiableUserId,
      });

      certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        completedAt: null,
        sessionId: session.id,
        userId: certifiableUserId,
        createdAt: limitDate,
        version: AlgorithmEngineVersion.V3,
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

    it('should score the certification', async function () {
      // given
      const event = new CertificationCompletedJob({
        assessmentId: completedCertificationAssessmentId,
        userId: certifiableUserId,
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

      const certifCourseCompletedAt = await knex('certification-courses')
        .select('completedAt')
        .where({
          id: certificationCourseId,
        })
        .first();

      expect(certifCourseCompletedAt).not.to.be.null;
      const competenceMarks = await knex('competence-marks').where({ assessmentResultId: results[0].id });
      expect(competenceMarks).to.have.lengthOf(1);
      expect(competenceMarks[0].assessmentResultId).to.equal(results[0].id);

      const certificationChallengeCapacities = await knex('certification-challenge-capacities').whereIn(
        'certificationChallengeId',
        knex('certification-challenges').select('id').where({ courseId: certificationCourseId }),
      );
      expect(certificationChallengeCapacities).to.have.lengthOf(8);
    });

    it('should rollback scoring if any error happens', async function () {
      // given
      const event = new CertificationCompletedJob({
        assessmentId: completedCertificationAssessmentId,
        userId: certifiableUserId,
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

      const certifCourseNotUpdated = await knex('certification-courses')
        .select('completedAt')
        .where({
          id: certificationCourseId,
        })
        .first();

      expect(certifCourseNotUpdated.completedAt).to.be.null;
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

      databaseBuilder.factory.buildCertificationCandidate({
        sessionId: session.id,
        userId: certifiableUserId,
      });

      certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        completedAt: null,
        sessionId: session.id,
        userId: certifiableUserId,
        createdAt: limitDate,
        version: AlgorithmEngineVersion.V3,
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
        assessmentId: completedCertificationAssessmentId,
        userId: certifiableUserId,
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

      const certifCourseCompletedAt = await knex('certification-courses')
        .select('completedAt')
        .where({
          id: certificationCourseId,
        })
        .first();

      expect(certifCourseCompletedAt).not.to.be.null;
      const certificationChallengeCapacities = await knex('certification-challenge-capacities').whereIn(
        'certificationChallengeId',
        knex('certification-challenges').select('id').where({ courseId: certificationCourseId }),
      );
      expect(certificationChallengeCapacities).to.have.lengthOf(8);

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
        assessmentId: completedCertificationAssessmentId,
        userId: certifiableUserId,
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

      const certifCourseNotUpdated = await knex('certification-courses')
        .select('completedAt')
        .where({
          id: certificationCourseId,
        })
        .first();

      expect(certifCourseNotUpdated.completedAt).to.be.null;
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
  for (let iCompetence = 0; iCompetence < 4; iCompetence++) {
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
