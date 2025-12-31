import range from 'lodash/range.js';

import { scoreComplementaryCertificationV2 } from '../../../../../../../src/certification/evaluation/domain/services/scoring/score-complementary-certification-v2.js';
import { ComplementaryCertificationCourseResult } from '../../../../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { SCOPES } from '../../../../../../../src/certification/shared/domain/models/Scopes.js';
import { status as assessmentResultStatuses } from '../../../../../../../src/shared/domain/models/AssessmentResult.js';
import { domainBuilder, expect, sinon } from '../../../../../../test-helper.js';

describe('Certification | Evaluation | Unit | Domain | Services | Scoring Complementary Certification V2', function () {
  const certificationAssessmentRepository = {};
  const complementaryCertificationCourseResultRepository = {};
  const assessmentResultRepository = {};
  const complementaryCertificationScoringCriteriaRepository = {};
  const certificationCourseRepository = {};
  const complementaryCertificationBadgesRepository = {};
  const complementaryCertificationRepository = {};
  const certificationCandidateRepository = {};

  const dependencies = {
    certificationAssessmentRepository,
    complementaryCertificationCourseResultRepository,
    assessmentResultRepository,
    complementaryCertificationScoringCriteriaRepository,
    certificationCourseRepository,
    complementaryCertificationBadgesRepository,
    complementaryCertificationRepository,
    certificationCandidateRepository,
  };

  beforeEach(function () {
    complementaryCertificationCourseResultRepository.save = sinon.stub();
    certificationAssessmentRepository.getByCertificationCourseId = sinon.stub();
    assessmentResultRepository.getByCertificationCourseId = sinon.stub();
    assessmentResultRepository.updateToAcquiredLowerLevelComplementaryCertification = sinon.stub();
    complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId = sinon.stub();
    certificationCourseRepository.get = sinon.stub();
    complementaryCertificationBadgesRepository.getAllWithSameTargetProfile = sinon.stub();
    complementaryCertificationRepository.get = sinon.stub();
    certificationCandidateRepository.findByAssessmentId = sinon.stub();
  });

  context('when there is a complementary referential', function () {
    it('should score the complementary certification', async function () {
      // given
      const certificationCourseId = 123;
      const complementaryCertificationId = 456;
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationCourseId,
        userId: 456,
        createdAt: new Date('2020-01-01'),
        certificationChallenges: [
          domainBuilder.buildCertificationChallengeWithType({
            certifiableBadgeKey: 'PIX_PLUS_TEST',
            challengeId: 'chal1',
          }),
        ],
        certificationAnswersByDate: [domainBuilder.buildAnswer.ok({ challengeId: 'chal1' })],
      });

      const complementaryCertificationScoringCriteria =
        domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
          complementaryCertificationCourseId: 999,
          complementaryCertificationBadgeId: 888,
          minimumReproducibilityRate: 70,
          complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
        });

      complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
        .withArgs({
          certificationCourseId,
        })
        .resolves([complementaryCertificationScoringCriteria]);

      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId })
        .resolves(certificationAssessment);

      const assessmentResult = domainBuilder.buildAssessmentResult();
      assessmentResultRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId })
        .resolves(assessmentResult);

      const complementaryCertificationCourse = {
        id: 999,
        complementaryCertificationId,
        certificationCourseId,
        complementaryCertificationBadgeId: 888,
      };

      certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(
        domainBuilder.buildCertificationCourse({
          complementaryCertificationCourse,
        }),
      );

      certificationCandidateRepository.findByAssessmentId
        .withArgs({ assessmentId: assessmentResult.assessmentId })
        .resolves(
          domainBuilder.certification.evaluation.buildCandidate({
            subscriptionScope: SCOPES.PIX_PLUS_DROIT,
          }),
        );

      complementaryCertificationRepository.get
        .withArgs({ id: complementaryCertificationId })
        .resolves({ key: SCOPES.PIX_PLUS_DROIT });

      complementaryCertificationBadgesRepository.getAllWithSameTargetProfile.resolves([
        domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({ id: 888 }),
      ]);

      // when
      await scoreComplementaryCertificationV2({
        ...dependencies,
        complementaryCertificationScoringCriteria,
        certificationCourseId,
      });

      // then
      expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledOnceWithExactly(
        ComplementaryCertificationCourseResult.from({
          complementaryCertificationCourseId: 999,
          complementaryCertificationBadgeId: 888,
          source: ComplementaryCertificationCourseResult.sources.PIX,
          acquired: true,
        }),
      );
    });

    context('n-1 cases listing', function () {
      const level1 = {
        minimumEarnedPix: 50,
        level: 1,
      };
      const level2 = {
        minimumEarnedPix: 90,
        level: 2,
      };
      const level3 = {
        minimumEarnedPix: 110,
        level: 3,
      };

      const pixScoreAboveLevel3 = level3.minimumEarnedPix + 10;
      const pixScoreBetweenLevel2andLevel3 = level3.minimumEarnedPix - 10;
      const pixScoreBelowLevel2 = level2.minimumEarnedPix - 10;
      const pixScoreBelowLevel1 = level1.minimumEarnedPix - 10;

      const reproducibilityRateAboveCurrentLevel = 75;
      const reproducibilityRateBetweenLowerLevelAndCurrentLevel = 65;
      const reproducibilityRateBelowLowerLevel = 55;

      [
        {
          reproducibilityRate: reproducibilityRateAboveCurrentLevel,
          pixScore: pixScoreAboveLevel3,
          pixValidated: true,
          acquiredLevel: 3,
          lowerLevel: level2,
          currentLevel: level3,
          minimumReproducibilityRate: 70,
          minimumReproducibilityRateLowerLevel: 60,
          testName: 'should grant the user the complementary certification at the current level',
        },
        {
          reproducibilityRate: reproducibilityRateBetweenLowerLevelAndCurrentLevel,
          pixScore: pixScoreAboveLevel3,
          pixValidated: true,
          acquiredLevel: 2,
          lowerLevel: level2,
          currentLevel: level3,
          minimumReproducibilityRate: 70,
          minimumReproducibilityRateLowerLevel: 60,
          testName:
            'should grant the lower level when the reproducibility rate is between minimumReproducibilityRateLowerLevel and minimumReproducibilityRate',
        },
        {
          reproducibilityRate: reproducibilityRateAboveCurrentLevel,
          pixScore: pixScoreBetweenLevel2andLevel3,
          pixValidated: true,
          acquiredLevel: 2,
          lowerLevel: level2,
          currentLevel: level3,
          minimumReproducibilityRate: 70,
          minimumReproducibilityRateLowerLevel: 60,
          testName: 'should grant the lower level when the pixScore is between current and lower level minimum score',
        },
        {
          reproducibilityRate: reproducibilityRateBetweenLowerLevelAndCurrentLevel,
          pixScore: pixScoreBetweenLevel2andLevel3,
          pixValidated: true,
          acquiredLevel: 2,
          lowerLevel: level2,
          currentLevel: level3,
          minimumReproducibilityRate: 70,
          minimumReproducibilityRateLowerLevel: 60,
          testName:
            'should grant the lower level when the pixScore is between current and lower level minimum score and the reproducibility rate is between minimumReproducibilityRateLowerLevel and minimumReproducibilityRate',
        },
        {
          reproducibilityRate: reproducibilityRateBetweenLowerLevelAndCurrentLevel,
          pixScore: pixScoreBetweenLevel2andLevel3,
          pixValidated: false,
          acquiredLevel: null,
          lowerLevel: level2,
          currentLevel: level3,
          minimumReproducibilityRate: 70,
          minimumReproducibilityRateLowerLevel: 60,
          testName:
            'should not grant any complementary certification when the pix certification is not validated and the pixScore is between current and lower level minimum score and the reproducibility rate is between minimumReproducibilityRateLowerLevel and minimumReproducibilityRate',
        },
        {
          reproducibilityRate: reproducibilityRateAboveCurrentLevel,
          pixScore: pixScoreBetweenLevel2andLevel3,
          pixValidated: false,
          acquiredLevel: null,
          lowerLevel: level2,
          currentLevel: level3,
          minimumReproducibilityRate: 70,
          minimumReproducibilityRateLowerLevel: 60,
          testName:
            'should not grant any complementary certification when the pix certification is not validated and the pixScore is between current and lower level minimum score and the reproducibility rate is above minimumReproducibilityRate',
        },
        {
          reproducibilityRate: reproducibilityRateBetweenLowerLevelAndCurrentLevel,
          pixScore: pixScoreAboveLevel3,
          pixValidated: false,
          acquiredLevel: null,
          lowerLevel: level2,
          currentLevel: level3,
          minimumReproducibilityRate: 70,
          minimumReproducibilityRateLowerLevel: 60,
          testName:
            'should not grant any complementary certification when the pix certification is not validated and the pixScore is above current and the reproducibility rate is between minimumReproducibilityRateLowerLevel and minimumReproducibilityRate',
        },
        {
          reproducibilityRate: reproducibilityRateAboveCurrentLevel,
          pixScore: pixScoreAboveLevel3,
          pixValidated: false,
          acquiredLevel: null,
          lowerLevel: level2,
          currentLevel: level3,
          minimumReproducibilityRate: 70,
          minimumReproducibilityRateLowerLevel: 60,
          testName:
            'should not grant any complementary certification when the pix certification is not validated and the pixScore and the reproducibility rate are above current level',
        },
        {
          reproducibilityRate: reproducibilityRateBelowLowerLevel,
          pixScore: pixScoreAboveLevel3,
          pixValidated: true,
          acquiredLevel: null,
          lowerLevel: level2,
          currentLevel: level3,
          minimumReproducibilityRate: 70,
          minimumReproducibilityRateLowerLevel: 60,
          testName:
            'should not grant any complementary certification when the pix certification is validated and the pixScore is above current level and the reproducibility rate below lower level',
        },
        {
          reproducibilityRate: reproducibilityRateAboveCurrentLevel,
          pixScore: pixScoreBelowLevel2,
          pixValidated: true,
          acquiredLevel: null,
          lowerLevel: level2,
          currentLevel: level3,
          minimumReproducibilityRate: 70,
          minimumReproducibilityRateLowerLevel: 60,
          testName:
            'should not grant any complementary certification when the pix certification is validated and the pixScore is below lower level and the reproducibility rate is above current level',
        },
        {
          reproducibilityRate: reproducibilityRateAboveCurrentLevel,
          pixScore: pixScoreBelowLevel1,
          pixValidated: true,
          acquiredLevel: null,
          lowerLevel: level2,
          currentLevel: level3,
          minimumReproducibilityRate: 70,
          minimumReproducibilityRateLowerLevel: 60,
          testName:
            'should not grant any complementary certification when the pix certification is validated and the pixScore is below level 1 and the reproducibility rate is above current level',
        },
        {
          reproducibilityRate: reproducibilityRateBelowLowerLevel,
          pixScore: pixScoreBelowLevel2,
          pixValidated: true,
          acquiredLevel: null,
          lowerLevel: level2,
          currentLevel: level3,
          minimumReproducibilityRate: 70,
          minimumReproducibilityRateLowerLevel: 60,
          testName:
            'should not grant any complementary certification when the pix certification is validated and the pixScore is between level 1 and level 2',
        },
        {
          reproducibilityRate: reproducibilityRateAboveCurrentLevel,
          pixScore: pixScoreBelowLevel2,
          pixValidated: false,
          acquiredLevel: null,
          lowerLevel: level2,
          currentLevel: level3,
          minimumReproducibilityRate: 70,
          minimumReproducibilityRateLowerLevel: 60,
          testName:
            'should not grant any complementary certification when the pix certification is rejected and pixScore is below lower level',
        },
        {
          reproducibilityRate: reproducibilityRateBelowLowerLevel,
          pixScore: pixScoreBelowLevel2,
          pixValidated: false,
          acquiredLevel: null,
          lowerLevel: level2,
          currentLevel: level3,
          minimumReproducibilityRate: 70,
          minimumReproducibilityRateLowerLevel: 60,
          testName:
            'should not grant any complementary certification when the pix certification is rejected and the reproducibility rate is below lower level',
        },
      ].forEach(
        ({
          reproducibilityRate,
          pixScore,
          pixValidated,
          acquiredLevel,
          lowerLevel,
          currentLevel,
          minimumReproducibilityRate,
          minimumReproducibilityRateLowerLevel,
          testName,
        }) => {
          it(testName, async function () {
            // given
            const certificationCourseId = 123;
            const { answers, challenges } = _buildAnswersAndChallengesDependingOnReproducibilityRate({
              reproducibilityRate,
              certifiableBadgeKey: 'PIX_PLUS_TEST',
            });

            const certificationAssessment = domainBuilder.buildCertificationAssessment({
              certificationCourseId,
              userId: 456,
              createdAt: new Date('2020-01-01'),
              certificationChallenges: challenges,
              certificationAnswersByDate: answers,
            });

            const availableComplementaryCertificationBadges = [
              domainBuilder.certification.complementaryCertification.buildComplementaryCertificationBadge({
                id: 666,
                level: level1.level,
                minimumEarnedPix: level1.minimumEarnedPix,
              }),
              domainBuilder.certification.complementaryCertification.buildComplementaryCertificationBadge({
                id: 777,
                level: lowerLevel.level,
                minimumEarnedPix: lowerLevel.minimumEarnedPix,
              }),
              domainBuilder.certification.complementaryCertification.buildComplementaryCertificationBadge({
                id: 888,
                level: currentLevel.level,
                minimumEarnedPix: currentLevel.minimumEarnedPix,
              }),
            ];

            const expectedLevelComplementaryCertificationBadge = acquiredLevel
              ? availableComplementaryCertificationBadges.at(acquiredLevel - 1)
              : null;

            const isLowerLevelComplementaryCertificationAcquired = acquiredLevel === lowerLevel.level;

            const complementaryCertificationScoringCriteria =
              domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: 888,
                minimumReproducibilityRate,
                minimumReproducibilityRateLowerLevel,
                minimumEarnedPix: level3.minimumEarnedPix,
                complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
              });
            complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
              .withArgs({
                certificationCourseId,
              })
              .resolves([complementaryCertificationScoringCriteria]);

            complementaryCertificationBadgesRepository.getAllWithSameTargetProfile
              .withArgs(888)
              .resolves(availableComplementaryCertificationBadges);

            certificationAssessmentRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId: 123 })
              .resolves(certificationAssessment);

            const assessmentResult = domainBuilder.buildAssessmentResult({
              pixScore,
              reproducibilityRate,
              status: pixValidated ? assessmentResultStatuses.VALIDATED : assessmentResultStatuses.REJECTED,
            });

            const evaluationCandidate = domainBuilder.certification.evaluation.buildCandidate({
              subscriptionScope: SCOPES.PIX_PLUS_DROIT,
            });

            certificationCandidateRepository.findByAssessmentId
              .withArgs({ assessmentId: assessmentResult.assessmentId })
              .resolves(evaluationCandidate);

            assessmentResultRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId })
              .resolves(assessmentResult);

            const complementaryCertificationId = 456;
            const complementaryCertificationCourse = {
              id: 999,
              complementaryCertificationId,
              certificationCourseId,
              complementaryCertificationBadgeId: 888,
            };

            certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(
              domainBuilder.buildCertificationCourse({
                complementaryCertificationCourse,
              }),
            );

            complementaryCertificationRepository.get
              .withArgs({ id: complementaryCertificationId })
              .resolves({ key: SCOPES.PIX_PLUS_DROIT });

            // when
            await scoreComplementaryCertificationV2({
              ...dependencies,
              certificationCourseId,
              complementaryCertificationScoringCriteria,
            });

            // then
            if (isLowerLevelComplementaryCertificationAcquired) {
              expect(
                assessmentResultRepository.updateToAcquiredLowerLevelComplementaryCertification,
              ).to.have.been.calledOnceWithExactly({ id: assessmentResult.id });
            }

            expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledOnceWithExactly(
              ComplementaryCertificationCourseResult.from({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: expectedLevelComplementaryCertificationBadge?.id || 888,
                source: ComplementaryCertificationCourseResult.sources.PIX,
                acquired: Boolean(acquiredLevel),
              }),
            );
          });
        },
      );
    });

    context('scoring', function () {
      context('when pix certification is not validated', function () {
        it('should save a "not acquired" complementary certification', async function () {
          // given
          const certificationCourseId = 123;
          const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'chal1',
            certifiableBadgeKey: 'PIX_PLUS_TEST',
          });
          const certificationAnswer = domainBuilder.buildAnswer.ok({ challengeId: 'chal1' });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationCourseId,
            userId: 456,
            createdAt: new Date('2020-01-01'),
            certificationChallenges: [certificationChallenge],
            certificationAnswersByDate: [certificationAnswer],
          });
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationAssessment);

          const assessmentResult = domainBuilder.buildAssessmentResult.rejected();
          assessmentResultRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(assessmentResult);

          certificationCandidateRepository.findByAssessmentId
            .withArgs({ assessmentId: assessmentResult.assessmentId })
            .resolves(
              domainBuilder.certification.evaluation.buildCandidate({
                subscriptionScope: SCOPES.PIX_PLUS_DROIT,
              }),
            );

          const complementaryCertificationId = 456;
          const complementaryCertificationCourse = {
            id: 999,
            complementaryCertificationId,
            certificationCourseId,
            complementaryCertificationBadgeId: 888,
          };

          certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(
            domainBuilder.buildCertificationCourse({
              complementaryCertificationCourse,
            }),
          );

          complementaryCertificationRepository.get
            .withArgs({ id: complementaryCertificationId })
            .resolves({ key: SCOPES.PIX_PLUS_DROIT });

          complementaryCertificationBadgesRepository.getAllWithSameTargetProfile.resolves([
            domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({ id: 888 }),
          ]);

          const complementaryCertificationScoringCriteria =
            domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              minimumReproducibilityRate: 100,
              complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
            });

          complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
            .withArgs({
              certificationCourseId,
            })
            .resolves([complementaryCertificationScoringCriteria]);
          // when
          await scoreComplementaryCertificationV2({
            ...dependencies,
            certificationCourseId,
            complementaryCertificationScoringCriteria,
          });

          // then
          expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
            ComplementaryCertificationCourseResult.from({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              source: ComplementaryCertificationCourseResult.sources.PIX,
              acquired: false,
            }),
          );
        });
      });

      context('when pix certification is validated', function () {
        context('when reproducibility rate is not sufficient', function () {
          it('should save a "not acquired" complementary certification', async function () {
            // given
            const certificationCourseId = 123;
            const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
              challengeId: 'chal1',
              certifiableBadgeKey: 'PIX_PLUS_TEST',
            });
            const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
              challengeId: 'chal2',
              certifiableBadgeKey: 'PIX_PLUS_TEST',
            });
            const certificationAnswer1 = domainBuilder.buildAnswer.ko({ challengeId: 'chal1' });
            const certificationAnswer2 = domainBuilder.buildAnswer.ok({ challengeId: 'chal2' });
            const certificationAssessment = domainBuilder.buildCertificationAssessment({
              certificationCourseId,
              userId: 456,
              createdAt: new Date('2020-01-01'),
              certificationChallenges: [certificationChallenge1, certificationChallenge2],
              certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
            });

            const complementaryCertificationId = 456;
            const complementaryCertificationCourse = {
              id: 999,
              complementaryCertificationId,
              certificationCourseId,
              complementaryCertificationBadgeId: 888,
            };

            certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(
              domainBuilder.buildCertificationCourse({
                complementaryCertificationCourse,
              }),
            );

            complementaryCertificationRepository.get
              .withArgs({ id: complementaryCertificationId })
              .resolves({ key: SCOPES.PIX_PLUS_DROIT });

            const complementaryCertificationScoringCriteria =
              domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: 888,
                minimumReproducibilityRate: 75,
                minimumReproducibilityRateLowerLevel: 75,
                complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
              });
            complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
              .withArgs({
                certificationCourseId: 123,
              })
              .resolves([complementaryCertificationScoringCriteria]);
            certificationAssessmentRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId: 123 })
              .resolves(certificationAssessment);

            const assessmentResult = domainBuilder.buildAssessmentResult.validated();
            assessmentResultRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId: 123 })
              .resolves(assessmentResult);

            certificationCandidateRepository.findByAssessmentId
              .withArgs({ assessmentId: assessmentResult.assessmentId })
              .resolves(
                domainBuilder.certification.evaluation.buildCandidate({
                  subscriptionScope: SCOPES.PIX_PLUS_DROIT,
                }),
              );

            complementaryCertificationBadgesRepository.getAllWithSameTargetProfile.resolves([
              domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({ id: 888 }),
            ]);

            // when
            await scoreComplementaryCertificationV2({
              ...dependencies,
              certificationCourseId,
              complementaryCertificationScoringCriteria,
            });

            // then
            expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
              ComplementaryCertificationCourseResult.from({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: 888,
                source: ComplementaryCertificationCourseResult.sources.PIX,
                acquired: false,
              }),
            );
          });
        });

        context('when reproducibility rate is sufficient', function () {
          it('should save an "acquired" complementary certification', async function () {
            // given
            const certificationCourseId = 123;
            const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
              challengeId: 'chal1',
              certifiableBadgeKey: 'PIX_PLUS_TEST',
            });
            const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
              challengeId: 'chal2',
              certifiableBadgeKey: 'PIX_PLUS_TEST',
            });
            const certificationAnswer1 = domainBuilder.buildAnswer.ok({ challengeId: 'chal1' });
            const certificationAnswer2 = domainBuilder.buildAnswer.ok({ challengeId: 'chal2' });
            const certificationAssessment = domainBuilder.buildCertificationAssessment({
              certificationCourseId,
              userId: 456,
              createdAt: new Date('2020-01-01'),
              certificationChallenges: [certificationChallenge1, certificationChallenge2],
              certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
            });

            const complementaryCertificationScoringCriteria =
              domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: 888,
                minimumReproducibilityRate: 75,
                complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
              });
            complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
              .withArgs({
                certificationCourseId,
              })
              .resolves([complementaryCertificationScoringCriteria]);

            const complementaryCertificationId = 456;
            const complementaryCertificationCourse = {
              id: 999,
              complementaryCertificationId,
              certificationCourseId,
              complementaryCertificationBadgeId: 888,
            };

            certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(
              domainBuilder.buildCertificationCourse({
                complementaryCertificationCourse,
              }),
            );

            complementaryCertificationRepository.get
              .withArgs({ id: complementaryCertificationId })
              .resolves({ key: SCOPES.PIX_PLUS_DROIT });

            certificationAssessmentRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId })
              .resolves(certificationAssessment);

            const assessmentResult = domainBuilder.buildAssessmentResult.validated();
            assessmentResultRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId })
              .resolves(assessmentResult);

            certificationCandidateRepository.findByAssessmentId
              .withArgs({ assessmentId: assessmentResult.assessmentId })
              .resolves(
                domainBuilder.certification.evaluation.buildCandidate({
                  subscriptionScope: SCOPES.PIX_PLUS_DROIT,
                }),
              );

            complementaryCertificationBadgesRepository.getAllWithSameTargetProfile.resolves([
              domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({ id: 888 }),
            ]);

            // when
            await scoreComplementaryCertificationV2({
              ...dependencies,
              certificationCourseId,
              complementaryCertificationScoringCriteria,
            });

            // then

            expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
              ComplementaryCertificationCourseResult.from({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: 888,
                source: ComplementaryCertificationCourseResult.sources.PIX,
                acquired: true,
              }),
            );
          });
        });

        context('when reproducibility rate is not sufficient for current level', function () {
          context('reproducibility rate is sufficient for lower level', function () {
            context('when there is a lower badge', function () {
              it('should save an "acquired" complementary certification with lower level badge', async function () {
                // given
                const certificationCourseId = 123;
                const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
                  challengeId: 'chal1',
                  certifiableBadgeKey: 'PIX_PLUS_TEST',
                });
                const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
                  challengeId: 'chal2',
                  certifiableBadgeKey: 'PIX_PLUS_TEST',
                });
                const certificationChallenge3 = domainBuilder.buildCertificationChallengeWithType({
                  challengeId: 'chal3',
                  certifiableBadgeKey: 'PIX_PLUS_TEST',
                });
                const certificationAnswer1 = domainBuilder.buildAnswer.ok({ challengeId: 'chal1' });
                const certificationAnswer2 = domainBuilder.buildAnswer.ok({ challengeId: 'chal2' });
                const certificationAnswer3 = domainBuilder.buildAnswer.uncorrected({ challengeId: 'chal3' });
                const certificationAssessment = domainBuilder.buildCertificationAssessment({
                  certificationCourseId,
                  userId: 456,
                  createdAt: new Date('2020-01-01'),
                  certificationChallenges: [certificationChallenge1, certificationChallenge2, certificationChallenge3],
                  certificationAnswersByDate: [certificationAnswer1, certificationAnswer2, certificationAnswer3],
                });

                const complementaryCertificationScoringCriteria =
                  domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
                    complementaryCertificationCourseId: 999,
                    complementaryCertificationBadgeId: 888,
                    minimumReproducibilityRate: 75,
                    complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                    minimumEarnedPix: 60,
                    minimumReproducibilityRateLowerLevel: 60,
                    complementaryCertificationId: 123,
                  });
                complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
                  .withArgs({
                    certificationCourseId,
                  })
                  .resolves([complementaryCertificationScoringCriteria]);

                const complementaryCertificationId = 456;
                const complementaryCertificationCourse = {
                  id: 999,
                  complementaryCertificationId,
                  certificationCourseId,
                  complementaryCertificationBadgeId: 888,
                };

                certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(
                  domainBuilder.buildCertificationCourse({
                    complementaryCertificationCourse,
                  }),
                );

                complementaryCertificationRepository.get
                  .withArgs({ id: complementaryCertificationId })
                  .resolves({ key: SCOPES.PIX_PLUS_DROIT });

                complementaryCertificationBadgesRepository.getAllWithSameTargetProfile.withArgs(888).resolves([
                  domainBuilder.certification.complementaryCertification.buildComplementaryCertificationBadge({
                    id: 777,
                    level: 1,
                    minimumEarnedPix: 50,
                  }),
                  domainBuilder.certification.complementaryCertification.buildComplementaryCertificationBadge({
                    id: 888,
                    level: 2,
                    minimumEarnedPix: 60,
                  }),
                ]);
                certificationAssessmentRepository.getByCertificationCourseId
                  .withArgs({ certificationCourseId })
                  .resolves(certificationAssessment);

                const assessmentResult = domainBuilder.buildAssessmentResult.validated({ pixScore: 50 });
                assessmentResultRepository.getByCertificationCourseId
                  .withArgs({ certificationCourseId })
                  .resolves(assessmentResult);

                certificationCandidateRepository.findByAssessmentId
                  .withArgs({ assessmentId: assessmentResult.assessmentId })
                  .resolves(
                    domainBuilder.certification.evaluation.buildCandidate({
                      subscriptionScope: SCOPES.PIX_PLUS_DROIT,
                    }),
                  );

                // when
                await scoreComplementaryCertificationV2({
                  ...dependencies,
                  certificationCourseId,
                  complementaryCertificationScoringCriteria,
                });

                // then

                expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
                  ComplementaryCertificationCourseResult.from({
                    complementaryCertificationCourseId: 999,
                    complementaryCertificationBadgeId: 777,
                    source: ComplementaryCertificationCourseResult.sources.PIX,
                    acquired: true,
                  }),
                );
              });
            });

            context('when there is no lower badge', function () {
              it('should save an  not "acquired" complementary certification with current badge', async function () {
                // given
                const certificationCourseId = 123;
                const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
                  challengeId: 'chal1',
                  certifiableBadgeKey: 'PIX_PLUS_TEST',
                });
                const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
                  challengeId: 'chal2',
                  certifiableBadgeKey: 'PIX_PLUS_TEST',
                });
                const certificationChallenge3 = domainBuilder.buildCertificationChallengeWithType({
                  challengeId: 'chal3',
                  certifiableBadgeKey: 'PIX_PLUS_TEST',
                });
                const certificationAnswer1 = domainBuilder.buildAnswer.ok({ challengeId: 'chal1' });
                const certificationAnswer2 = domainBuilder.buildAnswer.ok({ challengeId: 'chal2' });
                const certificationAnswer3 = domainBuilder.buildAnswer.uncorrected({ challengeId: 'chal3' });
                const certificationAssessment = domainBuilder.buildCertificationAssessment({
                  certificationCourseId,
                  userId: 456,
                  createdAt: new Date('2020-01-01'),
                  certificationChallenges: [certificationChallenge1, certificationChallenge2, certificationChallenge3],
                  certificationAnswersByDate: [certificationAnswer1, certificationAnswer2, certificationAnswer3],
                });

                const complementaryCertificationScoringCriteria =
                  domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
                    complementaryCertificationCourseId: 999,
                    complementaryCertificationBadgeId: 888,
                    minimumReproducibilityRate: 75,
                    complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                    minimumReproducibilityRateLowerLevel: 60,
                    complementaryCertificationId: 123,
                  });
                complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
                  .withArgs({
                    certificationCourseId,
                  })
                  .resolves([complementaryCertificationScoringCriteria]);

                const complementaryCertificationId = 456;
                const complementaryCertificationCourse = {
                  id: 999,
                  complementaryCertificationId,
                  certificationCourseId,
                  complementaryCertificationBadgeId: 888,
                };

                certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(
                  domainBuilder.buildCertificationCourse({
                    complementaryCertificationCourse,
                  }),
                );

                complementaryCertificationRepository.get
                  .withArgs({ id: complementaryCertificationId })
                  .resolves({ key: SCOPES.PIX_PLUS_DROIT });

                complementaryCertificationBadgesRepository.getAllWithSameTargetProfile.withArgs(888).resolves([
                  domainBuilder.certification.complementaryCertification.buildComplementaryCertificationBadge({
                    id: 888,
                    level: 1,
                    minimumEarnedPix: 60,
                  }),
                ]);
                certificationAssessmentRepository.getByCertificationCourseId
                  .withArgs({ certificationCourseId })
                  .resolves(certificationAssessment);

                const assessmentResult = domainBuilder.buildAssessmentResult.validated({ pixScore: 50 });
                assessmentResultRepository.getByCertificationCourseId
                  .withArgs({ certificationCourseId })
                  .resolves(assessmentResult);

                certificationCandidateRepository.findByAssessmentId
                  .withArgs({ assessmentId: assessmentResult.assessmentId })
                  .resolves(
                    domainBuilder.certification.evaluation.buildCandidate({
                      subscriptionScope: SCOPES.PIX_PLUS_DROIT,
                    }),
                  );

                // when
                await scoreComplementaryCertificationV2({
                  ...dependencies,
                  certificationCourseId,
                  complementaryCertificationScoringCriteria,
                });

                // then

                expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
                  ComplementaryCertificationCourseResult.from({
                    complementaryCertificationCourseId: 999,
                    complementaryCertificationBadgeId: 888,
                    source: ComplementaryCertificationCourseResult.sources.PIX,
                    acquired: false,
                  }),
                );
              });
            });
          });
        });
      });
    });
  });

  context('when there is no complementary referential', function () {
    it('should score the complementary certification', async function () {
      // given
      const certificationCourseId = 123;
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationCourseId,
        userId: 456,
        createdAt: new Date('2020-01-01'),
        certificationChallenges: [
          domainBuilder.buildCertificationChallengeWithType({
            certifiableBadgeKey: 'PIX_PLUS_TEST',
            challengeId: 'chal1',
          }),
        ],
        certificationAnswersByDate: [domainBuilder.buildAnswer.ok({ challengeId: 'chal1' })],
      });

      const complementaryCertificationScoringCriteria =
        domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
          complementaryCertificationCourseId: 999,
          complementaryCertificationBadgeId: 888,
          minimumReproducibilityRate: 70,
          minimumEarnedPix: 50,
          complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
        });
      complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
        .withArgs({
          certificationCourseId,
        })
        .resolves([complementaryCertificationScoringCriteria]);

      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId })
        .resolves(certificationAssessment);

      const assessmentResult = domainBuilder.buildAssessmentResult({ pixScore: 128, reproducibilityRate: 100 });
      assessmentResultRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId })
        .resolves(assessmentResult);

      certificationCandidateRepository.findByAssessmentId
        .withArgs({ assessmentId: assessmentResult.assessmentId })
        .resolves(
          domainBuilder.certification.evaluation.buildCandidate({
            subscriptionScope: SCOPES.CORE,
          }),
        );

      const complementaryCertificationId = 456;
      const complementaryCertificationCourse = {
        id: 999,
        complementaryCertificationId,
        certificationCourseId,
        complementaryCertificationBadgeId: 888,
      };

      certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(
        domainBuilder.buildCertificationCourse({
          complementaryCertificationCourse,
        }),
      );

      complementaryCertificationRepository.get
        .withArgs({ id: complementaryCertificationId })
        .resolves({ key: SCOPES.PIX_PLUS_DROIT });

      // when
      await scoreComplementaryCertificationV2({
        ...dependencies,
        certificationCourseId,
        complementaryCertificationScoringCriteria,
      });

      // then

      expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
        ComplementaryCertificationCourseResult.from({
          complementaryCertificationCourseId: 999,
          complementaryCertificationBadgeId: 888,
          source: ComplementaryCertificationCourseResult.sources.PIX,
          acquired: true,
        }),
      );
    });

    context('scoring', function () {
      it('should save a "not acquired" complementary certification when pix score and reproducibility rate are below expectations', async function () {
        // given
        const certificationCourseId = 123;
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'chal1',
          certifiableBadgeKey: 'PIX_PLUS_TEST',
        });
        const certificationAnswer = domainBuilder.buildAnswer.ok({ challengeId: 'chal1' });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationCourseId,
          userId: 456,
          createdAt: new Date('2020-01-01'),
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(certificationAssessment);

        const assessmentResult = domainBuilder.buildAssessmentResult.validated({
          pixScore: 45,
          reproducibilityRate: 70,
        });
        assessmentResultRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(assessmentResult);

        certificationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessmentResult.assessmentId })
          .resolves(
            domainBuilder.certification.evaluation.buildCandidate({
              subscriptionScope: SCOPES.CORE,
            }),
          );

        const complementaryCertificationScoringCriteria =
          domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
            complementaryCertificationCourseId: 999,
            complementaryCertificationBadgeId: 888,
            minimumReproducibilityRate: 75,
            complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
            minimumEarnedPix: 50,
          });
        complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
          .withArgs({
            certificationCourseId,
          })
          .resolves([complementaryCertificationScoringCriteria]);

        const complementaryCertificationId = 456;
        const complementaryCertificationCourse = {
          id: 999,
          complementaryCertificationId,
          certificationCourseId,
          complementaryCertificationBadgeId: 888,
        };

        certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(
          domainBuilder.buildCertificationCourse({
            complementaryCertificationCourse,
          }),
        );

        complementaryCertificationRepository.get
          .withArgs({ id: complementaryCertificationId })
          .resolves({ key: SCOPES.PIX_PLUS_DROIT });

        // when
        await scoreComplementaryCertificationV2({
          ...dependencies,
          certificationCourseId,
          complementaryCertificationScoringCriteria,
        });

        // then
        expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
          ComplementaryCertificationCourseResult.from({
            complementaryCertificationCourseId: 999,
            complementaryCertificationBadgeId: 888,
            source: ComplementaryCertificationCourseResult.sources.PIX,
            acquired: false,
          }),
        );
      });

      it('should save a "not acquired" complementary certification when pix score is above expectation and repro rate is not', async function () {
        // given
        const certificationCourseId = 123;
        const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'chal1',
          certifiableBadgeKey: 'PIX_PLUS_TEST',
        });
        const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'chal2',
          certifiableBadgeKey: 'PIX_PLUS_TEST',
        });
        const certificationAnswer1 = domainBuilder.buildAnswer.ko({ challengeId: 'chal1' });
        const certificationAnswer2 = domainBuilder.buildAnswer.ok({ challengeId: 'chal2' });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationCourseId,
          userId: 456,
          createdAt: new Date('2020-01-01'),
          certificationChallenges: [certificationChallenge1, certificationChallenge2],
          certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
        });

        const complementaryCertificationScoringCriteria =
          domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
            complementaryCertificationCourseId: 999,
            complementaryCertificationBadgeId: 888,
            minimumReproducibilityRate: 75,
            complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
            minimumEarnedPix: 50,
          });
        complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
          .withArgs({
            certificationCourseId,
          })
          .resolves([complementaryCertificationScoringCriteria]);
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(certificationAssessment);

        const assessmentResult = domainBuilder.buildAssessmentResult.validated({
          pixScore: 60,
          reproducibilityRate: 70,
        });
        assessmentResultRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(assessmentResult);

        certificationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessmentResult.assessmentId })
          .resolves(
            domainBuilder.certification.evaluation.buildCandidate({
              subscriptionScope: SCOPES.CORE,
            }),
          );

        const complementaryCertificationId = 456;
        const complementaryCertificationCourse = {
          id: 999,
          complementaryCertificationId,
          certificationCourseId,
          complementaryCertificationBadgeId: 888,
        };

        certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(
          domainBuilder.buildCertificationCourse({
            complementaryCertificationCourse,
          }),
        );

        complementaryCertificationRepository.get
          .withArgs({ id: complementaryCertificationId })
          .resolves({ key: SCOPES.PIX_PLUS_DROIT });

        // when
        await scoreComplementaryCertificationV2({
          ...dependencies,
          certificationCourseId,
          complementaryCertificationScoringCriteria,
        });

        // then
        expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
          ComplementaryCertificationCourseResult.from({
            complementaryCertificationCourseId: 999,
            complementaryCertificationBadgeId: 888,
            source: ComplementaryCertificationCourseResult.sources.PIX,
            acquired: false,
          }),
        );
      });

      it('should save a "not acquired" complementary certification when pix score is below expectation and repro rate is above', async function () {
        // given
        const certificationCourseId = 123;
        const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'chal1',
          certifiableBadgeKey: 'PIX_PLUS_TEST',
        });
        const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'chal2',
          certifiableBadgeKey: 'PIX_PLUS_TEST',
        });
        const certificationAnswer1 = domainBuilder.buildAnswer.ko({ challengeId: 'chal1' });
        const certificationAnswer2 = domainBuilder.buildAnswer.ok({ challengeId: 'chal2' });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationCourseId,
          userId: 456,
          createdAt: new Date('2020-01-01'),
          certificationChallenges: [certificationChallenge1, certificationChallenge2],
          certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
        });

        const complementaryCertificationScoringCriteria =
          domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
            complementaryCertificationCourseId: 999,
            complementaryCertificationBadgeId: 888,
            minimumReproducibilityRate: 70,
            complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
            minimumEarnedPix: 50,
          });
        complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
          .withArgs({
            certificationCourseId,
          })
          .resolves([complementaryCertificationScoringCriteria]);
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(certificationAssessment);

        const assessmentResult = domainBuilder.buildAssessmentResult.validated({
          pixScore: 45,
          reproducibilityRate: 75,
        });
        assessmentResultRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(assessmentResult);

        certificationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessmentResult.assessmentId })
          .resolves(
            domainBuilder.certification.evaluation.buildCandidate({
              subscriptionScope: SCOPES.CORE,
            }),
          );

        const complementaryCertificationId = 456;
        const complementaryCertificationCourse = {
          id: 999,
          complementaryCertificationId,
          certificationCourseId,
          complementaryCertificationBadgeId: 888,
        };

        certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(
          domainBuilder.buildCertificationCourse({
            complementaryCertificationCourse,
          }),
        );

        complementaryCertificationRepository.get
          .withArgs({ id: complementaryCertificationId })
          .resolves({ key: SCOPES.PIX_PLUS_DROIT });

        // when
        await scoreComplementaryCertificationV2({
          ...dependencies,
          certificationCourseId,
          complementaryCertificationScoringCriteria,
        });

        // then
        expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
          ComplementaryCertificationCourseResult.from({
            complementaryCertificationCourseId: 999,
            complementaryCertificationBadgeId: 888,
            source: ComplementaryCertificationCourseResult.sources.PIX,
            acquired: false,
          }),
        );
      });

      it('should save an "acquired" complementary certification when pix score and repro rate are above expectations', async function () {
        // given
        const certificationCourseId = 123;
        const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'chal1',
          certifiableBadgeKey: 'PIX_PLUS_TEST',
        });
        const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'chal2',
          certifiableBadgeKey: 'PIX_PLUS_TEST',
        });
        const certificationAnswer1 = domainBuilder.buildAnswer.ok({ challengeId: 'chal1' });
        const certificationAnswer2 = domainBuilder.buildAnswer.ok({ challengeId: 'chal2' });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationCourseId,
          userId: 456,
          createdAt: new Date('2020-01-01'),
          certificationChallenges: [certificationChallenge1, certificationChallenge2],
          certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
        });

        const complementaryCertificationScoringCriteria =
          domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
            complementaryCertificationCourseId: 999,
            complementaryCertificationBadgeId: 888,
            minimumReproducibilityRate: 70,
            complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
            minimumEarnedPix: 50,
          });
        complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
          .withArgs({
            certificationCourseId,
          })
          .resolves([complementaryCertificationScoringCriteria]);
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(certificationAssessment);

        const assessmentResult = domainBuilder.buildAssessmentResult.validated({
          pixScore: 120,
          reproducibilityRate: 75,
        });
        assessmentResultRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(assessmentResult);

        certificationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessmentResult.assessmentId })
          .resolves(
            domainBuilder.certification.evaluation.buildCandidate({
              subscriptionScope: SCOPES.CORE,
            }),
          );

        const complementaryCertificationId = 456;
        const complementaryCertificationCourse = {
          id: 999,
          complementaryCertificationId,
          certificationCourseId,
          complementaryCertificationBadgeId: 888,
        };

        certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(
          domainBuilder.buildCertificationCourse({
            complementaryCertificationCourse,
          }),
        );

        complementaryCertificationRepository.get
          .withArgs({ id: complementaryCertificationId })
          .resolves({ key: SCOPES.PIX_PLUS_DROIT });

        // when
        await scoreComplementaryCertificationV2({
          ...dependencies,
          certificationCourseId,
          complementaryCertificationScoringCriteria,
        });

        // then
        expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
          ComplementaryCertificationCourseResult.from({
            complementaryCertificationCourseId: 999,
            complementaryCertificationBadgeId: 888,
            source: ComplementaryCertificationCourseResult.sources.PIX,
            acquired: true,
          }),
        );
      });

      it('should save a "not acquired" complementary certification when pix core is rejected for fraud', async function () {
        // given
        const certificationCourseId = 123;
        const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'chal1',
          certifiableBadgeKey: 'PIX_PLUS_TEST',
        });
        const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'chal2',
          certifiableBadgeKey: 'PIX_PLUS_TEST',
        });
        const certificationAnswer1 = domainBuilder.buildAnswer.ok({ challengeId: 'chal1' });
        const certificationAnswer2 = domainBuilder.buildAnswer.ok({ challengeId: 'chal2' });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationCourseId,
          userId: 456,
          createdAt: new Date('2020-01-01'),
          certificationChallenges: [certificationChallenge1, certificationChallenge2],
          certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
        });

        const complementaryCertificationScoringCriteria =
          domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
            complementaryCertificationCourseId: 999,
            complementaryCertificationBadgeId: 888,
            minimumReproducibilityRate: 70,
            complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
            minimumEarnedPix: 50,
          });
        complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
          .withArgs({
            certificationCourseId,
          })
          .resolves([complementaryCertificationScoringCriteria]);
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(certificationAssessment);

        const assessmentResult = domainBuilder.buildAssessmentResult.validated({
          pixScore: 120,
          reproducibilityRate: 75,
        });
        assessmentResultRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(assessmentResult);

        certificationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessmentResult.assessmentId })
          .resolves(
            domainBuilder.certification.evaluation.buildCandidate({
              subscriptionScope: SCOPES.CORE,
            }),
          );

        const complementaryCertificationId = 456;
        const complementaryCertificationCourse = {
          id: 999,
          complementaryCertificationId,
          certificationCourseId,
          complementaryCertificationBadgeId: 888,
        };
        certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(
          domainBuilder.buildCertificationCourse({
            complementaryCertificationCourse,
            isRejectedForFraud: true,
          }),
        );
        complementaryCertificationRepository.get
          .withArgs({ id: complementaryCertificationId })
          .resolves({ key: SCOPES.PIX_PLUS_DROIT });

        // when
        await scoreComplementaryCertificationV2({
          ...dependencies,
          certificationCourseId,
          complementaryCertificationScoringCriteria,
        });

        // then
        expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
          ComplementaryCertificationCourseResult.from({
            complementaryCertificationCourseId: 999,
            complementaryCertificationBadgeId: 888,
            partnerKey: 'PIX_PLUS_TEST',
            source: ComplementaryCertificationCourseResult.sources.PIX,
            acquired: false,
          }),
        );
      });
    });
  });
});

function _buildAnswersAndChallengesDependingOnReproducibilityRate({ reproducibilityRate, certifiableBadgeKey }) {
  const step = 5;
  const numberOfQuestions = 20;
  const numberOfCorrectAnswers = reproducibilityRate / step;

  const challenges = range(numberOfQuestions).map((challengeNumber) =>
    domainBuilder.buildCertificationChallengeWithType({
      challengeId: `chal${challengeNumber}`,
      certifiableBadgeKey,
    }),
  );

  const correctAnswers = range(numberOfCorrectAnswers).map((challengeNumber) =>
    domainBuilder.buildAnswer.ok({ challengeId: `chal${challengeNumber}` }),
  );

  const incorrectAnswers = range(numberOfCorrectAnswers, numberOfQuestions).map((challengeNumber) =>
    domainBuilder.buildAnswer.ko({ challengeId: `chal${challengeNumber}` }),
  );

  return { answers: [...correctAnswers, ...incorrectAnswers], challenges };
}
