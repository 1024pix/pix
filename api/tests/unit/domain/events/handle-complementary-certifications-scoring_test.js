import range from 'lodash/range.js';

import { config as settings } from '../../../../lib/config.js';
import { _forTestOnly } from '../../../../lib/domain/events/index.js';
import { ComplementaryCertificationCourseResult } from '../../../../src/certification/complementary-certification/domain/models/ComplementaryCertificationCourseResult.js';
import { status as assessmentResultStatuses } from '../../../../src/shared/domain/models/AssessmentResult.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';

const { handleComplementaryCertificationsScoring } = _forTestOnly.handlers;

describe('Unit | Domain | Events | Handle Complementary Certifications Scoring', function () {
  const certificationAssessmentRepository = {};
  const complementaryCertificationCourseResultRepository = {};
  const assessmentResultRepository = {};
  const complementaryCertificationScoringCriteriaRepository = {};
  const certificationCourseRepository = {};
  const complementaryCertificationBadgesRepository = {};

  const dependencies = {
    certificationAssessmentRepository,
    complementaryCertificationCourseResultRepository,
    assessmentResultRepository,
    complementaryCertificationScoringCriteriaRepository,
    certificationCourseRepository,
    complementaryCertificationBadgesRepository,
  };

  beforeEach(function () {
    complementaryCertificationCourseResultRepository.save = sinon.stub();
    certificationAssessmentRepository.getByCertificationCourseId = sinon.stub();
    assessmentResultRepository.getByCertificationCourseId = sinon.stub();
    assessmentResultRepository.updateToAcquiredLowerLevelComplementaryCertification = sinon.stub();
    complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId = sinon.stub();
    certificationCourseRepository.get = sinon.stub();
    complementaryCertificationBadgesRepository.getAllWithSameTargetProfile = sinon.stub();
    sinon.stub(settings.featureToggles, 'isPixPlusLowerLeverEnabled').value(false);
  });

  it('fails when event is not of correct type', async function () {
    // given
    const event = 'not an event of the correct type';

    // when / then
    const error = await catchErr(handleComplementaryCertificationsScoring)({ event, ...dependencies });

    // then
    expect(error.message).to.equal(
      'event must be one of types CertificationScoringCompleted, CertificationRescoringCompleted',
    );
  });

  context('when there is no complementary certification', function () {
    it('should not score certifications', async function () {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });

      complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
        .withArgs({ certificationCourseId: 123 })
        .resolves([]);
      certificationCourseRepository.get.withArgs({ id: 123 }).resolves(domainBuilder.buildCertificationCourse());

      // when
      await handleComplementaryCertificationsScoring({ event, ...dependencies });

      // then
      expect(complementaryCertificationCourseResultRepository.save).to.not.have.been.called;
    });
  });

  context('when there is a complementary certification', function () {
    context('when there is a complementary referential', function () {
      it('should score the complementary certification', async function () {
        // given
        const event = domainBuilder.buildCertificationScoringCompletedEvent({
          certificationCourseId: 123,
          userId: 456,
        });

        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationCourseId: 123,
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

        complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
          .withArgs({
            certificationCourseId: 123,
          })
          .resolves([
            domainBuilder.buildComplementaryCertificationScoringCriteria({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              minimumReproducibilityRate: 70,
              complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
              hasComplementaryReferential: true,
            }),
          ]);

        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: 123 })
          .resolves(certificationAssessment);

        assessmentResultRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: 123 })
          .resolves(domainBuilder.buildAssessmentResult());

        certificationCourseRepository.get.withArgs({ id: 123 }).resolves(domainBuilder.buildCertificationCourse());

        // when
        await handleComplementaryCertificationsScoring({ event, ...dependencies });

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
        beforeEach(function () {
          sinon.stub(settings.featureToggles, 'isPixPlusLowerLeverEnabled').value(true);
        });
        /* eslint-disable mocha/no-setup-in-describe */
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
              const event = domainBuilder.buildCertificationScoringCompletedEvent({
                certificationCourseId: 123,
                userId: 456,
              });

              const { answers, challenges } = _buildAnswersAndChallengesDependingOnReproducibilityRate({
                reproducibilityRate,
                certifiableBadgeKey: 'PIX_PLUS_TEST',
              });

              const certificationAssessment = domainBuilder.buildCertificationAssessment({
                certificationCourseId: 123,
                userId: 456,
                createdAt: new Date('2020-01-01'),
                certificationChallenges: challenges,
                certificationAnswersByDate: answers,
              });

              const availableComplementaryCertificationBadges = [
                domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
                  id: 666,
                  level: level1.level,
                  minimumEarnedPix: level1.minimumEarnedPix,
                }),
                domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
                  id: 777,
                  level: lowerLevel.level,
                  minimumEarnedPix: lowerLevel.minimumEarnedPix,
                }),
                domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
                  id: 888,
                  level: currentLevel.level,
                  minimumEarnedPix: currentLevel.minimumEarnedPix,
                }),
              ];

              const expectedLevelComplementaryCertificationBadge = acquiredLevel
                ? availableComplementaryCertificationBadges.at(acquiredLevel - 1)
                : null;

              const isLowerLevelComplementaryCertificationAcquired = acquiredLevel === lowerLevel.level;

              complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
                .withArgs({
                  certificationCourseId: 123,
                })
                .resolves([
                  domainBuilder.buildComplementaryCertificationScoringCriteria({
                    complementaryCertificationCourseId: 999,
                    complementaryCertificationBadgeId: 888,
                    minimumReproducibilityRate,
                    minimumReproducibilityRateLowerLevel,
                    minimumEarnedPix: level3.minimumEarnedPix,
                    complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                    hasComplementaryReferential: true,
                  }),
                ]);

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

              assessmentResultRepository.getByCertificationCourseId
                .withArgs({ certificationCourseId: 123 })
                .resolves(assessmentResult);

              certificationCourseRepository.get
                .withArgs({ id: 123 })
                .resolves(domainBuilder.buildCertificationCourse());

              // when
              await handleComplementaryCertificationsScoring({ event, ...dependencies });

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
        /* eslint-enable mocha/no-setup-in-describe */
      });

      context('scoring', function () {
        context('when pix certification is not validated', function () {
          it('should save a "not acquired" complementary certification', async function () {
            // given
            const event = domainBuilder.buildCertificationScoringCompletedEvent({
              certificationCourseId: 123,
              userId: 456,
            });
            const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({
              challengeId: 'chal1',
              certifiableBadgeKey: 'PIX_PLUS_TEST',
            });
            const certificationAnswer = domainBuilder.buildAnswer.ok({ challengeId: 'chal1' });
            const certificationAssessment = domainBuilder.buildCertificationAssessment({
              certificationCourseId: 123,
              userId: 456,
              createdAt: new Date('2020-01-01'),
              certificationChallenges: [certificationChallenge],
              certificationAnswersByDate: [certificationAnswer],
            });
            certificationAssessmentRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId: 123 })
              .resolves(certificationAssessment);
            assessmentResultRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId: 123 })
              .resolves(domainBuilder.buildAssessmentResult.rejected());
            certificationCourseRepository.get.withArgs({ id: 123 }).resolves(domainBuilder.buildCertificationCourse());
            const complementaryCertificationScoringCriteria = [
              domainBuilder.buildComplementaryCertificationScoringCriteria({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: 888,
                minimumReproducibilityRate: 100,
                complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                hasComplementaryReferential: true,
              }),
            ];
            complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
              .withArgs({
                certificationCourseId: 123,
              })
              .resolves(complementaryCertificationScoringCriteria);

            // when
            await handleComplementaryCertificationsScoring({ event, ...dependencies });

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
          context('when repro rate is not sufficient', function () {
            it('should save a "not acquired" complementary certification', async function () {
              // given
              const event = domainBuilder.buildCertificationScoringCompletedEvent({
                certificationCourseId: 123,
                userId: 456,
              });
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
                certificationCourseId: 123,
                userId: 456,
                createdAt: new Date('2020-01-01'),
                certificationChallenges: [certificationChallenge1, certificationChallenge2],
                certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
              });
              certificationCourseRepository.get
                .withArgs({ id: 123 })
                .resolves(domainBuilder.buildCertificationCourse());

              complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
                .withArgs({
                  certificationCourseId: 123,
                })
                .resolves([
                  domainBuilder.buildComplementaryCertificationScoringCriteria({
                    complementaryCertificationCourseId: 999,
                    complementaryCertificationBadgeId: 888,
                    minimumReproducibilityRate: 75,
                    minimumReproducibilityRateLowerLevel: 75,
                    complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                    hasComplementaryReferential: true,
                  }),
                ]);
              certificationAssessmentRepository.getByCertificationCourseId
                .withArgs({ certificationCourseId: 123 })
                .resolves(certificationAssessment);
              assessmentResultRepository.getByCertificationCourseId
                .withArgs({ certificationCourseId: 123 })
                .resolves(domainBuilder.buildAssessmentResult.validated());

              // when
              await handleComplementaryCertificationsScoring({ event, ...dependencies });

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

          context('when repro rate is sufficient', function () {
            it('should save an "acquired" complementary certification', async function () {
              // given
              const event = domainBuilder.buildCertificationScoringCompletedEvent({
                certificationCourseId: 123,
                userId: 456,
              });
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
                certificationCourseId: 123,
                userId: 456,
                createdAt: new Date('2020-01-01'),
                certificationChallenges: [certificationChallenge1, certificationChallenge2],
                certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
              });

              complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
                .withArgs({
                  certificationCourseId: 123,
                })
                .resolves([
                  domainBuilder.buildComplementaryCertificationScoringCriteria({
                    complementaryCertificationCourseId: 999,
                    complementaryCertificationBadgeId: 888,
                    minimumReproducibilityRate: 75,
                    complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                    hasComplementaryReferential: true,
                  }),
                ]);
              certificationCourseRepository.get
                .withArgs({ id: 123 })
                .resolves(domainBuilder.buildCertificationCourse());

              certificationAssessmentRepository.getByCertificationCourseId
                .withArgs({ certificationCourseId: 123 })
                .resolves(certificationAssessment);
              assessmentResultRepository.getByCertificationCourseId
                .withArgs({ certificationCourseId: 123 })
                .resolves(domainBuilder.buildAssessmentResult.validated());

              // when
              await handleComplementaryCertificationsScoring({ event, ...dependencies });

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

          context('when repro rate is not sufficient for current level', function () {
            context('when isPixPlusLowerLeverEnabled is true', function () {
              beforeEach(function () {
                sinon.stub(settings.featureToggles, 'isPixPlusLowerLeverEnabled').value(true);
              });
              context('repro rate is sufficient for lower level', function () {
                context('when there is a lower badge', function () {
                  it('should save an "acquired" complementary certification with lower level badge', async function () {
                    // given
                    sinon.stub(settings.featureToggles, 'isPixPlusLowerLeverEnabled').value(true);

                    const event = domainBuilder.buildCertificationScoringCompletedEvent({
                      certificationCourseId: 123,
                      userId: 456,
                    });
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
                      certificationCourseId: 123,
                      userId: 456,
                      createdAt: new Date('2020-01-01'),
                      certificationChallenges: [
                        certificationChallenge1,
                        certificationChallenge2,
                        certificationChallenge3,
                      ],
                      certificationAnswersByDate: [certificationAnswer1, certificationAnswer2, certificationAnswer3],
                    });

                    complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
                      .withArgs({
                        certificationCourseId: 123,
                      })
                      .resolves([
                        domainBuilder.buildComplementaryCertificationScoringCriteria({
                          complementaryCertificationCourseId: 999,
                          complementaryCertificationBadgeId: 888,
                          minimumReproducibilityRate: 75,
                          complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                          hasComplementaryReferential: true,
                          minimumEarnedPix: 60,
                          minimumReproducibilityRateLowerLevel: 60,
                          complementaryCertificationId: 123,
                        }),
                      ]);
                    certificationCourseRepository.get
                      .withArgs({ id: 123 })
                      .resolves(domainBuilder.buildCertificationCourse());

                    complementaryCertificationBadgesRepository.getAllWithSameTargetProfile.withArgs(888).resolves([
                      domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
                        id: 777,
                        level: 1,
                        minimumEarnedPix: 50,
                      }),
                      domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
                        id: 888,
                        level: 2,
                        minimumEarnedPix: 60,
                      }),
                    ]);
                    certificationAssessmentRepository.getByCertificationCourseId
                      .withArgs({ certificationCourseId: 123 })
                      .resolves(certificationAssessment);
                    assessmentResultRepository.getByCertificationCourseId
                      .withArgs({ certificationCourseId: 123 })
                      .resolves(domainBuilder.buildAssessmentResult.validated({ pixScore: 50 }));

                    // when
                    await handleComplementaryCertificationsScoring({ event, ...dependencies });

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

                    const event = domainBuilder.buildCertificationScoringCompletedEvent({
                      certificationCourseId: 123,
                      userId: 456,
                    });
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
                      certificationCourseId: 123,
                      userId: 456,
                      createdAt: new Date('2020-01-01'),
                      certificationChallenges: [
                        certificationChallenge1,
                        certificationChallenge2,
                        certificationChallenge3,
                      ],
                      certificationAnswersByDate: [certificationAnswer1, certificationAnswer2, certificationAnswer3],
                    });

                    complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
                      .withArgs({
                        certificationCourseId: 123,
                      })
                      .resolves([
                        domainBuilder.buildComplementaryCertificationScoringCriteria({
                          complementaryCertificationCourseId: 999,
                          complementaryCertificationBadgeId: 888,
                          minimumReproducibilityRate: 75,
                          complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                          hasComplementaryReferential: true,
                          minimumReproducibilityRateLowerLevel: 60,
                          complementaryCertificationId: 123,
                        }),
                      ]);
                    certificationCourseRepository.get
                      .withArgs({ id: 123 })
                      .resolves(domainBuilder.buildCertificationCourse());

                    complementaryCertificationBadgesRepository.getAllWithSameTargetProfile.withArgs(888).resolves([
                      domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
                        id: 888,
                        level: 1,
                        minimumEarnedPix: 60,
                      }),
                    ]);
                    certificationAssessmentRepository.getByCertificationCourseId
                      .withArgs({ certificationCourseId: 123 })
                      .resolves(certificationAssessment);
                    assessmentResultRepository.getByCertificationCourseId
                      .withArgs({ certificationCourseId: 123 })
                      .resolves(domainBuilder.buildAssessmentResult.validated({ pixScore: 50 }));

                    // when
                    await handleComplementaryCertificationsScoring({ event, ...dependencies });

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

            context('when isPixPlusLowerLeverEnabled is false', function () {
              context('repro rate is sufficient for lower level', function () {
                it('should  not save a not "acquired" complementary certification with current level badge', async function () {
                  // given
                  sinon.stub(settings.featureToggles, 'isPixPlusLowerLeverEnabled').value(false);

                  const event = domainBuilder.buildCertificationScoringCompletedEvent({
                    certificationCourseId: 123,
                    userId: 456,
                  });
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
                    certificationCourseId: 123,
                    userId: 456,
                    createdAt: new Date('2020-01-01'),
                    certificationChallenges: [
                      certificationChallenge1,
                      certificationChallenge2,
                      certificationChallenge3,
                    ],
                    certificationAnswersByDate: [certificationAnswer1, certificationAnswer2, certificationAnswer3],
                  });

                  complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
                    .withArgs({
                      certificationCourseId: 123,
                    })
                    .resolves([
                      domainBuilder.buildComplementaryCertificationScoringCriteria({
                        complementaryCertificationCourseId: 999,
                        complementaryCertificationBadgeId: 888,
                        minimumReproducibilityRate: 75,
                        complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                        hasComplementaryReferential: true,
                        minimumReproducibilityRateLowerLevel: 60,
                        complementaryCertificationId: 123,
                      }),
                    ]);
                  certificationCourseRepository.get
                    .withArgs({ id: 123 })
                    .resolves(domainBuilder.buildCertificationCourse());

                  complementaryCertificationBadgesRepository.getAllWithSameTargetProfile.withArgs(888).resolves([
                    domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
                      id: 777,
                      level: 1,
                      minimumEarnedPix: 50,
                    }),
                    domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
                      id: 888,
                      level: 2,
                      minimumEarnedPix: 60,
                    }),
                  ]);
                  certificationAssessmentRepository.getByCertificationCourseId
                    .withArgs({ certificationCourseId: 123 })
                    .resolves(certificationAssessment);
                  assessmentResultRepository.getByCertificationCourseId
                    .withArgs({ certificationCourseId: 123 })
                    .resolves(domainBuilder.buildAssessmentResult.validated({ pixScore: 50 }));

                  // when
                  await handleComplementaryCertificationsScoring({ event, ...dependencies });

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
        const event = domainBuilder.buildCertificationScoringCompletedEvent({
          certificationCourseId: 123,
          userId: 456,
        });

        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationCourseId: 123,
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

        complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
          .withArgs({
            certificationCourseId: 123,
          })
          .resolves([
            domainBuilder.buildComplementaryCertificationScoringCriteria({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              minimumReproducibilityRate: 70,
              minimumEarnedPix: 50,
              complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
              hasComplementaryReferential: false,
            }),
          ]);

        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: 123 })
          .resolves(certificationAssessment);

        assessmentResultRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: 123 })
          .resolves(domainBuilder.buildAssessmentResult({ pixScore: 128, reproducibilityRate: 100 }));
        certificationCourseRepository.get.withArgs({ id: 123 }).resolves(domainBuilder.buildCertificationCourse());

        // when
        await handleComplementaryCertificationsScoring({ event, ...dependencies });

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
          const event = domainBuilder.buildCertificationScoringCompletedEvent({
            certificationCourseId: 123,
            userId: 456,
          });
          const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'chal1',
            certifiableBadgeKey: 'PIX_PLUS_TEST',
          });
          const certificationAnswer = domainBuilder.buildAnswer.ok({ challengeId: 'chal1' });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationCourseId: 123,
            userId: 456,
            createdAt: new Date('2020-01-01'),
            certificationChallenges: [certificationChallenge],
            certificationAnswersByDate: [certificationAnswer],
          });
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 123 })
            .resolves(certificationAssessment);
          assessmentResultRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 123 }).resolves(
            domainBuilder.buildAssessmentResult.validated({
              pixScore: 45,
              reproducibilityRate: 70,
            }),
          );
          const complementaryCertificationScoringCriteria = [
            domainBuilder.buildComplementaryCertificationScoringCriteria({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              minimumReproducibilityRate: 75,
              complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
              hasComplementaryReferential: false,
              minimumEarnedPix: 50,
            }),
          ];
          complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
            .withArgs({
              certificationCourseId: 123,
            })
            .resolves(complementaryCertificationScoringCriteria);
          certificationCourseRepository.get.withArgs({ id: 123 }).resolves(domainBuilder.buildCertificationCourse());

          // when
          await handleComplementaryCertificationsScoring({ event, ...dependencies });

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
          const event = domainBuilder.buildCertificationScoringCompletedEvent({
            certificationCourseId: 123,
            userId: 456,
          });
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
            certificationCourseId: 123,
            userId: 456,
            createdAt: new Date('2020-01-01'),
            certificationChallenges: [certificationChallenge1, certificationChallenge2],
            certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
          });

          complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
            .withArgs({
              certificationCourseId: 123,
            })
            .resolves([
              domainBuilder.buildComplementaryCertificationScoringCriteria({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: 888,
                minimumReproducibilityRate: 75,
                complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                hasComplementaryReferential: false,
                minimumEarnedPix: 50,
              }),
            ]);
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 123 })
            .resolves(certificationAssessment);
          assessmentResultRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 123 }).resolves(
            domainBuilder.buildAssessmentResult.validated({
              pixScore: 60,
              reproducibilityRate: 70,
            }),
          );
          certificationCourseRepository.get.withArgs({ id: 123 }).resolves(domainBuilder.buildCertificationCourse());

          // when
          await handleComplementaryCertificationsScoring({ event, ...dependencies });

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
          const event = domainBuilder.buildCertificationScoringCompletedEvent({
            certificationCourseId: 123,
            userId: 456,
          });
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
            certificationCourseId: 123,
            userId: 456,
            createdAt: new Date('2020-01-01'),
            certificationChallenges: [certificationChallenge1, certificationChallenge2],
            certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
          });

          complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
            .withArgs({
              certificationCourseId: 123,
            })
            .resolves([
              domainBuilder.buildComplementaryCertificationScoringCriteria({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: 888,
                minimumReproducibilityRate: 70,
                complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                hasComplementaryReferential: false,
                minimumEarnedPix: 50,
              }),
            ]);
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 123 })
            .resolves(certificationAssessment);
          assessmentResultRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 123 }).resolves(
            domainBuilder.buildAssessmentResult.validated({
              pixScore: 45,
              reproducibilityRate: 75,
            }),
          );
          certificationCourseRepository.get.withArgs({ id: 123 }).resolves(domainBuilder.buildCertificationCourse());

          // when
          await handleComplementaryCertificationsScoring({ event, ...dependencies });

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
          const event = domainBuilder.buildCertificationScoringCompletedEvent({
            certificationCourseId: 123,
            userId: 456,
          });
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
            certificationCourseId: 123,
            userId: 456,
            createdAt: new Date('2020-01-01'),
            certificationChallenges: [certificationChallenge1, certificationChallenge2],
            certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
          });

          complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
            .withArgs({
              certificationCourseId: 123,
            })
            .resolves([
              domainBuilder.buildComplementaryCertificationScoringCriteria({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: 888,
                minimumReproducibilityRate: 70,
                complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                hasComplementaryReferential: false,
                minimumEarnedPix: 50,
              }),
            ]);
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 123 })
            .resolves(certificationAssessment);
          assessmentResultRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 123 }).resolves(
            domainBuilder.buildAssessmentResult.validated({
              pixScore: 120,
              reproducibilityRate: 75,
            }),
          );
          certificationCourseRepository.get.withArgs({ id: 123 }).resolves(domainBuilder.buildCertificationCourse());

          // when
          await handleComplementaryCertificationsScoring({ event, ...dependencies });

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
          const event = domainBuilder.buildCertificationScoringCompletedEvent({
            certificationCourseId: 123,
            userId: 456,
          });
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
            certificationCourseId: 123,
            userId: 456,
            createdAt: new Date('2020-01-01'),
            certificationChallenges: [certificationChallenge1, certificationChallenge2],
            certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
          });

          complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
            .withArgs({
              certificationCourseId: 123,
            })
            .resolves([
              domainBuilder.buildComplementaryCertificationScoringCriteria({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: 888,
                minimumReproducibilityRate: 70,
                complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                hasComplementaryReferential: false,
                minimumEarnedPix: 50,
              }),
            ]);
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 123 })
            .resolves(certificationAssessment);
          assessmentResultRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 123 }).resolves(
            domainBuilder.buildAssessmentResult.validated({
              pixScore: 120,
              reproducibilityRate: 75,
            }),
          );
          certificationCourseRepository.get
            .withArgs({ id: 123 })
            .resolves(domainBuilder.buildCertificationCourse({ isRejectedForFraud: true }));

          // when
          await handleComplementaryCertificationsScoring({ event, ...dependencies });

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
