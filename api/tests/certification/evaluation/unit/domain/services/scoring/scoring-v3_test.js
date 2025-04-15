import { CertificationCompletedJob } from '../../../../../../../src/certification/evaluation/domain/events/CertificationCompleted.js';
import { handleV3CertificationScoring } from '../../../../../../../src/certification/evaluation/domain/services/scoring/scoring-v3.js';
import { CertificationCourseRejected } from '../../../../../../../src/certification/session-management/domain/events/CertificationCourseRejected.js';
import { CertificationJuryDone } from '../../../../../../../src/certification/session-management/domain/events/CertificationJuryDone.js';
import { AlgorithmEngineVersion } from '../../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { ABORT_REASONS } from '../../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { AutoJuryCommentKeys } from '../../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { config } from '../../../../../../../src/shared/config.js';
import { AssessmentResult, status } from '../../../../../../../src/shared/domain/models/AssessmentResult.js';
import { domainBuilder, expect, sinon } from '../../../../../../test-helper.js';
import { generateAnswersForChallenges, generateChallengeList } from '../../../../../shared/fixtures/challenges.js';

const { minimumAnswersRequiredToValidateACertification } = config.v3Certification.scoring;

const maximumAssessmentLength = 32;

describe('Certification | Shared | Unit | Domain | Services | Scoring V3', function () {
  context('#handleV3CertificationScoring', function () {
    let answerRepository,
      assessmentResultRepository,
      certificationAssessmentHistoryRepository,
      certificationCourseRepository,
      competenceMarkRepository,
      flashAlgorithmConfigurationRepository,
      flashAlgorithmService,
      scoringDegradationService,
      scoringConfigurationRepository,
      baseFlashAlgorithmConfiguration,
      dependencies;
    let clock;
    const now = new Date('2019-01-01T05:06:07Z');
    let allChallenges;

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      allChallenges = generateChallengeList({ length: minimumAnswersRequiredToValidateACertification + 1 });

      answerRepository = {
        findByAssessment: sinon.stub().rejects(new Error('Args mismatch')),
      };
      assessmentResultRepository = { save: sinon.stub().rejects(new Error('Args mismatch')) };
      certificationAssessmentHistoryRepository = { save: sinon.stub() };
      certificationCourseRepository = { get: sinon.stub().rejects(new Error('Args mismatch')) };
      competenceMarkRepository = { save: sinon.stub().rejects(new Error('Args mismatch')) };
      flashAlgorithmConfigurationRepository = { getMostRecentBeforeDate: sinon.stub() };
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
        getLatestByDateAndLocale: sinon.stub().callsFake((a) => {
          throw new Error(`Args mismatch: ${a}`);
        }),
      };

      baseFlashAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
        maximumAssessmentLength,
      });

      dependencies = {
        findByCertificationCourseIdAndAssessmentId: sinon.stub(),
      };
    });

    afterEach(function () {
      clock.restore();
    });

    context('for scoring certification', function () {
      let event;
      let certificationAssessment;
      let certificationCourse;
      let assessmentResult;
      const assessmentResultId = 99;
      const assessmentId = 1214;
      const certificationCourseId = 1234;
      const userId = 4567;
      const certificationCourseStartDate = new Date('2022-02-01');
      let scoringConfiguration;
      const scoreForCapacity = 438;
      let baseFlashAlgorithmConfig;

      beforeEach(function () {
        event = new CertificationCompletedJob({
          assessmentId,
          userId,
          certificationCourseId: 123,
        });
        certificationAssessment = {
          id: assessmentId,
          certificationCourseId,
          userId,
          createdAt: Symbol('someCreationDate'),
          version: 3,
        };
        certificationCourse = domainBuilder.buildCertificationCourse({
          id: certificationCourseId,
          createdAt: certificationCourseStartDate,
          completedAt: null,
        });

        scoringConfiguration = domainBuilder.buildV3CertificationScoring({
          competencesForScoring: [domainBuilder.buildCompetenceForScoring()],
        });

        scoringConfigurationRepository.getLatestByDateAndLocale
          .withArgs({ locale: 'fr', date: certificationCourse.getStartDate() })
          .resolves(scoringConfiguration);

        assessmentResult = domainBuilder.buildAssessmentResult({
          id: assessmentResultId,
          pixScore: scoreForCapacity,
          reproducibilityRate: 100,
          status: AssessmentResult.status.VALIDATED,
          competenceMarks: [],
          assessmentId: 123,
          juryId: 1,
        });

        assessmentResultRepository.save.resolves(assessmentResult);
        competenceMarkRepository.save.resolves();

        baseFlashAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
          maximumAssessmentLength,
        });
      });

      it('should save the score', async function () {
        // given
        const certificationCourseStartDate = new Date('2022-01-01');
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          version: AlgorithmEngineVersion.V3,
        });

        const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
          createdAt: certificationCourseStartDate,
        });

        const challenges = generateChallengeList({ length: maximumAssessmentLength });
        const challengeCalibrationsWithoutLiveAlerts = challenges.map(_generateCertificationChallengeForChallenge);
        const answers = generateAnswersForChallenges({ challenges });

        const expectedCapacity = 2;
        const { certificationCourseId } = certificationAssessment;

        const capacityHistory = [
          domainBuilder.buildCertificationChallengeCapacity({
            certificationChallengeId: challengeCalibrationsWithoutLiveAlerts[0].certificationChallengeId,
            capacity: expectedCapacity,
          }),
        ];

        const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
          capacityHistory,
        });

        scoringConfigurationRepository.getLatestByDateAndLocale
          .withArgs({ locale: 'fr', date: abortedCertificationCourse.getStartDate() })
          .resolves(scoringConfiguration);

        flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
          .withArgs(certificationCourseStartDate)
          .resolves(baseFlashAlgorithmConfig);

        answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

        certificationCourseRepository.get
          .withArgs({ id: certificationAssessment.certificationCourseId })
          .resolves(abortedCertificationCourse);

        flashAlgorithmService.getCapacityAndErrorRate
          .withArgs({
            challenges,
            allAnswers: answers,
            capacity: sinon.match.number,
            variationPercent: undefined,
          })
          .returns({
            capacity: expectedCapacity,
          });

        flashAlgorithmService.getCapacityAndErrorRateHistory
          .withArgs({
            challenges: challengeCalibrationsWithoutLiveAlerts,
            allAnswers: answers,
            capacity: sinon.match.number,
            variationPercent: undefined,
          })
          .returns([
            {
              capacity: expectedCapacity,
            },
          ]);

        dependencies.findByCertificationCourseIdAndAssessmentId.resolves({
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
          certificationAssessment,
          locale: 'fr',
          answerRepository,
          assessmentResultRepository,
          certificationAssessmentHistoryRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          flashAlgorithmConfigurationRepository,
          flashAlgorithmService,
          scoringConfigurationRepository,
          dependencies,
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

        expect(expectedCertificationCourse).to.deep.equal(abortedCertificationCourse);

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

      describe('when at least the minimum number of answers required by the config has been answered', function () {
        describe('when the certification was completed', function () {
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

            dependencies.findByCertificationCourseIdAndAssessmentId.resolves({
              allChallenges: answeredChallenges,
              askedChallengesWithoutLiveAlerts: answeredChallenges,
              challengeCalibrationsWithoutLiveAlerts,
            });

            answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
            certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);
            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(certificationCourseStartDate)
              .resolves(baseFlashAlgorithmConfiguration);
            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: answeredChallenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });
            assessmentResultRepository.save.resolves(domainBuilder.buildAssessmentResult({ id: assessmentResultId }));

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: challengeCalibrationsWithoutLiveAlerts,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            // when
            await handleV3CertificationScoring({
              event,
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
              dependencies,
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
              assessmentId: certificationAssessment.id,
            });
            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 1234,
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

          describe('when the certification would reach a very high score', function () {
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

              dependencies.findByCertificationCourseIdAndAssessmentId.resolves({
                allChallenges,
                askedChallengesWithoutLiveAlerts: allChallenges,
                challengeCalibrationsWithoutLiveAlerts,
              });
              answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
              certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);
              flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
                .withArgs(certificationCourseStartDate)
                .resolves(baseFlashAlgorithmConfiguration);
              flashAlgorithmService.getCapacityAndErrorRate
                .withArgs({
                  challenges: allChallenges,
                  allAnswers: answers,
                  capacity: sinon.match.number,
                  variationPercent: undefined,
                })
                .returns({
                  capacity: expectedCapacity,
                });

              flashAlgorithmService.getCapacityAndErrorRateHistory
                .withArgs({
                  challenges: challengeCalibrationsWithoutLiveAlerts,
                  allAnswers: answers,
                  capacity: sinon.match.number,
                  variationPercent: undefined,
                })
                .returns([
                  {
                    capacity: expectedCapacity,
                  },
                ]);

              // when
              await handleV3CertificationScoring({
                event,
                certificationAssessment,
                locale: 'fr',
                answerRepository,
                assessmentResultRepository,
                certificationAssessmentHistoryRepository,
                certificationCourseRepository,
                competenceMarkRepository,
                flashAlgorithmConfigurationRepository,
                flashAlgorithmService,
                scoringConfigurationRepository,
                dependencies,
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
                assessmentId: certificationAssessment.id,
              });
              expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
                certificationCourseId: 1234,
                assessmentResult: expectedAssessmentResult,
              });
              expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
                certificationAssessmentHistory,
              );
            });
          });
        });
      });
    });

    context('for rescoring certification', function () {
      let baseFlashAlgorithmConfig,
        scoringConfiguration,
        assessmentId,
        certificationCourseId,
        certificationCourseStartDate,
        event,
        certificationAssessment;

      beforeEach(function () {
        assessmentId = 1214;
        certificationCourseId = 1234;
        certificationCourseStartDate = new Date('2022-01-01');
        event = new CertificationJuryDone({
          certificationCourseId,
        });
        certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationCourseId,
          id: assessmentId,
          version: AlgorithmEngineVersion.V3,
        });
        baseFlashAlgorithmConfig = domainBuilder.buildFlashAlgorithmConfiguration({
          maximumAssessmentLength,
        });

        scoringConfiguration = domainBuilder.buildV3CertificationScoring({
          competencesForScoring: [domainBuilder.buildCompetenceForScoring()],
        });

        assessmentResultRepository.save.resolves(domainBuilder.buildAssessmentResult());
        competenceMarkRepository.save.resolves();
      });

      describe('when the minimum number of answers required by the config were NOT answered', function () {
        describe('when the certification was not finished due to a lack of time', function () {
          it('should save the score with a rejected status', async function () {
            // given
            const certificationAssessment = domainBuilder.buildCertificationAssessment({
              version: AlgorithmEngineVersion.V3,
            });

            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              abortReason: ABORT_REASONS.CANDIDATE,
            });

            const answeredChallenges = allChallenges.slice(0, -2);
            const { answers, challengeCalibrationsWithoutLiveAlerts } =
              _buildDataFromAnsweredChallenges(answeredChallenges);

            const expectedCapacity = 2;
            const scoreForCapacity = 438;
            const { certificationCourseId } = certificationAssessment;

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: challengeCalibrationsWithoutLiveAlerts[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            dependencies.findByCertificationCourseIdAndAssessmentId.resolves({
              allChallenges: answeredChallenges,
              askedChallengesWithoutLiveAlerts: answeredChallenges,
              challengeCalibrationsWithoutLiveAlerts,
            });

            answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(abortedCertificationCourse);

            scoringConfigurationRepository.getLatestByDateAndLocale
              .withArgs({ locale: 'fr', date: abortedCertificationCourse.getStartDate() })
              .resolves(scoringConfiguration);

            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(certificationCourseStartDate)
              .resolves(baseFlashAlgorithmConfiguration);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: answeredChallenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: challengeCalibrationsWithoutLiveAlerts,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
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
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
              dependencies,
            });

            // then
            const expectedResult = {
              certificationCourseId,
              assessmentResult: new AssessmentResult({
                pixScore: scoreForCapacity,
                reproducibilityRate: 100,
                status: AssessmentResult.status.REJECTED,
                competenceMarks: [],
                assessmentId: 123,
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
            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              id: certificationCourseId,
              createdAt: certificationCourseStartDate,
              abortReason: ABORT_REASONS.CANDIDATE,
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

            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(certificationCourseStartDate)
              .resolves(baseFlashAlgorithmConfiguration);

            dependencies.findByCertificationCourseIdAndAssessmentId.resolves({
              allChallenges: answeredChallenges,
              askedChallengesWithoutLiveAlerts: answeredChallenges,
              challengeCalibrationsWithoutLiveAlerts,
            });

            answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
            certificationCourseRepository.get
              .withArgs({ id: certificationCourseId })
              .resolves(abortedCertificationCourse);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: answeredChallenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: challengeCalibrationsWithoutLiveAlerts,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);
            scoringConfigurationRepository.getLatestByDateAndLocale
              .withArgs({ locale: 'fr', date: abortedCertificationCourse.getStartDate() })
              .resolves(scoringConfiguration);

            // when
            await handleV3CertificationScoring({
              event,
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
              dependencies,
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
              assessmentId: certificationAssessment.id,
              commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
                commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
              }),
              commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
                commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
              }),
            });

            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 1234,
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

            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              id: 675,
              abortReason: ABORT_REASONS.TECHNICAL,
              completedAt: null,
              createdAt: certificationCourseStartDate,
            });

            const event = new CertificationJuryDone({
              certificationCourseId: abortedCertificationCourse.getId(),
            });

            const certificationAssessment = domainBuilder.buildCertificationAssessment({
              version: AlgorithmEngineVersion.V3,
              certificationCourseId: abortedCertificationCourse.getId(),
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

            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(certificationCourseStartDate)
              .resolves(baseFlashAlgorithmConfiguration);

            dependencies.findByCertificationCourseIdAndAssessmentId.resolves({
              allChallenges: answeredChallenges,
              askedChallengesWithoutLiveAlerts: answeredChallenges,
              challengeCalibrationsWithoutLiveAlerts,
            });

            scoringConfigurationRepository.getLatestByDateAndLocale
              .withArgs({ locale: 'fr', date: abortedCertificationCourse.getStartDate() })
              .resolves(scoringConfiguration);

            answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

            certificationCourseRepository.get
              .withArgs({ id: abortedCertificationCourse.getId() })
              .resolves(abortedCertificationCourse);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: answeredChallenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: challengeCalibrationsWithoutLiveAlerts,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            // when
            await handleV3CertificationScoring({
              event,
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
              dependencies,
            });

            // then
            const expectedResult = {
              certificationCourseId: abortedCertificationCourse.getId(),
              assessmentResult: new AssessmentResult({
                pixScore: scoreForCapacity,
                reproducibilityRate: 100,
                status: AssessmentResult.status.CANCELLED,
                competenceMarks: [],
                assessmentId: certificationAssessment.id,
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

      describe('when the minimum number of answers required by the config were answered', function () {
        describe('when the candidate did not finish in time', function () {
          it('should build and save an assessment result with a validated status', async function () {
            // given
            const expectedCapacity = 2;
            const pixScore = 438;
            const answeredChallenges = allChallenges.slice(0, -1);
            const { answers, challengeCalibrationsWithoutLiveAlerts } =
              _buildDataFromAnsweredChallenges(answeredChallenges);

            const abortReason = ABORT_REASONS.CANDIDATE;
            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              id: certificationCourseId,
              createdAt: certificationCourseStartDate,
              completedAt: null,
              abortReason,
            });

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: challengeCalibrationsWithoutLiveAlerts[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            const challengeExcludedFromCalibration = domainBuilder.buildChallenge({
              ...answeredChallenges[0],
              discriminant: null,
              difficulty: null,
            });

            const challengesAfterCalibration = answeredChallenges.slice(1);

            dependencies.findByCertificationCourseIdAndAssessmentId.resolves({
              allChallenges: [challengeExcludedFromCalibration, ...challengesAfterCalibration],
              askedChallengesWithoutLiveAlerts: [challengeExcludedFromCalibration, ...challengesAfterCalibration],
              challengeCalibrationsWithoutLiveAlerts,
            });
            answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
            certificationCourseRepository.get
              .withArgs({ id: certificationCourseId })
              .resolves(abortedCertificationCourse);
            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(certificationCourseStartDate)
              .resolves(baseFlashAlgorithmConfiguration);
            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: [challengeExcludedFromCalibration, ...challengesAfterCalibration],
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });
            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: challengeCalibrationsWithoutLiveAlerts,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            scoringConfigurationRepository.getLatestByDateAndLocale
              .withArgs({ locale: 'fr', date: abortedCertificationCourse.getStartDate() })
              .resolves(scoringConfiguration);

            scoringDegradationService.downgradeCapacity.returns(expectedCapacity);

            // when
            await handleV3CertificationScoring({
              event,
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
              dependencies,
              scoringDegradationService,
            });

            // then
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
              nbPix: pixScore,
              status: status.VALIDATED,
            });
            const expectedAssessmentResult = new AssessmentResult({
              pixScore,
              reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
              status: status.VALIDATED,
              assessmentId: certificationAssessment.id,
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

        describe('when the candidate did not finish due to technical difficulties', function () {
          it('should save the raw score', async function () {
            // given
            const certificationCourseStartDate = new Date('2022-01-01');
            const certificationAssessment = domainBuilder.buildCertificationAssessment({
              version: AlgorithmEngineVersion.V3,
            });

            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              abortReason: ABORT_REASONS.TECHNICAL,
              createdAt: certificationCourseStartDate,
            });

            const answeredChallenges = allChallenges.slice(0, -1);
            const { answers, challengeCalibrationsWithoutLiveAlerts } =
              _buildDataFromAnsweredChallenges(answeredChallenges);

            const expectedCapacity = 2;
            const rawScore = 438;
            const { certificationCourseId } = certificationAssessment;

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: challengeCalibrationsWithoutLiveAlerts[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            dependencies.findByCertificationCourseIdAndAssessmentId.resolves({
              allChallenges: answeredChallenges,
              askedChallengesWithoutLiveAlerts: answeredChallenges,
              challengeCalibrationsWithoutLiveAlerts,
            });

            scoringConfigurationRepository.getLatestByDateAndLocale
              .withArgs({ locale: 'fr', date: abortedCertificationCourse.getStartDate() })
              .resolves(scoringConfiguration);

            answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(abortedCertificationCourse);

            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(abortedCertificationCourse.getStartDate())
              .resolves(baseFlashAlgorithmConfig);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: answeredChallenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: challengeCalibrationsWithoutLiveAlerts,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
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
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
              dependencies,
            });

            // then
            const expectedResult = {
              certificationCourseId,
              assessmentResult: new AssessmentResult({
                pixScore: rawScore,
                reproducibilityRate: 100,
                status: AssessmentResult.status.VALIDATED,
                competenceMarks: [],
                assessmentId: 123,
              }),
            };

            expect(assessmentResultRepository.save).to.have.been.calledWith(expectedResult);
            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });
        });
      });

      describe('when all questions were answered', function () {
        describe('when certification is rejected for fraud', function () {
          it('should save the score with rejected status', async function () {
            const certificationCourseStartDate = new Date('2022-01-01');
            // given
            const certificationAssessment = domainBuilder.buildCertificationAssessment({
              version: AlgorithmEngineVersion.V3,
            });

            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              isRejectedForFraud: true,
              createdAt: certificationCourseStartDate,
            });

            const answeredChallenges = allChallenges.slice(0, -1);
            const { answers, challengeCalibrationsWithoutLiveAlerts } =
              _buildDataFromAnsweredChallenges(answeredChallenges);

            const expectedCapacity = 2;
            const scoreForCapacity = 438;
            const { certificationCourseId } = certificationAssessment;

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: challengeCalibrationsWithoutLiveAlerts[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            dependencies.findByCertificationCourseIdAndAssessmentId.resolves({
              allChallenges: answeredChallenges,
              askedChallengesWithoutLiveAlerts: answeredChallenges,
              challengeCalibrationsWithoutLiveAlerts,
            });

            scoringConfigurationRepository.getLatestByDateAndLocale
              .withArgs({ locale: 'fr', date: abortedCertificationCourse.getStartDate() })
              .resolves(scoringConfiguration);

            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(certificationCourseStartDate)
              .resolves(baseFlashAlgorithmConfig);

            answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(abortedCertificationCourse);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: answeredChallenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: challengeCalibrationsWithoutLiveAlerts,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            const event = new CertificationCourseRejected({
              certificationCourseId,
              juryId: 7,
            });

            // when
            await handleV3CertificationScoring({
              event,
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
              dependencies,
            });

            // then
            const assessmentResultToBeSaved = domainBuilder.certification.scoring.buildAssessmentResult.fraud({
              pixScore: scoreForCapacity,
              reproducibilityRate: 100,
              assessmentId: 123,
              juryId: 7,
            });

            expect(assessmentResultRepository.save).to.have.been.calledWith({
              certificationCourseId: 123,
              assessmentResult: assessmentResultToBeSaved,
            });
            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });
        });

        describe('when the certification would reach a very high score', function () {
          it('should return the score capped based on the maximum available level when the certification was done', async function () {
            // given
            const certificationCourseStartDate = new Date('2022-01-01');

            const certificationAssessment = domainBuilder.buildCertificationAssessment({
              version: AlgorithmEngineVersion.V3,
            });

            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              createdAt: certificationCourseStartDate,
            });

            const answeredChallenges = allChallenges;
            const { answers, challengeCalibrationsWithoutLiveAlerts } =
              _buildDataFromAnsweredChallenges(answeredChallenges);

            const expectedCapacity = 8;
            const cappedscoreForCapacity = 895;
            const { certificationCourseId } = certificationAssessment;

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: challengeCalibrationsWithoutLiveAlerts[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            dependencies.findByCertificationCourseIdAndAssessmentId.resolves({
              allChallenges: allChallenges,
              askedChallengesWithoutLiveAlerts: allChallenges,
              challengeCalibrationsWithoutLiveAlerts,
            });

            scoringConfigurationRepository.getLatestByDateAndLocale
              .withArgs({ locale: 'fr', date: abortedCertificationCourse.getStartDate() })
              .resolves(scoringConfiguration);

            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(certificationCourseStartDate)
              .resolves(baseFlashAlgorithmConfig);

            answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(abortedCertificationCourse);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: allChallenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: challengeCalibrationsWithoutLiveAlerts,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            const expectedResult = {
              certificationCourseId,
              assessmentResult: new AssessmentResult({
                pixScore: cappedscoreForCapacity,
                reproducibilityRate: 100,
                status: AssessmentResult.status.VALIDATED,
                competenceMarks: [],
                assessmentId: 123,
              }),
            };

            const event = new CertificationJuryDone({
              certificationCourseId,
            });

            // when
            await handleV3CertificationScoring({
              event,
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
              dependencies,
            });

            // then
            expect(assessmentResultRepository.save).to.have.been.calledWith(expectedResult);
            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });
        });
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
