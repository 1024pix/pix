import { CertificationCompletedJobController } from '../../../../../../src/certification/evaluation/application/jobs/certification-completed-job-controller.js';
import { CertificationCompletedJob } from '../../../../../../src/certification/evaluation/domain/events/CertificationCompleted.js';
import { CertificationScoringCompleted } from '../../../../../../src/certification/evaluation/domain/events/CertificationScoringCompleted.js';
import { AssessmentResultFactory } from '../../../../../../src/certification/scoring/domain/models/factories/AssessmentResultFactory.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import {
  ABORT_REASONS,
  CertificationCourse,
} from '../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { V3_REPRODUCIBILITY_RATE } from '../../../../../../src/shared/domain/constants.js';
import { CertificationComputeError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Certification | Application | jobs | CertificationCompletedJobController', function () {
  let certificationCompletedJobController;
  let certificationAssessmentRepository;
  let assessmentResultRepository;
  let certificationCourseRepository;
  let scoringConfigurationRepository;
  let competenceMarkRepository;
  let answerRepository;
  let flashAlgorithmConfigurationRepository;
  let flashAlgorithmService;
  let certificationChallengeRepository;
  let certificationAssessmentHistoryRepository;
  let services;

  let now;
  let clock;
  let events;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now: new Date('2019-01-01T05:06:07Z'), toFake: ['Date'] });
    now = new Date(clock.now);

    certificationCompletedJobController = new CertificationCompletedJobController();

    services = {
      handleV2CertificationScoring: sinon.stub(),
      handleV3CertificationScoring: sinon.stub(),
    };
    certificationAssessmentRepository = { get: sinon.stub() };
    assessmentResultRepository = { save: sinon.stub() };
    certificationCourseRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
      getCreationDate: sinon.stub(),
    };
    scoringConfigurationRepository = { getLatestByDateAndLocale: sinon.stub() };
    competenceMarkRepository = { save: sinon.stub() };
    certificationChallengeRepository = { getByCertificationCourseId: sinon.stub() };
    answerRepository = { findByAssessment: sinon.stub() };
    flashAlgorithmConfigurationRepository = { getMostRecentBeforeDate: sinon.stub() };
    certificationAssessmentHistoryRepository = { save: sinon.stub() };
    events = { eventDispatcher: { dispatch: sinon.stub() } };
  });

  afterEach(function () {
    clock.restore();
  });

  context('when assessment is of type CERTIFICATION', function () {
    const assessmentId = 1214;
    const certificationCourseId = 1234;
    const userId = 4567;

    context('when certification is V2', function () {
      let data;
      let certificationAssessment;

      beforeEach(function () {
        data = new CertificationCompletedJob({
          assessmentId,
          userId,
          certificationCourseId: 123,
        });
        certificationAssessment = domainBuilder.buildCertificationAssessment({
          id: assessmentId,
          certificationCourseId,
          userId,
          version: AlgorithmEngineVersion.V2,
        });
        certificationAssessmentRepository.get.withArgs(assessmentId).resolves(certificationAssessment);
      });

      context('when an error different from a compute error happens', function () {
        it('should not save any results', async function () {
          // given
          const otherError = new Error();
          services.handleV2CertificationScoring.rejects(otherError);
          sinon.stub(AssessmentResultFactory, 'buildAlgoErrorResult');

          const dependencies = {
            certificationAssessmentRepository,
            services,
          };

          // when
          await catchErr(certificationCompletedJobController.handle)(data, dependencies);

          // then
          expect(AssessmentResultFactory.buildAlgoErrorResult).to.not.have.been.called;
          expect(assessmentResultRepository.save).to.not.have.been.called;
          expect(certificationCourseRepository.update).to.not.have.been.called;
          expect(events.eventDispatcher.dispatch).to.not.have.been.called;
        });
      });

      context('when an error of type CertificationComputeError happens while scoring the assessment', function () {
        it('should save the error result appropriately', async function () {
          // given
          const errorAssessmentResult = domainBuilder.buildAssessmentResult({ id: 98 });
          const certificationCourse = domainBuilder.buildCertificationCourse({
            id: certificationCourseId,
            completedAt: null,
          });
          const computeError = new CertificationComputeError();

          services.handleV2CertificationScoring.rejects(computeError);
          sinon.stub(AssessmentResultFactory, 'buildAlgoErrorResult').returns(errorAssessmentResult);
          assessmentResultRepository.save.resolves(errorAssessmentResult);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          certificationCourseRepository.update.resolves(certificationCourse);

          const dependencies = {
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            certificationAssessmentRepository,
            services,
          };

          // when
          await certificationCompletedJobController.handle({ data, dependencies });

          // then
          expect(AssessmentResultFactory.buildAlgoErrorResult).to.have.been.calledWithExactly({
            error: computeError,
            assessmentId: certificationAssessment.id,
          });
          expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
            certificationCourseId: 1234,
            assessmentResult: errorAssessmentResult,
          });
          expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
            certificationCourse: new CertificationCourse({
              ...certificationCourse.toDTO(),
              completedAt: new Date(clock.now),
            }),
          });
          expect(events.eventDispatcher.dispatch).to.not.have.been.called;
        });
      });

      context('when scoring is successful', function () {
        it('should save a complete certification course', async function () {
          // given
          const assessmentResultId = 1234;
          const certificationCourse = domainBuilder.buildCertificationCourse({
            id: certificationCourseId,
            completedAt: null,
            isCancelled: false,
            abortReason: null,
          });
          const competenceMark1 = domainBuilder.buildCompetenceMark({ assessmentResultId, score: 5 });
          const competenceMark2 = domainBuilder.buildCompetenceMark({ assessmentResultId, score: 4 });
          const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            competenceMarks: [competenceMark1, competenceMark2],
            percentageCorrectAnswers: 80,
          });

          certificationCourseRepository.update.resolves(certificationCourse);
          services.handleV2CertificationScoring.resolves({
            certificationCourse,
            certificationAssessmentScore,
          });

          const dependencies = {
            assessmentResultRepository,
            certificationAssessmentRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            services,
            events,
          };

          // when
          await certificationCompletedJobController.handle({ data, dependencies });

          // then
          expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
            certificationCourse: new CertificationCourse({
              ...certificationCourse.toDTO(),
              completedAt: new Date(clock.now),
            }),
          });
          expect(events.eventDispatcher.dispatch).to.have.been.calledOnceWithExactly(
            new CertificationScoringCompleted({
              userId,
              certificationCourseId: certificationCourseId,
              reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
            }),
          );
        });
      });

      context('when assessment only has only complementary certification challenges', function () {
        it('should return', async function () {
          // given
          const certificationAssessmentWithOnlyComplementaryCertificationChallenges =
            domainBuilder.buildCertificationAssessment({
              id: assessmentId,
              certificationCourseId,
              userId,
              version: AlgorithmEngineVersion.V2,
              certificationChallenges: [
                domainBuilder.buildCertificationChallengeWithType({
                  id: 1234,
                  certifiableBadgeKey: 'TOTO',
                }),
                domainBuilder.buildCertificationChallengeWithType({
                  id: 567,
                  certifiableBadgeKey: 'TOTO',
                }),
                domainBuilder.buildCertificationChallengeWithType({
                  id: 8910,
                  certifiableBadgeKey: 'TOTO',
                }),
              ],
            });
          certificationAssessmentRepository.get
            .withArgs(assessmentId)
            .resolves(certificationAssessmentWithOnlyComplementaryCertificationChallenges);

          const dependencies = {
            assessmentResultRepository,
            certificationAssessmentRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            services,
            events,
          };

          // when
          await certificationCompletedJobController.handle({ data, dependencies });

          // then
          expect(certificationCourseRepository.update).to.not.have.been.called;
          expect(events.eventDispatcher.dispatch).to.not.have.been.called;
        });
      });
    });

    context('when certification is V3', function () {
      let data;
      let certificationAssessment;
      let certificationCourse;
      const assessmentResultId = 99;
      const certificationCourseStartDate = new Date('2022-02-01');

      beforeEach(function () {
        data = new CertificationCompletedJob({
          assessmentId,
          userId,
          certificationCourseId: 123,
        });
        certificationAssessment = {
          id: assessmentId,
          certificationCourseId,
          userId,
          createdAt: Symbol('someCreationDate'),
          version: AlgorithmEngineVersion.V3,
        };
        certificationAssessmentRepository.get.withArgs(assessmentId).resolves(certificationAssessment);
        certificationCourse = domainBuilder.buildCertificationCourse({
          id: certificationCourseId,
          createdAt: certificationCourseStartDate,
          completedAt: null,
        });

        flashAlgorithmService = {
          getCapacityAndErrorRate: sinon.stub(),
          getCapacityAndErrorRateHistory: sinon.stub(),
        };

        const scoringConfiguration = domainBuilder.buildV3CertificationScoring({
          competencesForScoring: [domainBuilder.buildCompetenceForScoring()],
        });

        scoringConfigurationRepository.getLatestByDateAndLocale.resolves(scoringConfiguration);

        assessmentResultRepository.save.resolves(
          domainBuilder.buildAssessmentResult({
            id: assessmentResultId,
          }),
        );
      });

      describe('when less than the minimum number of answers required by the config has been answered', function () {
        describe('when the candidate did not finish due to a lack of time', function () {
          it('completes the certification', async function () {
            // given
            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              id: certificationCourseId,
              createdAt: certificationCourseStartDate,
              abortReason: ABORT_REASONS.CANDIDATE,
            });

            services.handleV3CertificationScoring.resolves(abortedCertificationCourse);

            const dependencies = {
              certificationChallengeRepository,
              answerRepository,
              assessmentResultRepository,
              certificationCourseRepository,
              scoringConfigurationRepository,
              competenceMarkRepository,
              services,
              certificationAssessmentRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              certificationAssessmentHistoryRepository,
              events,
            };

            // when
            await certificationCompletedJobController.handle({ data, dependencies });

            // then
            expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
              certificationCourse: new CertificationCourse({
                ...certificationCourse.toDTO(),
                completedAt: now,
                abortReason: ABORT_REASONS.CANDIDATE,
              }),
            });
            expect(events.eventDispatcher.dispatch).to.have.been.calledOnceWithExactly(
              new CertificationScoringCompleted({
                userId,
                certificationCourseId: certificationCourseId,
                reproducibilityRate: V3_REPRODUCIBILITY_RATE,
              }),
            );
          });
        });
      });

      describe('when at least the minimum number of answers required by the config has been answered', function () {
        describe('when the certification was completed', function () {
          it('completes the certification', async function () {
            // given
            const certificationCourse = domainBuilder.buildCertificationCourse({
              id: certificationCourseId,
              createdAt: certificationCourseStartDate,
              isCancelled: false,
              completedAt: null,
            });

            services.handleV3CertificationScoring.resolves(certificationCourse);

            const dependencies = {
              certificationChallengeRepository,
              answerRepository,
              assessmentResultRepository,
              certificationCourseRepository,
              scoringConfigurationRepository,
              competenceMarkRepository,
              services,
              certificationAssessmentRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              certificationAssessmentHistoryRepository,
              events,
            };

            // when
            await certificationCompletedJobController.handle({ data, dependencies });

            // then
            expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
              certificationCourse: new CertificationCourse({
                ...certificationCourse.toDTO(),
                completedAt: now,
              }),
            });
            expect(events.eventDispatcher.dispatch).to.have.been.calledOnceWithExactly(
              new CertificationScoringCompleted({
                userId,
                certificationCourseId: certificationCourseId,
                reproducibilityRate: V3_REPRODUCIBILITY_RATE,
              }),
            );
          });
        });

        describe('when the certification was not completed', function () {
          describe('when the candidate did not finish due to technical difficulties', function () {
            it('completes the certification with the raw score', async function () {
              // given
              const abortReason = ABORT_REASONS.TECHNICAL;
              const certificationCourse = domainBuilder.buildCertificationCourse({
                id: certificationCourseId,
                createdAt: certificationCourseStartDate,
                isCancelled: false,
                completedAt: null,
                abortReason,
              });

              services.handleV3CertificationScoring.resolves(certificationCourse);

              const dependencies = {
                certificationChallengeRepository,
                answerRepository,
                assessmentResultRepository,
                certificationCourseRepository,
                scoringConfigurationRepository,
                competenceMarkRepository,
                services,
                certificationAssessmentRepository,
                flashAlgorithmConfigurationRepository,
                flashAlgorithmService,
                certificationAssessmentHistoryRepository,
                events,
              };

              // when
              await certificationCompletedJobController.handle({ data, dependencies });

              // then
              expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
                certificationCourse: new CertificationCourse({
                  ...certificationCourse.toDTO(),
                  completedAt: now,
                  abortReason,
                }),
              });
              expect(events.eventDispatcher.dispatch).to.have.been.calledOnceWithExactly(
                new CertificationScoringCompleted({
                  userId,
                  certificationCourseId: certificationCourseId,
                  reproducibilityRate: V3_REPRODUCIBILITY_RATE,
                }),
              );
            });
          });

          describe('when the candidate did not finish in time', function () {
            it('completes the certification', async function () {
              // given
              const abortReason = ABORT_REASONS.CANDIDATE;
              const certificationCourse = domainBuilder.buildCertificationCourse({
                id: certificationCourseId,
                createdAt: certificationCourseStartDate,
                isCancelled: false,
                completedAt: null,
                abortReason,
              });

              services.handleV3CertificationScoring.resolves(certificationCourse);

              const dependencies = {
                certificationChallengeRepository,
                answerRepository,
                assessmentResultRepository,
                certificationCourseRepository,
                scoringConfigurationRepository,
                competenceMarkRepository,
                services,
                certificationAssessmentRepository,
                flashAlgorithmConfigurationRepository,
                flashAlgorithmService,
                certificationAssessmentHistoryRepository,
                events,
              };

              // when
              await certificationCompletedJobController.handle({ data, dependencies });

              // then
              expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
                certificationCourse: new CertificationCourse({
                  ...certificationCourse.toDTO(),
                  completedAt: now,
                  abortReason,
                }),
              });
              expect(events.eventDispatcher.dispatch).to.have.been.calledOnceWithExactly(
                new CertificationScoringCompleted({
                  userId,
                  certificationCourseId: certificationCourseId,
                  reproducibilityRate: V3_REPRODUCIBILITY_RATE,
                }),
              );
            });
          });
        });
      });
    });
  });
});
