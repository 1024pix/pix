import { CertificationComputeError } from '../../../../lib/domain/errors.js';
import { AssessmentCompleted } from '../../../../lib/domain/events/AssessmentCompleted.js';
import { CertificationScoringCompleted } from '../../../../lib/domain/events/CertificationScoringCompleted.js';
import { _forTestOnly } from '../../../../lib/domain/events/index.js';
import { CertificationChallengeForScoring } from '../../../../src/certification/scoring/domain/models/CertificationChallengeForScoring.js';
import { AssessmentResultFactory } from '../../../../src/certification/scoring/domain/models/factories/AssessmentResultFactory.js';
import {
  ABORT_REASONS,
  CertificationCourse,
} from '../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { AutoJuryCommentKeys } from '../../../../src/certification/shared/domain/models/JuryComment.js';
import { config } from '../../../../src/shared/config.js';
import { AssessmentResult, status } from '../../../../src/shared/domain/models/AssessmentResult.js';
import {
  generateAnswersForChallenges,
  generateChallengeList,
} from '../../../certification/shared/fixtures/challenges.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';

const { handleCertificationScoring } = _forTestOnly.handlers;

const { minimumAnswersRequiredToValidateACertification } = config.v3Certification.scoring;

const maximumAssessmentLength = 32;

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
  let baseFlashAlgorithmConfiguration;
  let certificationChallengeForScoringRepository;
  let certificationAssessmentHistoryRepository;

  const now = new Date('2019-01-01T05:06:07Z');
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

    scoringCertificationService = { calculateCertificationAssessmentScore: sinon.stub() };
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
    baseFlashAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
      maximumAssessmentLength,
    });
  });

  afterEach(function () {
    clock.restore();
  });

  context('when assessment is of type CERTIFICATION', function () {
    const assessmentId = 1214;
    const certificationCourseId = 1234;
    const userId = 4567;
    let event;
    let certificationAssessment;

    it('fails when event is not of correct type', async function () {
      // given
      const event = 'not an event of the correct type';
      // when / then
      const error = await catchErr(handleCertificationScoring)({
        event,
        assessmentResultRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        scoringCertificationService,
        certificationAssessmentRepository,
      });

      // then
      expect(error).not.to.be.null;
    });

    context('when certification is V2', function () {
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
        };
        certificationAssessmentRepository.get.withArgs(assessmentId).resolves(certificationAssessment);
      });

      context('when an error different from a compute error happens', function () {
        const otherError = new Error();
        beforeEach(function () {
          scoringCertificationService.calculateCertificationAssessmentScore.rejects(otherError);
          sinon.stub(AssessmentResultFactory, 'buildAlgoErrorResult');
        });

        it('should not save any results', async function () {
          // when
          await catchErr(handleCertificationScoring)({
            event,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringCertificationService,
            certificationAssessmentRepository,
          });

          // then
          expect(AssessmentResultFactory.buildAlgoErrorResult).to.not.have.been.called;
          expect(assessmentResultRepository.save).to.not.have.been.called;
          expect(certificationCourseRepository.update).to.not.have.been.called;
        });
      });

      context('when an error of type CertificationComputeError happens while scoring the assessment', function () {
        const computeError = new CertificationComputeError();
        let errorAssessmentResult;
        let certificationCourse;

        beforeEach(function () {
          errorAssessmentResult = domainBuilder.buildAssessmentResult({ id: 98 });
          certificationCourse = domainBuilder.buildCertificationCourse({
            id: certificationCourseId,
            completedAt: null,
          });

          scoringCertificationService.calculateCertificationAssessmentScore.rejects(computeError);
          sinon.stub(AssessmentResultFactory, 'buildAlgoErrorResult').returns(errorAssessmentResult);
          assessmentResultRepository.save.resolves(errorAssessmentResult);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          certificationCourseRepository.update.resolves(certificationCourse);
        });

        it('should call the scoring service with the right arguments', async function () {
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
          expect(scoringCertificationService.calculateCertificationAssessmentScore).to.have.been.calledWithExactly({
            certificationAssessment,
            continueOnError: false,
          });
        });

        it('should save the error result appropriately', async function () {
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
        const assessmentResultId = 99;

        context('when candidate has enough correct answers to be certified', function () {
          let certificationCourse;
          let competenceMark1;
          let competenceMark2;
          let savedAssessmentResult;
          let expectedAssessmentResult;
          let certificationAssessmentScore;

          beforeEach(function () {
            certificationCourse = domainBuilder.buildCertificationCourse({
              id: certificationCourseId,
              completedAt: null,
            });
            competenceMark1 = domainBuilder.buildCompetenceMark({ assessmentResultId, score: 5 });
            competenceMark2 = domainBuilder.buildCompetenceMark({ assessmentResultId, score: 4 });
            savedAssessmentResult = { id: assessmentResultId };
            certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
              competenceMarks: [competenceMark1, competenceMark2],
              percentageCorrectAnswers: 80,
            });

            assessmentResultRepository.save.resolves(savedAssessmentResult);
            competenceMarkRepository.save.resolves();
            scoringCertificationService.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(certificationCourse);
            certificationCourseRepository.update.resolves(certificationCourse);
          });

          it('should build and save an assessment result with the expected arguments', async function () {
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
            expectedAssessmentResult = new AssessmentResult({
              pixScore: certificationAssessmentScore.nbPix,
              reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
              status: certificationAssessmentScore.status,
              assessmentId: certificationAssessment.id,
              emitter: AssessmentResult.emitters.PIX_ALGO,
            });

            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 1234,
              assessmentResult: expectedAssessmentResult,
            });
            expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
              certificationCourse: new CertificationCourse({
                ...certificationCourse.toDTO(),
                completedAt: now,
              }),
            });
          });

          it('should return a CertificationScoringCompleted', async function () {
            // when
            const certificationScoringCompleted = await handleCertificationScoring({
              event,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringCertificationService,
              certificationAssessmentRepository,
            });

            // then
            expect(certificationScoringCompleted).to.be.instanceof(CertificationScoringCompleted);
            expect(certificationScoringCompleted).to.deep.equal({
              userId: event.userId,
              certificationCourseId: certificationAssessment.certificationCourseId,
              reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
            });
          });

          it('should build and save as many competence marks as present in the certificationAssessmentScore', async function () {
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
            expect(competenceMarkRepository.save.callCount).to.equal(
              certificationAssessmentScore.competenceMarks.length,
            );
          });
        });

        context('when candidate has insufficient correct answers to be certified', function () {
          it('should create and save an insufficient correct answers assessment result', async function () {
            // given
            const certificationCourse = domainBuilder.buildCertificationCourse({
              id: certificationCourseId,
              abortReason: null,
            });
            const savedAssessmentResult = { id: assessmentResultId };
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
              competenceMarks: [],
              percentageCorrectAnswers: 49,
              hasEnoughNonNeutralizedChallengesToBeTrusted: true,
            });

            assessmentResultRepository.save.resolves(savedAssessmentResult);
            competenceMarkRepository.save.resolves();
            scoringCertificationService.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
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
            const expectedAssessmentResult = new AssessmentResult({
              pixScore: 0,
              reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
              status: status.REJECTED,
              assessmentId: certificationAssessment.id,
              emitter: AssessmentResult.emitters.PIX_ALGO,
              commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
                commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_INSUFFICIENT_CORRECT_ANSWERS,
              }),
              commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
                commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_INSUFFICIENT_CORRECT_ANSWERS,
              }),
            });

            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 1234,
              assessmentResult: expectedAssessmentResult,
            });

            expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
              certificationCourse: new CertificationCourse({
                ...certificationCourse.toDTO(),
                completedAt: now,
              }),
            });
          });
        });

        context('when the certification stopped due to technical issue', function () {
          it('should cancel and reject the certification', async function () {
            // given
            const certificationCourse = domainBuilder.buildCertificationCourse({
              id: certificationCourseId,
              abortReason: ABORT_REASONS.TECHNICAL,
              completedAt: null,
            });
            const savedAssessmentResult = { id: assessmentResultId };
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
              competenceMarks: [],
              percentageCorrectAnswers: 49,
              hasEnoughNonNeutralizedChallengesToBeTrusted: true,
            });

            assessmentResultRepository.save.resolves(savedAssessmentResult);
            competenceMarkRepository.save.resolves();
            scoringCertificationService.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
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
            const expectedAssessmentResult = new AssessmentResult({
              pixScore: 0,
              reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
              status: status.REJECTED,
              assessmentId: certificationAssessment.id,
              emitter: AssessmentResult.emitters.PIX_ALGO,
              commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
                commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
              }),
              commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
                commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
              }),
            });

            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 1234,
              assessmentResult: expectedAssessmentResult,
            });

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
          it('should reject the certification', async function () {
            // given
            const expectedCapacity = 2;
            const scoreForEstimatedLevel = 640;
            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              id: certificationCourseId,
              createdAt: certificationCourseStartDate,
              abortReason: ABORT_REASONS.CANDIDATE,
            });

            const challenges = _generateCertificationChallengeForScoringList({
              length: minimumAnswersRequiredToValidateACertification - 1,
            });

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: challenges[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            const answers = generateAnswersForChallenges({ challenges });

            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(certificationCourseStartDate)
              .resolves(baseFlashAlgorithmConfiguration);

            certificationChallengeForScoringRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId })
              .resolves(challenges);
            answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
            certificationCourseRepository.get
              .withArgs({ id: certificationCourseId })
              .resolves(abortedCertificationCourse);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

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
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
              nbPix: scoreForEstimatedLevel,
              status: status.REJECTED,
            });
            const expectedAssessmentResult = new AssessmentResult({
              pixScore: scoreForEstimatedLevel,
              reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
              status: status.REJECTED,
              assessmentId: certificationAssessment.id,
              emitter: AssessmentResult.emitters.PIX_ALGO,
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
            expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
              certificationCourse: new CertificationCourse({
                ...certificationCourse.toDTO(),
                completedAt: now,
                abortReason: 'candidate',
              }),
            });
          });
        });

        describe('when the candidate did not finish due to technical difficulties', function () {
          it('should cancel the certification and reject the assessment result', async function () {
            // given
            const abortReason = ABORT_REASONS.TECHNICAL;
            const expectedCapacity = 2;
            const scoreForEstimatedLevel = 640;
            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              id: certificationCourseId,
              createdAt: certificationCourseStartDate,
              completedAt: null,
              abortReason,
            });

            const challenges = _generateCertificationChallengeForScoringList({
              length: minimumAnswersRequiredToValidateACertification - 1,
            });

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: challenges[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            const answers = generateAnswersForChallenges({ challenges });

            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(certificationCourseStartDate)
              .resolves(baseFlashAlgorithmConfiguration);

            certificationChallengeForScoringRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId })
              .resolves(challenges);

            answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
            certificationCourseRepository.get
              .withArgs({ id: certificationCourseId })
              .resolves(abortedCertificationCourse);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

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
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
              nbPix: scoreForEstimatedLevel,
              status: status.REJECTED,
            });
            const expectedAssessmentResult = new AssessmentResult({
              pixScore: scoreForEstimatedLevel,
              reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
              status: status.REJECTED,
              assessmentId: certificationAssessment.id,
              emitter: AssessmentResult.emitters.PIX_ALGO,
              commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
                commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
              }),
              commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
                commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
              }),
            });

            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 1234,
              assessmentResult: expectedAssessmentResult,
            });

            expect(certificationCourseRepository.update.firstCall.args[0]).to.deep.equal({
              certificationCourse: new CertificationCourse({
                ...certificationCourse.toDTO(),
                isCancelled: true,
                abortReason,
              }),
            });

            expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
              certificationCourse: new CertificationCourse({
                ...certificationCourse.toDTO(),
                isCancelled: true,
                abortReason,
              }),
            });

            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });
        });
      });

      describe('when at least the minimum number of answers required by the config has been answered', function () {
        describe('when the certification was completed', function () {
          it('should build and save an assessment result with a validated status', async function () {
            // given
            const expectedCapacity = 2;
            const scoreForEstimatedLevel = 640;
            const challenges = _generateCertificationChallengeForScoringList({ length: maximumAssessmentLength });
            const answers = generateAnswersForChallenges({ challenges });
            const assessmentResultId = 123;

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: challenges[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            certificationChallengeForScoringRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId })
              .resolves(challenges);
            answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
            certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);
            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(certificationCourseStartDate)
              .resolves(baseFlashAlgorithmConfiguration);
            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });
            assessmentResultRepository.save.resolves(domainBuilder.buildAssessmentResult({ id: assessmentResultId }));

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

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
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
              nbPix: scoreForEstimatedLevel,
              status: status.VALIDATED,
            });
            const expectedAssessmentResult = new AssessmentResult({
              pixScore: scoreForEstimatedLevel,
              reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
              status: status.VALIDATED,
              assessmentId: certificationAssessment.id,
              emitter: AssessmentResult.emitters.PIX_ALGO,
            });
            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 1234,
              assessmentResult: expectedAssessmentResult,
            });
            expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
              certificationCourse: new CertificationCourse({
                ...certificationCourse.toDTO(),
                completedAt: now,
              }),
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
              const cappedScoreForEstimatedLevel = 896;
              const challenges = _generateCertificationChallengeForScoringList({ length: maximumAssessmentLength });

              const answers = generateAnswersForChallenges({ challenges });

              const capacityHistory = [
                domainBuilder.buildCertificationChallengeCapacity({
                  certificationChallengeId: challenges[0].certificationChallengeId,
                  capacity: expectedCapacity,
                }),
              ];

              const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
                capacityHistory,
              });

              certificationChallengeForScoringRepository.getByCertificationCourseId
                .withArgs({ certificationCourseId })
                .resolves(challenges);
              answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
              certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);
              flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
                .withArgs(certificationCourseStartDate)
                .resolves(baseFlashAlgorithmConfiguration);
              flashAlgorithmService.getCapacityAndErrorRate
                .withArgs({
                  challenges,
                  allAnswers: answers,
                  capacity: sinon.match.number,
                  variationPercent: undefined,
                  variationPercentUntil: undefined,
                  doubleMeasuresUntil: undefined,
                })
                .returns({
                  capacity: expectedCapacity,
                });

              flashAlgorithmService.getCapacityAndErrorRateHistory
                .withArgs({
                  challenges,
                  allAnswers: answers,
                  capacity: sinon.match.number,
                  variationPercent: undefined,
                  variationPercentUntil: undefined,
                  doubleMeasuresUntil: undefined,
                })
                .returns([
                  {
                    capacity: expectedCapacity,
                  },
                ]);

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
              const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
                nbPix: cappedScoreForEstimatedLevel,
                status: status.VALIDATED,
              });
              const expectedAssessmentResult = new AssessmentResult({
                pixScore: cappedScoreForEstimatedLevel,
                reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
                status: status.VALIDATED,
                assessmentId: certificationAssessment.id,
                emitter: AssessmentResult.emitters.PIX_ALGO,
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

        describe('when the certification was not completed', function () {
          describe('when the candidate did not finish due to technical difficulties', function () {
            it('should build and save an assessment result with a validated status with the raw score', async function () {
              // given
              const expectedCapacity = 2;
              const rawScore = 640;
              const challenges = _generateCertificationChallengeForScoringList({
                length: minimumAnswersRequiredToValidateACertification,
              });
              const abortReason = ABORT_REASONS.TECHNICAL;
              const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
                id: certificationCourseId,
                completedAt: null,
                createdAt: certificationCourseStartDate,
                abortReason,
              });

              const answers = generateAnswersForChallenges({ challenges });

              const capacityHistory = [
                domainBuilder.buildCertificationChallengeCapacity({
                  certificationChallengeId: challenges[0].certificationChallengeId,
                  capacity: expectedCapacity,
                }),
              ];

              const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
                capacityHistory,
              });

              certificationChallengeForScoringRepository.getByCertificationCourseId
                .withArgs({ certificationCourseId })
                .resolves(challenges);
              answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
              certificationCourseRepository.get
                .withArgs({ id: certificationCourseId })
                .resolves(abortedCertificationCourse);
              flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
                .withArgs(certificationCourseStartDate)
                .resolves(baseFlashAlgorithmConfiguration);
              flashAlgorithmService.getCapacityAndErrorRate
                .withArgs({
                  challenges,
                  allAnswers: answers,
                  capacity: sinon.match.number,
                  variationPercent: undefined,
                  variationPercentUntil: undefined,
                  doubleMeasuresUntil: undefined,
                })
                .returns({
                  capacity: expectedCapacity,
                });

              flashAlgorithmService.getCapacityAndErrorRateHistory
                .withArgs({
                  challenges,
                  allAnswers: answers,
                  capacity: sinon.match.number,
                  variationPercent: undefined,
                  variationPercentUntil: undefined,
                  doubleMeasuresUntil: undefined,
                })
                .returns([
                  {
                    capacity: expectedCapacity,
                  },
                ]);

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
              const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
                nbPix: rawScore,
                status: status.VALIDATED,
              });
              const expectedAssessmentResult = new AssessmentResult({
                pixScore: rawScore,
                reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
                status: status.VALIDATED,
                assessmentId: certificationAssessment.id,
                emitter: AssessmentResult.emitters.PIX_ALGO,
              });
              expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
                certificationCourseId: 1234,
                assessmentResult: expectedAssessmentResult,
              });
              expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
                certificationCourse: new CertificationCourse({
                  ...certificationCourse.toDTO(),
                  completedAt: now,
                  abortReason,
                }),
              });
              expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
                certificationAssessmentHistory,
              );
            });
          });

          describe('when the candidate did not finish in time', function () {
            it('should build and save an assessment result with a validated status', async function () {
              // given
              const expectedCapacity = 2;
              const pixScore = 640;
              const challenges = _generateCertificationChallengeForScoringList({
                length: minimumAnswersRequiredToValidateACertification,
              });
              const abortReason = ABORT_REASONS.CANDIDATE;
              const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
                id: certificationCourseId,
                createdAt: certificationCourseStartDate,
                completedAt: null,
                abortReason,
              });

              const answers = generateAnswersForChallenges({ challenges });

              const capacityHistory = [
                domainBuilder.buildCertificationChallengeCapacity({
                  certificationChallengeId: challenges[0].certificationChallengeId,
                  capacity: expectedCapacity,
                }),
              ];

              const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
                capacityHistory,
              });

              certificationChallengeForScoringRepository.getByCertificationCourseId
                .withArgs({ certificationCourseId })
                .resolves(challenges);
              answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
              certificationCourseRepository.get
                .withArgs({ id: certificationCourseId })
                .resolves(abortedCertificationCourse);
              flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
                .withArgs(certificationCourseStartDate)
                .resolves(baseFlashAlgorithmConfiguration);
              flashAlgorithmService.getCapacityAndErrorRate
                .withArgs({
                  challenges,
                  allAnswers: answers,
                  capacity: sinon.match.number,
                  variationPercent: undefined,
                  variationPercentUntil: undefined,
                  doubleMeasuresUntil: undefined,
                })
                .returns({
                  capacity: expectedCapacity,
                });
              flashAlgorithmService.getCapacityAndErrorRateHistory
                .withArgs({
                  challenges,
                  allAnswers: answers,
                  capacity: sinon.match.number,
                  variationPercent: undefined,
                  variationPercentUntil: undefined,
                  doubleMeasuresUntil: undefined,
                })
                .returns([
                  {
                    capacity: expectedCapacity,
                  },
                ]);

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
              const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
                nbPix: pixScore,
                status: status.VALIDATED,
              });
              const expectedAssessmentResult = new AssessmentResult({
                pixScore,
                reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
                status: status.VALIDATED,
                assessmentId: certificationAssessment.id,
                emitter: AssessmentResult.emitters.PIX_ALGO,
              });
              expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
                certificationCourseId: 1234,
                assessmentResult: expectedAssessmentResult,
              });
              expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
                certificationCourse: new CertificationCourse({
                  ...certificationCourse.toDTO(),
                  completedAt: now,
                  abortReason,
                }),
              });
              expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
                certificationAssessmentHistory,
              );
            });
          });
        });
      });

      it('should return a CertificationScoringCompleted', async function () {
        // given
        const expectedCapacity = 2;
        const challenge1 = domainBuilder.buildCertificationChallengeForScoring();
        const challenge2 = domainBuilder.buildCertificationChallengeForScoring();
        const challenges = [challenge1, challenge2];
        const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.id, assessmentId });
        const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.id, assessmentId });
        const answers = [answer1, answer2];

        const capacityHistory = [
          domainBuilder.buildCertificationChallengeCapacity({
            certificationChallengeId: challenges[0].certificationChallengeId,
            capacity: expectedCapacity,
          }),
        ];

        domainBuilder.buildCertificationAssessmentHistory({
          capacityHistory,
        });

        certificationChallengeForScoringRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(challenges);
        answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
        certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);
        flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
          .withArgs(certificationCourseStartDate)
          .resolves(baseFlashAlgorithmConfiguration);

        flashAlgorithmService.getCapacityAndErrorRateHistory
          .withArgs({
            challenges,
            allAnswers: answers,
            capacity: sinon.match.number,
            variationPercent: undefined,
            variationPercentUntil: undefined,
            doubleMeasuresUntil: undefined,
          })
          .returns([
            {
              capacity: expectedCapacity,
            },
          ]);

        flashAlgorithmService.getCapacityAndErrorRate
          .withArgs({
            challenges,
            allAnswers: answers,
            capacity: sinon.match.number,
            variationPercent: undefined,
            variationPercentUntil: undefined,
            doubleMeasuresUntil: undefined,
          })
          .returns({
            capacity: 2,
          });

        flashAlgorithmService.getCapacityAndErrorRateHistory
          .withArgs({
            challenges,
            allAnswers: answers,
            capacity: sinon.match.number,
            variationPercent: undefined,
            variationPercentUntil: undefined,
            doubleMeasuresUntil: undefined,
          })
          .returns([
            {
              capacity: expectedCapacity,
            },
          ]);

        // when
        const generatedEvent = await handleCertificationScoring({
          event,
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
      const certificationScoringCompleted = await handleCertificationScoring({
        event,
        assessmentResultRepository,
        certificationCourseRepository,
        scoringConfigurationRepository,
        competenceMarkRepository,
        scoringCertificationService,
        certificationAssessmentRepository,
      });

      expect(certificationScoringCompleted).to.be.null;
    });
  });
});

const _generateCertificationChallengeForScoringList = ({ length }) => {
  return generateChallengeList({
    length,
  }).map(
    ({ discriminant, difficulty }, index) =>
      new CertificationChallengeForScoring({
        certificationChallengeId: `certification-challenge-id-${index}`,
        discriminant,
        difficulty,
      }),
  );
};
