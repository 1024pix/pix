import { AssessmentCompleted } from '../../../../lib/domain/events/AssessmentCompleted.js';
import { CertificationScoringCompleted } from '../../../../lib/domain/events/CertificationScoringCompleted.js';
import { _forTestOnly } from '../../../../lib/domain/events/index.js';
import { AssessmentResultFactory } from '../../../../src/certification/scoring/domain/models/factories/AssessmentResultFactory.js';
import {
  ABORT_REASONS,
  CertificationCourse,
} from '../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { CertificationComputeError } from '../../../../src/shared/domain/errors.js';
import { AssessmentResult } from '../../../../src/shared/domain/models/AssessmentResult.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';

const { handleCertificationScoring } = _forTestOnly.handlers;

describe('Unit | Domain | Events | handle-certification-scoring', function () {
  let scoringCertificationService;
  let certificationAssessmentRepository;
  let assessmentResultRepository;
  let certificationCourseRepository;
  let scoringConfigurationRepository;
  let competenceMarkRepository;
  let answerRepository;
  let flashAlgorithmConfigurationRepository;
  let flashAlgorithmService;
  let certificationChallengeForScoringRepository;
  let certificationAssessmentHistoryRepository;

  const now = new Date('2019-01-01T05:06:07Z');
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

    scoringCertificationService = {
      isLackOfAnswersForTechnicalReason: sinon.stub(),
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
    certificationChallengeForScoringRepository = { getByCertificationCourseId: sinon.stub() };
    answerRepository = { findByAssessment: sinon.stub() };
    flashAlgorithmConfigurationRepository = { getMostRecentBeforeDate: sinon.stub() };
    certificationAssessmentHistoryRepository = { save: sinon.stub() };
  });

  afterEach(function () {
    clock.restore();
  });

  context('when assessment is of type CERTIFICATION', function () {
    const assessmentId = 1214;
    const certificationCourseId = 1234;
    const userId = 4567;

    it('fails when event is not of correct type', async function () {
      // given
      const event = 'not an event of the correct type';

      // when
      const error = await catchErr(handleCertificationScoring)({ event });

      // then
      expect(error).not.to.be.null;
    });

    context('when certification is V2', function () {
      let event;
      let certificationAssessment;

      beforeEach(function () {
        event = new AssessmentCompleted({
          assessmentId,
          userId,
          certificationCourseId: 123,
        });
        certificationAssessment = domainBuilder.buildCertificationAssessment({
          id: assessmentId,
          certificationCourseId,
          userId,
        });
        certificationAssessmentRepository.get.withArgs(assessmentId).resolves(certificationAssessment);
      });

      context('when an error different from a compute error happens', function () {
        it('should not save any results', async function () {
          // given
          const otherError = new Error();
          scoringCertificationService.handleV2CertificationScoring.rejects(otherError);
          sinon.stub(AssessmentResultFactory, 'buildAlgoErrorResult');

          // when
          await catchErr(handleCertificationScoring)({
            event,
            certificationAssessmentRepository,
            scoringCertificationService,
          });

          // then
          expect(AssessmentResultFactory.buildAlgoErrorResult).to.not.have.been.called;
          expect(assessmentResultRepository.save).to.not.have.been.called;
          expect(certificationCourseRepository.update).to.not.have.been.called;
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

          scoringCertificationService.handleV2CertificationScoring.rejects(computeError);
          sinon.stub(AssessmentResultFactory, 'buildAlgoErrorResult').returns(errorAssessmentResult);
          assessmentResultRepository.save.resolves(errorAssessmentResult);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          certificationCourseRepository.update.resolves(certificationCourse);

          // when
          await handleCertificationScoring({
            event,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringCertificationService,
            certificationAssessmentRepository,
          });

          // then
          expect(AssessmentResultFactory.buildAlgoErrorResult).to.have.been.calledWithExactly({
            error: computeError,
            assessmentId: certificationAssessment.id,
            emitter: AssessmentResult.emitters.PIX_ALGO,
          });
          expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
            certificationCourseId: 1234,
            assessmentResult: errorAssessmentResult,
          });
          expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
            certificationCourse: new CertificationCourse({
              ...certificationCourse.toDTO(),
              completedAt: now,
            }),
          });
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
          scoringCertificationService.handleV2CertificationScoring.resolves({
            certificationCourse,
            certificationAssessmentScore,
          });
          scoringCertificationService.isLackOfAnswersForTechnicalReason.resolves(false);

          // when
          await handleCertificationScoring({
            event,
            assessmentResultRepository,
            certificationAssessmentRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringCertificationService,
          });

          // then
          expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
            certificationCourse: new CertificationCourse({
              ...certificationCourse.toDTO(),
              completedAt: now,
            }),
          });
        });

        it('should return a CertificationScoringCompleted', async function () {
          // given
          const assessmentResultId = 1234;
          const certificationCourse = domainBuilder.buildCertificationCourse({
            id: certificationCourseId,
            completedAt: null,
          });
          const competenceMark1 = domainBuilder.buildCompetenceMark({ assessmentResultId, score: 5 });
          const competenceMark2 = domainBuilder.buildCompetenceMark({ assessmentResultId, score: 4 });
          const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            competenceMarks: [competenceMark1, competenceMark2],
            percentageCorrectAnswers: 80,
          });

          certificationCourseRepository.update.resolves(certificationCourse);
          scoringCertificationService.handleV2CertificationScoring.resolves({
            certificationCourse,
            certificationAssessmentScore,
          });

          // when
          const certificationScoringCompleted = await handleCertificationScoring({
            event,
            assessmentResultRepository,
            certificationAssessmentRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringCertificationService,
          });

          // then
          expect(certificationScoringCompleted).to.be.instanceof(CertificationScoringCompleted);
          expect(certificationScoringCompleted).to.deep.equal({
            userId: event.userId,
            certificationCourseId: certificationAssessment.certificationCourseId,
            reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
          });
        });

        context('when the certification stopped due to technical issue', function () {
          it('should cancel the certification course', async function () {
            // given
            const certificationCourse = domainBuilder.buildCertificationCourse({
              id: certificationCourseId,
              abortReason: ABORT_REASONS.TECHNICAL,
              completedAt: null,
            });
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
              competenceMarks: [],
              percentageCorrectAnswers: 49,
              hasEnoughNonNeutralizedChallengesToBeTrusted: true,
            });

            certificationCourseRepository.update.resolves(certificationCourse);
            scoringCertificationService.handleV2CertificationScoring.resolves({
              certificationCourse,
              certificationAssessmentScore,
            });
            scoringCertificationService.isLackOfAnswersForTechnicalReason
              .withArgs({ certificationAssessmentScore, certificationCourse })
              .resolves(true);

            // when
            await handleCertificationScoring({
              event,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringCertificationService,
              certificationAssessmentRepository,
            });

            // then
            expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
              certificationCourse: new CertificationCourse({
                ...certificationCourse.toDTO(),
                isCancelled: true,
              }),
            });
          });
        });
      });
    });

    context('when certification is V3', function () {
      let event;
      let certificationAssessment;
      let certificationCourse;
      const assessmentResultId = 99;
      const certificationCourseStartDate = new Date('2022-02-01');

      beforeEach(function () {
        event = new AssessmentCompleted({
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

            scoringCertificationService.handleV3CertificationScoring.resolves(abortedCertificationCourse);

            // when
            await handleCertificationScoring({
              event,
              certificationChallengeForScoringRepository,
              answerRepository,
              assessmentResultRepository,
              certificationCourseRepository,
              scoringConfigurationRepository,
              competenceMarkRepository,
              scoringCertificationService,
              certificationAssessmentRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              certificationAssessmentHistoryRepository,
            });

            // then
            expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
              certificationCourse: new CertificationCourse({
                ...certificationCourse.toDTO(),
                completedAt: now,
                abortReason: ABORT_REASONS.CANDIDATE,
              }),
            });
          });
        });

        describe('when the candidate did not finish due to technical difficulties', function () {
          it('cancels the certification', async function () {
            // given
            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              id: certificationCourseId,
              createdAt: certificationCourseStartDate,
              isCancelled: true,
              completedAt: null,
              abortReason: ABORT_REASONS.TECHNICAL,
            });

            scoringCertificationService.handleV3CertificationScoring.resolves(abortedCertificationCourse);

            // when
            await handleCertificationScoring({
              event,
              certificationChallengeForScoringRepository,
              answerRepository,
              assessmentResultRepository,
              certificationCourseRepository,
              scoringConfigurationRepository,
              competenceMarkRepository,
              scoringCertificationService,
              certificationAssessmentRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              certificationAssessmentHistoryRepository,
            });

            // then
            expect(certificationCourseRepository.update).to.have.been.calledOnceWithExactly({
              certificationCourse: new CertificationCourse({
                ...certificationCourse.toDTO(),
                isCancelled: true,
                completedAt: null,
                abortReason: ABORT_REASONS.TECHNICAL,
              }),
            });
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

            scoringCertificationService.handleV3CertificationScoring.resolves(certificationCourse);

            // when
            await handleCertificationScoring({
              event,
              certificationChallengeForScoringRepository,
              answerRepository,
              assessmentResultRepository,
              certificationCourseRepository,
              scoringConfigurationRepository,
              competenceMarkRepository,
              scoringCertificationService,
              certificationAssessmentRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              certificationAssessmentHistoryRepository,
            });

            // then
            expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
              certificationCourse: new CertificationCourse({
                ...certificationCourse.toDTO(),
                completedAt: now,
              }),
            });
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

              scoringCertificationService.handleV3CertificationScoring.resolves(certificationCourse);

              // when
              await handleCertificationScoring({
                event,
                certificationChallengeForScoringRepository,
                answerRepository,
                assessmentResultRepository,
                certificationCourseRepository,
                scoringConfigurationRepository,
                competenceMarkRepository,
                scoringCertificationService,
                certificationAssessmentRepository,
                flashAlgorithmConfigurationRepository,
                flashAlgorithmService,
                certificationAssessmentHistoryRepository,
              });

              // then
              expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
                certificationCourse: new CertificationCourse({
                  ...certificationCourse.toDTO(),
                  completedAt: now,
                  abortReason,
                }),
              });
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

              scoringCertificationService.handleV3CertificationScoring.resolves(certificationCourse);

              // when
              await handleCertificationScoring({
                event,
                certificationChallengeForScoringRepository,
                answerRepository,
                assessmentResultRepository,
                certificationCourseRepository,
                scoringConfigurationRepository,
                competenceMarkRepository,
                scoringCertificationService,
                certificationAssessmentRepository,
                flashAlgorithmConfigurationRepository,
                flashAlgorithmService,
                certificationAssessmentHistoryRepository,
              });

              // then
              expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
                certificationCourse: new CertificationCourse({
                  ...certificationCourse.toDTO(),
                  completedAt: now,
                  abortReason,
                }),
              });
            });
          });
        });
      });

      it('should return a CertificationScoringCompleted', async function () {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse({
          id: certificationCourseId,
          createdAt: certificationCourseStartDate,
        });
        scoringCertificationService.handleV3CertificationScoring.resolves(certificationCourse);
        certificationCourseRepository.update.withArgs().resolves();

        // when
        const generatedEvent = await handleCertificationScoring({
          event,
          scoringCertificationService,
          certificationAssessmentRepository,
          certificationChallengeForScoringRepository,
          answerRepository,
          assessmentResultRepository,
          competenceMarkRepository,
          scoringConfigurationRepository,
          certificationCourseRepository,
          flashAlgorithmConfigurationRepository,
          flashAlgorithmService,
          certificationAssessmentHistoryRepository,
        });

        // then
        expect(generatedEvent).to.be.instanceOf(CertificationScoringCompleted);
        expect(generatedEvent.userId).to.equal(userId);
        expect(generatedEvent.certificationCourseId).to.equal(certificationCourseId);
        expect(generatedEvent.reproducibilityRate).to.equal(100);
      });
    });
  });

  context('when completed assessment is not of type CERTIFICATION', function () {
    it('should not do anything', async function () {
      // given
      const event = new AssessmentCompleted(
        Symbol('an assessment Id'),
        Symbol('userId'),
        Symbol('targetProfileId'),
        Symbol('campaignParticipationId'),
        false,
      );

      // when
      const certificationScoringCompleted = await handleCertificationScoring({ event });

      // then
      expect(certificationScoringCompleted).to.be.null;
    });
  });
});
