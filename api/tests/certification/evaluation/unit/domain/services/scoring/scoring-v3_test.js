import { CertificationCompletedJob } from '../../../../../../../src/certification/evaluation/domain/events/CertificationCompleted.js';
import { ABORT_REASONS } from '../../../../../../../src/certification/evaluation/domain/models/AssessmentSheet.js';
import { handleV3CertificationScoring } from '../../../../../../../src/certification/evaluation/domain/services/scoring/scoring-v3.js';
import { CertificationJuryDone } from '../../../../../../../src/certification/session-management/domain/events/CertificationJuryDone.js';
import { AutoJuryCommentKeys } from '../../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { SCOPES } from '../../../../../../../src/certification/shared/domain/models/Scopes.js';
import { config } from '../../../../../../../src/shared/config.js';
import { DomainTransaction } from '../../../../../../../src/shared/domain/DomainTransaction.js';
import { AssessmentResult, status } from '../../../../../../../src/shared/domain/models/AssessmentResult.js';
import { domainBuilder, expect, sinon } from '../../../../../../test-helper.js';
import { generateAnswersForChallenges, generateChallengeList } from '../../../../../shared/fixtures/challenges.js';

const { minimumAnswersRequiredToValidateACertification } = config.v3Certification.scoring;
const maximumAssessmentLength = 32;

describe('Unit | Certification | Evaluation | Domain | Services | Scoring V3', function () {
  context('#handleV3CertificationScoring', function () {
    let candidate, assessmentSheet;
    let assessmentResultRepository,
      certificationAssessmentHistoryRepository,
      competenceMarkRepository,
      flashAlgorithmService,
      scoringDegradationService,
      scoringConfigurationRepository,
      sharedCertificationCandidateRepository,
      sharedVersionRepository,
      scoringV3Deps;
    let clock, version;
    const now = new Date('2019-01-01T05:06:07Z');
    let allChallenges;

    beforeEach(function () {
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      allChallenges = generateChallengeList({ length: minimumAnswersRequiredToValidateACertification + 1 });
      assessmentResultRepository = { save: sinon.stub().rejects(new Error('Args mismatch')) };
      certificationAssessmentHistoryRepository = { save: sinon.stub() };
      competenceMarkRepository = { save: sinon.stub().rejects(new Error('Args mismatch')) };
      flashAlgorithmService = {
        getCapacityAndErrorRate: sinon.stub().callsFake((a) => {
          throw new Error(`Args mismatch, was called with ${JSON.stringify(a.challenges)}`);
        }),
        getCapacityAndErrorRateHistory: sinon.stub().callsFake(() => {
          throw new Error('Args mismatch');
        }),
      };
      scoringDegradationService = { downgradeCapacity: sinon.stub().rejects(new Error('Args mismatch')) };
      scoringConfigurationRepository = {
        getLatestByVersionAndLocale: sinon.stub().callsFake((a) => {
          throw new Error(`Args mismatch: ${a}`);
        }),
      };
      sharedCertificationCandidateRepository = {
        getBySessionIdAndUserId: sinon.stub(),
      };
      sharedVersionRepository = {
        getByScopeAndReconciliationDate: sinon.stub(),
      };

      scoringV3Deps = {
        findByCertificationCourseAndVersion: sinon.stub(),
      };

      version = domainBuilder.certification.shared.buildVersion({
        challengesConfiguration: {
          maximumAssessmentLength: 1,
          defaultCandidateCapacity: -3,
        },
      });
    });

    afterEach(function () {
      clock.restore();
    });

    context('when scoring a only CORE scoped certification', function () {
      let event, assessmentResult;
      const assessmentResultId = 99;
      const assessmentId = 1214;
      const certificationCourseId = 1234;
      const userId = 4567;
      const certificationCourseStartDate = new Date('2022-02-01');
      let scoringConfiguration;
      const scoreForCapacity = 438;

      beforeEach(function () {
        candidate = domainBuilder.certification.evaluation.buildCandidate({
          subscriptionScope: SCOPES.CORE,
          hasCleaSubscription: false,
          reconciledAt: new Date('2021-01-01'),
        });
        assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
          assessmentId,
          certificationCourseId,
        });

        event = new CertificationCompletedJob({
          assessmentId,
          userId,
          certificationCourseId,
        });

        scoringConfiguration = domainBuilder.buildV3CertificationScoring({
          competencesForScoring: [domainBuilder.buildCompetenceForScoring()],
        });

        scoringConfigurationRepository.getLatestByVersionAndLocale
          .withArgs({ locale: 'fr', version })
          .resolves(scoringConfiguration);

        assessmentResult = domainBuilder.buildAssessmentResult({
          id: assessmentResultId,
          pixScore: scoreForCapacity,
          reproducibilityRate: 100,
          status: AssessmentResult.status.VALIDATED,
          competenceMarks: [],
          assessmentId,
          juryId: 1,
        });

        assessmentResultRepository.save.resolves(assessmentResult);
        competenceMarkRepository.save.resolves();
      });

      it('should save the score', async function () {
        // given
        const certificationCourseStartDate = new Date('2022-01-01');
        const version = domainBuilder.certification.shared.buildVersion({
          challengesConfiguration: {
            maximumAssessmentLength: 1,
            defaultCandidateCapacity: -3,
          },
        });

        const challenges = generateChallengeList({ length: maximumAssessmentLength });
        const challengeCalibrationsWithoutLiveAlerts = challenges.map(_generateCertificationChallengeForChallenge);
        assessmentSheet.answers = generateAnswersForChallenges({ challenges });

        const expectedCapacity = 2;

        const capacityHistory = [
          domainBuilder.buildCertificationChallengeCapacity({
            certificationChallengeId: challengeCalibrationsWithoutLiveAlerts[0].certificationChallengeId,
            capacity: expectedCapacity,
          }),
        ];

        const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
          capacityHistory,
        });

        sharedVersionRepository.getByScopeAndReconciliationDate
          .withArgs({
            scope: SCOPES.CORE,
            reconciliationDate: candidate.reconciledAt,
          })
          .resolves(version);

        flashAlgorithmService.getCapacityAndErrorRate
          .withArgs({
            challenges,
            allAnswers: assessmentSheet.answers,
            capacity: version.challengesConfiguration.defaultCandidateCapacity,
            variationPercent: version.challengesConfiguration.variationPercent,
          })
          .returns({
            capacity: expectedCapacity,
          });

        flashAlgorithmService.getCapacityAndErrorRateHistory
          .withArgs({
            challenges: challengeCalibrationsWithoutLiveAlerts,
            allAnswers: assessmentSheet.answers,
            capacity: version.challengesConfiguration.defaultCandidateCapacity,
            variationPercent: version.challengesConfiguration.variationPercent,
          })
          .returns([
            {
              capacity: expectedCapacity,
            },
          ]);

        scoringV3Deps.findByCertificationCourseAndVersion.resolves({
          allChallenges: challenges,
          askedChallengesWithoutLiveAlerts: challenges,
          challengeCalibrationsWithoutLiveAlerts,
        });

        const event = new CertificationJuryDone({
          certificationCourseId,
        });

        // when
        const expectedCertificationCourse = await handleV3CertificationScoring({
          event,
          assessmentSheet,
          candidate,
          locale: 'fr',
          assessmentResultRepository,
          certificationAssessmentHistoryRepository,
          competenceMarkRepository,
          flashAlgorithmService,
          scoringConfigurationRepository,
          sharedCertificationCandidateRepository,
          sharedVersionRepository,
          scoringV3Deps,
        });

        // then
        const expectedResult = {
          certificationCourseId,
          assessmentResult: new AssessmentResult({
            pixScore: assessmentResult.pixScore,
            reproducibilityRate: assessmentResult.reproducibilityRate,
            status: assessmentResult.status,
            competenceMarks: assessmentResult.competenceMarks,
            assessmentId: assessmentResult.assessmentId,
          }),
        };

        expect(assessmentResultRepository.save).to.have.been.calledWith(expectedResult);
        expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
          certificationAssessmentHistory,
        );
        expect(competenceMarkRepository.save).to.have.been.calledWithExactly(
          domainBuilder.buildCompetenceMark({
            id: undefined,
            assessmentResultId: 99,
            area_code: '1',
            competenceId: 'recCompetenceId',
            competence_code: '1.1',
            level: 2,
            score: 0,
          }),
        );
      });

      context(
        'when at least the minimum number of answers required by the config has been answered and the certification was completed',
        function () {
          it('builds and save an assessment result with a validated status', async function () {
            // given
            const expectedCapacity = 2;
            const scoreForCapacity = 438;
            const answeredChallenges = allChallenges;
            const { answers, challengeCalibrationsWithoutLiveAlerts } =
              _buildDataFromAnsweredChallenges(answeredChallenges);

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: challengeCalibrationsWithoutLiveAlerts[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            const version = domainBuilder.certification.shared.buildVersion({
              challengesConfiguration: {
                maximumAssessmentLength: 1,
                defaultCandidateCapacity: -3,
              },
            });

            scoringV3Deps.findByCertificationCourseAndVersion.resolves({
              allChallenges: answeredChallenges,
              askedChallengesWithoutLiveAlerts: answeredChallenges,
              challengeCalibrationsWithoutLiveAlerts,
            });

            assessmentSheet.answers = answers;
            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: answeredChallenges,
                allAnswers: answers,
                capacity: version.challengesConfiguration.defaultCandidateCapacity,
                variationPercent: version.challengesConfiguration.variationPercent,
              })
              .returns({
                capacity: expectedCapacity,
              });
            assessmentResultRepository.save.resolves(domainBuilder.buildAssessmentResult({ id: assessmentResultId }));

            sharedVersionRepository.getByScopeAndReconciliationDate
              .withArgs({
                scope: SCOPES.CORE,
                reconciliationDate: candidate.reconciledAt,
              })
              .resolves(version);

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: challengeCalibrationsWithoutLiveAlerts,
                allAnswers: answers,
                capacity: version.challengesConfiguration.defaultCandidateCapacity,
                variationPercent: version.challengesConfiguration.variationPercent,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            // when
            await handleV3CertificationScoring({
              event,
              assessmentSheet,
              candidate,
              locale: 'fr',
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              competenceMarkRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
              sharedCertificationCandidateRepository,
              sharedVersionRepository,
              scoringV3Deps,
            });

            // then
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
              nbPix: scoreForCapacity,
              status: status.VALIDATED,
            });
            const expectedAssessmentResult = new AssessmentResult({
              pixScore: scoreForCapacity,
              reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
              status: status.VALIDATED,
              assessmentId,
            });
            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId,
              assessmentResult: expectedAssessmentResult,
            });
            expect(competenceMarkRepository.save).to.have.been.calledWithExactly(
              domainBuilder.buildCompetenceMark({
                id: undefined,
                assessmentResultId: assessmentResultId,
                area_code: '1',
                competenceId: 'recCompetenceId',
                competence_code: '1.1',
                level: 2,
                score: 0,
              }),
            );
            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });

          context('when certification has a zero pix score', function () {
            it('should save the score with rejected status due to zero pix score', async function () {
              const certificationCourseStartDate = new Date('2022-01-01');
              const answeredChallenges = allChallenges.slice(0, -1);
              const { answers, challengeCalibrationsWithoutLiveAlerts } =
                _buildDataFromAnsweredChallenges(answeredChallenges);
              const expectedCapacity = -10;
              const zeroPixScore = 0;
              const capacityHistory = [
                domainBuilder.buildCertificationChallengeCapacity({
                  certificationChallengeId: challengeCalibrationsWithoutLiveAlerts[0].certificationChallengeId,
                  capacity: expectedCapacity,
                }),
              ];
              const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
                capacityHistory,
              });

              scoringV3Deps.findByCertificationCourseAndVersion.resolves({
                allChallenges: answeredChallenges,
                askedChallengesWithoutLiveAlerts: answeredChallenges,
                challengeCalibrationsWithoutLiveAlerts,
              });
              assessmentSheet.answers = answers;

              sharedVersionRepository.getByScopeAndReconciliationDate
                .withArgs({
                  scope: SCOPES.CORE,
                  reconciliationDate: candidate.reconciledAt,
                })
                .resolves(version);
              flashAlgorithmService.getCapacityAndErrorRate
                .withArgs({
                  challenges: answeredChallenges,
                  allAnswers: answers,
                  capacity: version.challengesConfiguration.defaultCandidateCapacity,
                  variationPercent: version.challengesConfiguration.variationPercent,
                })
                .returns({
                  capacity: expectedCapacity,
                });
              flashAlgorithmService.getCapacityAndErrorRateHistory
                .withArgs({
                  challenges: challengeCalibrationsWithoutLiveAlerts,
                  allAnswers: answers,
                  capacity: version.challengesConfiguration.defaultCandidateCapacity,
                  variationPercent: version.challengesConfiguration.variationPercent,
                })
                .returns([
                  {
                    capacity: expectedCapacity,
                  },
                ]);

              const event = new CertificationCompletedJob({
                assessmentId,
                userId,
                certificationCourseId,
              });

              // when
              await handleV3CertificationScoring({
                event,
                assessmentSheet,
                candidate,
                locale: 'fr',
                assessmentResultRepository,
                certificationAssessmentHistoryRepository,
                competenceMarkRepository,
                flashAlgorithmService,
                scoringConfigurationRepository,
                sharedCertificationCandidateRepository,
                sharedVersionRepository,
                scoringV3Deps,
              });

              // then
              const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
                pixScore: zeroPixScore,
                reproducibilityRate: 100,
                status: AssessmentResult.status.REJECTED,
                assessmentId,
                competenceMarks: [
                  domainBuilder.buildCompetenceMark({
                    area_code: '1',
                    competenceId: 'recCompetenceId',
                    competence_code: '1.1',
                    level: 0,
                    score: 0,
                  }),
                ],
                commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
                  commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_ZERO_PIX_SCORE,
                }),
                commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
                  commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_ZERO_PIX_SCORE,
                }),
              });
              expectedAssessmentResult.id = undefined;
              expectedAssessmentResult.createdAt = undefined;
              expectedAssessmentResult.juryId = undefined;
              expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
                certificationCourseId,
                assessmentResult: expectedAssessmentResult,
              });
              expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
                certificationAssessmentHistory,
              );
            });
          });

          context('when the certification would reach a very high score', function () {
            it('should return the score capped based on the maximum available level when the certification was done', async function () {
              // given
              const expectedCapacity = 8;
              const cappedScoreForCapacity = 895;
              const answeredChallenges = allChallenges;
              const { answers, challengeCalibrationsWithoutLiveAlerts } =
                _buildDataFromAnsweredChallenges(answeredChallenges);

              const capacityHistory = [
                domainBuilder.buildCertificationChallengeCapacity({
                  certificationChallengeId: challengeCalibrationsWithoutLiveAlerts[0].certificationChallengeId,
                  capacity: expectedCapacity,
                }),
              ];

              const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
                capacityHistory,
              });

              scoringV3Deps.findByCertificationCourseAndVersion.resolves({
                allChallenges,
                askedChallengesWithoutLiveAlerts: allChallenges,
                challengeCalibrationsWithoutLiveAlerts,
              });
              assessmentSheet.answers = answers;

              sharedVersionRepository.getByScopeAndReconciliationDate
                .withArgs({
                  scope: SCOPES.CORE,
                  reconciliationDate: candidate.reconciledAt,
                })
                .resolves(version);
              flashAlgorithmService.getCapacityAndErrorRate
                .withArgs({
                  challenges: allChallenges,
                  allAnswers: answers,
                  capacity: version.challengesConfiguration.defaultCandidateCapacity,
                  variationPercent: version.challengesConfiguration.variationPercent,
                })
                .returns({
                  capacity: expectedCapacity,
                });

              flashAlgorithmService.getCapacityAndErrorRateHistory
                .withArgs({
                  challenges: challengeCalibrationsWithoutLiveAlerts,
                  allAnswers: answers,
                  capacity: version.challengesConfiguration.defaultCandidateCapacity,
                  variationPercent: version.challengesConfiguration.variationPercent,
                })
                .returns([
                  {
                    capacity: expectedCapacity,
                  },
                ]);

              // when
              await handleV3CertificationScoring({
                event,
                assessmentSheet,
                candidate,
                locale: 'fr',
                assessmentResultRepository,
                certificationAssessmentHistoryRepository,
                competenceMarkRepository,
                flashAlgorithmService,
                scoringConfigurationRepository,
                sharedCertificationCandidateRepository,
                sharedVersionRepository,
                scoringV3Deps,
              });

              // then
              const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
                nbPix: cappedScoreForCapacity,
                status: status.VALIDATED,
              });
              const expectedAssessmentResult = new AssessmentResult({
                pixScore: cappedScoreForCapacity,
                reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
                status: status.VALIDATED,
                assessmentId,
              });
              expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
                certificationCourseId,
                assessmentResult: expectedAssessmentResult,
              });
              expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
                certificationAssessmentHistory,
              );
            });
          });
        },
      );

      context('when the minimum number of answers required by the config were NOT answered', function () {
        context('when the certification was not finished due to a lack of time', function () {
          it('should save the score with a rejected status', async function () {
            // given
            assessmentSheet.abortReason = ABORT_REASONS.CANDIDATE;

            const answeredChallenges = allChallenges.slice(0, -2);
            const { answers, challengeCalibrationsWithoutLiveAlerts } =
              _buildDataFromAnsweredChallenges(answeredChallenges);

            const expectedCapacity = 2;
            const scoreForCapacity = 438;

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: challengeCalibrationsWithoutLiveAlerts[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            scoringV3Deps.findByCertificationCourseAndVersion.resolves({
              allChallenges: answeredChallenges,
              askedChallengesWithoutLiveAlerts: answeredChallenges,
              challengeCalibrationsWithoutLiveAlerts,
            });

            assessmentSheet.answers = answers;

            sharedVersionRepository.getByScopeAndReconciliationDate
              .withArgs({
                scope: SCOPES.CORE,
                reconciliationDate: candidate.reconciledAt,
              })
              .resolves(version);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: answeredChallenges,
                allAnswers: answers,
                capacity: version.challengesConfiguration.defaultCandidateCapacity,
                variationPercent: version.challengesConfiguration.variationPercent,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: challengeCalibrationsWithoutLiveAlerts,
                allAnswers: answers,
                capacity: version.challengesConfiguration.defaultCandidateCapacity,
                variationPercent: version.challengesConfiguration.variationPercent,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            const event = new CertificationJuryDone({
              certificationCourseId,
            });

            // when
            await handleV3CertificationScoring({
              event,
              assessmentSheet,
              candidate,
              locale: 'fr',
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              competenceMarkRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
              sharedCertificationCandidateRepository,
              sharedVersionRepository,
              scoringV3Deps,
            });

            // then
            const expectedResult = {
              certificationCourseId,
              assessmentResult: new AssessmentResult({
                pixScore: scoreForCapacity,
                reproducibilityRate: 100,
                status: AssessmentResult.status.REJECTED,
                competenceMarks: [],
                assessmentId,
                commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
                  commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
                }),
                commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
                  commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
                }),
              }),
            };

            expect(assessmentResultRepository.save).to.have.been.calledWith(expectedResult);
            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });

          it('builds and save a lack of answers assessment result', async function () {
            // given
            const expectedCapacity = 2;
            const scoreForCapacity = 438;
            assessmentSheet.abortReason = ABORT_REASONS.CANDIDATE;

            const answeredChallenges = allChallenges.slice(0, -2);
            const { answers, challengeCalibrationsWithoutLiveAlerts } =
              _buildDataFromAnsweredChallenges(answeredChallenges);

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: challengeCalibrationsWithoutLiveAlerts[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            scoringV3Deps.findByCertificationCourseAndVersion.resolves({
              allChallenges: answeredChallenges,
              askedChallengesWithoutLiveAlerts: answeredChallenges,
              challengeCalibrationsWithoutLiveAlerts,
            });

            assessmentSheet.answers = answers;

            sharedVersionRepository.getByScopeAndReconciliationDate
              .withArgs({
                scope: SCOPES.CORE,
                reconciliationDate: candidate.reconciledAt,
              })
              .resolves(version);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: answeredChallenges,
                allAnswers: answers,
                capacity: version.challengesConfiguration.defaultCandidateCapacity,
                variationPercent: version.challengesConfiguration.variationPercent,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: challengeCalibrationsWithoutLiveAlerts,
                allAnswers: answers,
                capacity: version.challengesConfiguration.defaultCandidateCapacity,
                variationPercent: version.challengesConfiguration.variationPercent,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            // when
            await handleV3CertificationScoring({
              event,
              assessmentSheet,
              candidate,
              locale: 'fr',
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              competenceMarkRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
              sharedCertificationCandidateRepository,
              sharedVersionRepository,
              scoringV3Deps,
            });

            // then
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
              nbPix: scoreForCapacity,
              status: status.REJECTED,
            });
            const expectedAssessmentResult = new AssessmentResult({
              pixScore: scoreForCapacity,
              reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
              status: status.REJECTED,
              assessmentId,
              commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
                commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
              }),
              commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
                commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
              }),
            });

            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId,
              assessmentResult: expectedAssessmentResult,
            });
            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });
        });

        describe('when the certification was not finished due to technical difficulties', function () {
          it('should save the score with a cancel status and cancel the certification course', async function () {
            // given
            const expectedCapacity = 2;
            const scoreForCapacity = 438;

            assessmentSheet.abortReason = ABORT_REASONS.TECHNICAL;

            const event = new CertificationJuryDone({
              certificationCourseId,
            });

            const answeredChallenges = allChallenges.slice(0, -2);
            const { answers, challengeCalibrationsWithoutLiveAlerts } =
              _buildDataFromAnsweredChallenges(answeredChallenges);

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: challengeCalibrationsWithoutLiveAlerts[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            scoringV3Deps.findByCertificationCourseAndVersion.resolves({
              allChallenges: answeredChallenges,
              askedChallengesWithoutLiveAlerts: answeredChallenges,
              challengeCalibrationsWithoutLiveAlerts,
            });

            assessmentSheet.answers = answers;

            sharedVersionRepository.getByScopeAndReconciliationDate
              .withArgs({
                scope: SCOPES.CORE,
                reconciliationDate: candidate.reconciledAt,
              })
              .resolves(version);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: answeredChallenges,
                allAnswers: answers,
                capacity: version.challengesConfiguration.defaultCandidateCapacity,
                variationPercent: version.challengesConfiguration.variationPercent,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: challengeCalibrationsWithoutLiveAlerts,
                allAnswers: answers,
                capacity: version.challengesConfiguration.defaultCandidateCapacity,
                variationPercent: version.challengesConfiguration.variationPercent,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            // when
            await handleV3CertificationScoring({
              event,
              assessmentSheet,
              candidate,
              locale: 'fr',
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              competenceMarkRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
              sharedCertificationCandidateRepository,
              sharedVersionRepository,
              scoringV3Deps,
            });

            // then
            const expectedResult = {
              certificationCourseId,
              assessmentResult: new AssessmentResult({
                pixScore: scoreForCapacity,
                reproducibilityRate: 100,
                status: AssessmentResult.status.CANCELLED,
                competenceMarks: [],
                assessmentId,
                commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
                  commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
                }),
                commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
                  commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
                }),
              }),
            };
            expect(assessmentResultRepository.save).to.have.been.calledWith(expectedResult);
            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });
        });
      });
    });

    context('when scoring a CLEA scoped certification', function () {
      beforeEach(function () {
        candidate = domainBuilder.certification.evaluation.buildCandidate({
          subscriptionScope: SCOPES.CORE,
          hasCleaSubscription: true,
        });
      });

      it('should return true because scoring happened', async function () {
        const hasScored = await handleV3CertificationScoring({
          candidate,
        });

        expect(hasScored).to.be.true;
      });
    });

    context('when scoring a not CORE scoped certification', function () {
      beforeEach(function () {
        candidate = domainBuilder.certification.evaluation.buildCandidate({
          subscriptionScope: SCOPES.PIX_PLUS_DROIT,
          hasCleaSubscription: false,
        });
      });

      it('should return false because no scoring occurred', async function () {
        const hasScored = await handleV3CertificationScoring({
          candidate,
        });

        expect(hasScored).to.be.false;
      });
    });
  });
});

const _generateCertificationChallengeForChallenge = ({ discriminant, difficulty, id }) => {
  return domainBuilder.certification.scoring.buildChallengeCalibration({
    id,
    discriminant,
    difficulty,
    certificationChallengeId: `certification-challenge-id-for-${id}`,
  });
};

const _buildDataFromAnsweredChallenges = (answeredChallenges) => {
  const challengeCalibrationsWithoutLiveAlerts = answeredChallenges.map(_generateCertificationChallengeForChallenge);
  const answers = generateAnswersForChallenges({ challenges: answeredChallenges });

  return { answers, challengeCalibrationsWithoutLiveAlerts };
};
