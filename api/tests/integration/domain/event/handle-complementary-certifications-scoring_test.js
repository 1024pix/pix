import { expect, databaseBuilder, knex, sinon, mockLearningContent } from '../../../test-helper.js';
import _ from 'lodash';

import { handleComplementaryCertificationsScoring } from '../../../../lib/domain/events/handle-complementary-certifications-scoring.js';
import * as assessmentResultRepository from '../../../../src/shared/infrastructure/repositories/assessment-result-repository.js';
import * as certificationCourseRepository from '../../../../src/certification/shared/infrastructure/repositories/certification-course-repository.js';
import * as certificationAssessmentRepository from '../../../../src/certification/shared/infrastructure/repositories/certification-assessment-repository.js';
import * as complementaryCertificationCourseResultRepository from '../../../../lib/infrastructure/repositories/complementary-certification-course-result-repository.js';
import * as complementaryCertificationScoringCriteriaRepository from '../../../../lib/infrastructure/repositories/complementary-certification-scoring-criteria-repository.js';
import * as complementaryCertificationBadgesRepository from '../../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-badge-repository.js';
import { CertificationScoringCompleted } from '../../../../lib/domain/events/CertificationScoringCompleted.js';
import { config as settings } from '../../../../src/shared/config.js';
import { AnswerStatus } from '../../../../src/shared/domain/models/AnswerStatus.js';

describe('Integration | Event | Handle Complementary Certifications Scoring', function () {
  describe('#handleComplementaryCertificationsScoring', function () {
    afterEach(async function () {
      await knex('complementary-certification-course-results').delete();
    });

    describe('when the candidate has not taken a complementary certification', function () {
      it('should save nothing', async function () {
        // given
        databaseBuilder.factory.buildUser({ id: 51 });
        databaseBuilder.factory.buildCertificationCourse({ id: 21, userId: 51 });
        const event = new CertificationScoringCompleted({
          certificationCourseId: 21,
          userId: 51,
          reproducibilityRate: 99,
        });

        await databaseBuilder.commit();

        // when
        await handleComplementaryCertificationsScoring({
          event,
          assessmentResultRepository,
          certificationAssessmentRepository,
          complementaryCertificationCourseResultRepository,
          complementaryCertificationScoringCriteriaRepository,
          certificationCourseRepository,
        });

        // then
        const complementaryCertificationCourseResults = await knex(
          'complementary-certification-course-results',
        ).select();
        expect(complementaryCertificationCourseResults).to.be.empty;
      });
    });

    describe('when the candidate has taken a complementary certification', function () {
      describe('when it is acquired', function () {
        it('should save a result', async function () {
          // given
          const complementaryCertificationCourseId = 99;

          _buildComplementaryCertificationBadge({
            complementaryCertificationId: 101,
            complementaryCertificationBadgeId: 501,
            minimumReproducibilityRate: 80,
            minimumEarnedPix: 500,
            hasComplementaryReferential: false,
          });
          _buildComplementaryCertificationCourse({
            certificationCourseId: 900,
            complementaryCertificationId: 101,
            complementaryCertificationCourseId,
            complementaryCertificationBadgeId: 501,
            userId: 401,
            pixScore: 700,
            reproducibilityRate: 90,
          });

          await databaseBuilder.commit();
          const event = new CertificationScoringCompleted({
            certificationCourseId: 900,
            userId: 401,
          });

          // when
          await handleComplementaryCertificationsScoring({
            event,
            assessmentResultRepository,
            certificationAssessmentRepository,
            complementaryCertificationCourseResultRepository,
            complementaryCertificationScoringCriteriaRepository,
            certificationCourseRepository,
          });

          // then
          const complementaryCertificationCourseResults = await knex('complementary-certification-course-results')
            .select()
            .first();

          expect(_.omit(complementaryCertificationCourseResults, ['id'])).to.deep.equal({
            acquired: true,
            complementaryCertificationCourseId,
            complementaryCertificationBadgeId: 501,
            source: 'PIX',
          });
        });

        describe('when it has been rejected for fraud', function () {
          it('should save a complementary certification not acquired', async function () {
            // given
            const complementaryCertificationCourseId = 99;

            _buildComplementaryCertificationBadge({
              complementaryCertificationId: 101,
              complementaryCertificationBadgeId: 501,
              minimumReproducibilityRate: 80,
              minimumEarnedPix: 500,
              hasComplementaryReferential: false,
            });
            _buildComplementaryCertificationCourse({
              certificationCourseId: 900,
              complementaryCertificationId: 101,
              complementaryCertificationCourseId,
              complementaryCertificationBadgeId: 501,
              userId: 401,
              pixScore: 700,
              reproducibilityRate: 90,
              isRejectedForFraud: true,
            });

            await databaseBuilder.commit();

            const event = new CertificationScoringCompleted({
              certificationCourseId: 900,
              userId: 401,
            });

            // when
            await handleComplementaryCertificationsScoring({
              event,
              assessmentResultRepository,
              certificationAssessmentRepository,
              complementaryCertificationCourseResultRepository,
              complementaryCertificationScoringCriteriaRepository,
              certificationCourseRepository,
            });
            // then
            const complementaryCertificationCourseResults = await knex('complementary-certification-course-results')
              .select()
              .first();

            expect(_.omit(complementaryCertificationCourseResults, ['id', 'partnerKey'])).to.deep.equal({
              acquired: false,
              complementaryCertificationCourseId,
              complementaryCertificationBadgeId: 501,
              source: 'PIX',
            });
          });
        });
      });

      describe('when the feature toggle FT_ENABLE_PIX_PLUS_LOWER_LEVEL is enabled', function () {
        beforeEach(function () {
          sinon.stub(settings.featureToggles, 'isPixPlusLowerLeverEnabled').value(true);
          const learningContent = {
            challenges: [
              {
                id: 'recCompetence0_Tube1_Skill1_Challenge1',
                competenceId: 'recCompetence0',
              },
              {
                id: 'recCompetence0_Tube1_Skill2_Challenge2',
                competenceId: 'recCompetence0',
              },
              {
                id: 'recCompetence0_Tube1_Skill2_Challenge3',
                competenceId: 'recCompetence0',
              },
            ],
          };

          mockLearningContent(learningContent);
        });

        describe('when the lower level is acquired', function () {
          it('should save a result', async function () {
            // given
            const complementaryCertificationCourseId = 99;
            const assessmentId = 123;

            _buildComplementaryCertificationBadges({
              complementaryCertificationId: 101,
              minimumReproducibilityRate: 80,
              minimumEarnedPix: 500,
              hasComplementaryReferential: true,
            });

            _buildComplementaryCertificationCourse({
              certificationCourseId: 900,
              complementaryCertificationId: 101,
              complementaryCertificationCourseId,
              complementaryCertificationBadgeId: 501,
              userId: 401,
              pixScore: 450,
              reproducibilityRate: 65,
              assessmentId,
            });

            const certificationChallengeKo = databaseBuilder.factory.buildCertificationChallenge({
              courseId: 900,
              isNeutralized: false,
              challengeId: 'recCompetence0_Tube1_Skill1_Challenge1',
              competenceId: 'recCompetence0',
              certifiableBadgeKey: 'badge_key_1',
            });
            databaseBuilder.factory.buildAnswer({
              assessmentId,
              challengeId: certificationChallengeKo.challengeId,
              result: AnswerStatus.KO.status,
            });

            const { challengeId: challengeId1 } = databaseBuilder.factory.buildCertificationChallenge({
              courseId: 900,
              isNeutralized: false,
              challengeId: 'recCompetence0_Tube1_Skill2_Challenge2',
              competenceId: 'recCompetence0',
              certifiableBadgeKey: 'badge_key_1',
            });
            databaseBuilder.factory.buildAnswer({
              assessmentId,
              challengeId: challengeId1,
              result: AnswerStatus.OK.status,
            });

            const { challengeId: challengeId2 } = databaseBuilder.factory.buildCertificationChallenge({
              courseId: 900,
              isNeutralized: false,
              challengeId: 'recCompetence0_Tube1_Skill2_Challenge3',
              competenceId: 'recCompetence0',
              certifiableBadgeKey: 'badge_key_1',
            });
            databaseBuilder.factory.buildAnswer({
              assessmentId,
              challengeId: challengeId2,
              result: AnswerStatus.OK.status,
            });

            await databaseBuilder.commit();

            const event = new CertificationScoringCompleted({
              certificationCourseId: 900,
              userId: 401,
            });

            // when
            await handleComplementaryCertificationsScoring({
              event,
              assessmentResultRepository,
              certificationAssessmentRepository,
              complementaryCertificationCourseResultRepository,
              complementaryCertificationScoringCriteriaRepository,
              complementaryCertificationBadgesRepository,
              certificationCourseRepository,
            });

            // then
            const complementaryCertificationCourseResults = await knex('complementary-certification-course-results')
              .select()
              .first();

            expect(_.omit(complementaryCertificationCourseResults, ['id'])).to.deep.equal({
              acquired: true,
              complementaryCertificationCourseId,
              complementaryCertificationBadgeId: 401,
              source: 'PIX',
            });
          });
        });
      });
    });
  });
});

function _buildComplementaryCertificationCourse({
  certificationCourseId,
  complementaryCertificationId,
  complementaryCertificationBadgeId,
  complementaryCertificationCourseId,
  userId,
  pixScore,
  reproducibilityRate,
  isRejectedForFraud = false,
  assessmentId = undefined,
}) {
  databaseBuilder.factory.buildUser({ id: userId });
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationCourseId,
    userId,
    isRejectedForFraud,
  });
  databaseBuilder.factory.buildComplementaryCertificationCourse({
    id: complementaryCertificationCourseId,
    certificationCourseId,
    complementaryCertificationId,
    complementaryCertificationBadgeId,
  });
  if (assessmentId) {
    databaseBuilder.factory.buildAssessment({
      id: assessmentId,
      certificationCourseId,
    });
  }
  databaseBuilder.factory.buildAssessmentResult({
    certificationCourseId,
    pixScore,
    reproducibilityRate,
    assessmentId,
  });
}

function _buildComplementaryCertificationBadge({
  complementaryCertificationBadgeId,
  complementaryCertificationId,
  minimumReproducibilityRate,
  minimumEarnedPix,
  hasComplementaryReferential,
  targetProfileId,
  level,
}) {
  databaseBuilder.factory.buildComplementaryCertification({
    id: complementaryCertificationId,
    minimumReproducibilityRate,
    hasComplementaryReferential,
  });
  const { id: badgeId } = databaseBuilder.factory.buildBadge({
    key: 'badge_key',
    isCertifiable: true,
    targetProfileId,
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: complementaryCertificationBadgeId,
    complementaryCertificationId,
    badgeId,
    minimumEarnedPix,
    level,
  });
}

function _buildComplementaryCertificationBadges({
  minimumReproducibilityRate,
  minimumEarnedPix,
  hasComplementaryReferential,
  complementaryCertificationId,
}) {
  databaseBuilder.factory.buildTargetProfile({ id: 1 });
  databaseBuilder.factory.buildComplementaryCertification({
    id: complementaryCertificationId,
    minimumReproducibilityRate,
    hasComplementaryReferential,
  });
  const { id: badgeId1 } = databaseBuilder.factory.buildBadge({
    key: 'badge_key_1',
    isCertifiable: true,
    targetProfileId: 1,
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: 501,
    complementaryCertificationId: complementaryCertificationId,
    badgeId: badgeId1,
    minimumEarnedPix,
    level: 3,
  });
  const { id: badgeId2 } = databaseBuilder.factory.buildBadge({
    key: 'badge_key_2',
    isCertifiable: true,
    targetProfileId: 1,
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: 401,
    complementaryCertificationId: complementaryCertificationId,
    badgeId: badgeId2,
    minimumEarnedPix: 400,
    level: 2,
  });
}
