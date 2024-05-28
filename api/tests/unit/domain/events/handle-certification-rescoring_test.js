import { CertificationComputeError } from '../../../../lib/domain/errors.js';
import { CertificationCourseRejected } from '../../../../lib/domain/events/CertificationCourseRejected.js';
import { CertificationJuryDone } from '../../../../lib/domain/events/CertificationJuryDone.js';
import { ChallengeDeneutralized } from '../../../../lib/domain/events/ChallengeDeneutralized.js';
import { ChallengeNeutralized } from '../../../../lib/domain/events/ChallengeNeutralized.js';
import { _forTestOnly } from '../../../../lib/domain/events/index.js';
import { AssessmentResult, CertificationAssessment, CertificationResult } from '../../../../lib/domain/models/index.js';
import { ABORT_REASONS } from '../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { CERTIFICATION_VERSIONS } from '../../../../src/certification/shared/domain/models/CertificationVersion.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

const { handleCertificationRescoring } = _forTestOnly.handlers;

describe('Unit | Domain | Events | handle-certification-rescoring', function () {
  describe('when handling a v3 certification', function () {
    let answerRepository,
      assessmentResultRepository,
      certificationAssessmentHistoryRepository,
      certificationChallengeForScoringRepository,
      certificationCourseRepository,
      competenceMarkRepository,
      flashAlgorithmConfigurationRepository,
      flashAlgorithmService,
      scoringConfigurationRepository,
      scoringCertificationService,
      certificationAssessmentRepository;

    let dependencies;

    beforeEach(function () {
      scoringCertificationService = {
        handleV3CertificationScoring: sinon.stub(),
      };
      certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
      certificationCourseRepository = { update: sinon.stub() };

      dependencies = {
        certificationAssessmentRepository,
        answerRepository,
        assessmentResultRepository,
        certificationAssessmentHistoryRepository,
        certificationChallengeForScoringRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        flashAlgorithmConfigurationRepository,
        flashAlgorithmService,
        scoringConfigurationRepository,
        scoringCertificationService,
      };
    });

    describe('when less than the minimum number of answers required by the config has been answered', function () {
      describe('when the certification was not finished due to a lack of time', function () {
        it('should save the score with a rejected status', async function () {
          // given
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            version: CERTIFICATION_VERSIONS.V3,
          });
          const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
            abortReason: ABORT_REASONS.CANDIDATE,
          });
          const { certificationCourseId } = certificationAssessment;

          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationAssessment);
          scoringCertificationService.handleV3CertificationScoring.resolves(abortedCertificationCourse);

          const event = new CertificationJuryDone({
            certificationCourseId,
          });

          // when
          const result = await handleCertificationRescoring({
            ...dependencies,
            event,
          });

          // then
          const expectedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
            certificationCourseId,
            userId: certificationAssessment.certificationCourseId,
            reproducibilityRate: 100,
          });
          expect(result).to.deep.equal(expectedEvent);
        });
      });

      describe('when the certification was not finished due to technical difficulties', function () {
        it('should save the score with a rejected status and cancel the certification course', async function () {
          // given
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            version: CERTIFICATION_VERSIONS.V3,
          });

          const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
            abortReason: ABORT_REASONS.TECHNICAL,
            isCancelled: true,
            completedAt: null,
          });
          const { certificationCourseId } = certificationAssessment;

          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationAssessment);
          scoringCertificationService.handleV3CertificationScoring.resolves(abortedCertificationCourse);

          const event = new CertificationJuryDone({
            certificationCourseId,
          });

          // when
          const result = await handleCertificationRescoring({
            ...dependencies,
            event,
          });

          // then
          const expectedCertificationCourse = domainBuilder.buildCertificationCourse({
            abortReason: ABORT_REASONS.TECHNICAL,
            isCancelled: true,
            completedAt: null,
          });
          expect(certificationCourseRepository.update).to.have.been.calledOnceWithExactly({
            certificationCourse: expectedCertificationCourse,
          });

          const expectedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
            certificationCourseId,
            userId: certificationAssessment.certificationCourseId,
            reproducibilityRate: 100,
          });
          expect(result).to.deep.equal(expectedEvent);
        });
      });
    });

    describe('when not all questions were answered', function () {
      describe('when the candidate did not finish due to technical difficulties', function () {
        it('should save the raw score', async function () {
          // given
          const certificationCourseStartDate = new Date('2022-01-01');
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            version: CERTIFICATION_VERSIONS.V3,
          });

          const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
            abortReason: ABORT_REASONS.TECHNICAL,
            createdAt: certificationCourseStartDate,
          });
          const { certificationCourseId } = certificationAssessment;

          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationAssessment);
          scoringCertificationService.handleV3CertificationScoring.resolves(abortedCertificationCourse);

          const event = new CertificationJuryDone({
            certificationCourseId,
          });

          // when
          const result = await handleCertificationRescoring({
            ...dependencies,
            event,
          });

          // then
          const expectedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
            certificationCourseId,
            userId: certificationAssessment.certificationCourseId,
            reproducibilityRate: 100,
          });

          expect(result).to.deep.equal(expectedEvent);
        });
      });
    });

    describe('when all the questions were answered', function () {
      it('should save the score', async function () {
        // given
        const certificationCourseStartDate = new Date('2022-01-01');
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          version: CERTIFICATION_VERSIONS.V3,
        });

        const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
          abortReason: ABORT_REASONS.TECHNICAL,
          createdAt: certificationCourseStartDate,
        });
        const { certificationCourseId } = certificationAssessment;

        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(certificationAssessment);
        scoringCertificationService.handleV3CertificationScoring.resolves(abortedCertificationCourse);
        const event = new CertificationJuryDone({
          certificationCourseId,
        });

        // when
        const result = await handleCertificationRescoring({
          ...dependencies,
          event,
        });

        // then
        const expectedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
          certificationCourseId,
          userId: certificationAssessment.certificationCourseId,
          reproducibilityRate: 100,
        });

        expect(result).to.deep.equal(expectedEvent);
      });

      describe('when certification is rejected for fraud', function () {
        it('should save the score with rejected status', async function () {
          const certificationCourseStartDate = new Date('2022-01-01');
          // given
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            version: CERTIFICATION_VERSIONS.V3,
          });

          const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
            isRejectedForFraud: true,
            createdAt: certificationCourseStartDate,
          });
          const { certificationCourseId } = certificationAssessment;

          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationAssessment);
          scoringCertificationService.handleV3CertificationScoring.resolves(abortedCertificationCourse);

          const event = new CertificationCourseRejected({
            certificationCourseId,
            juryId: 7,
          });

          // when
          const result = await handleCertificationRescoring({
            ...dependencies,
            event,
          });

          // then
          const expectedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
            certificationCourseId,
            userId: certificationAssessment.certificationCourseId,
            reproducibilityRate: 100,
          });

          expect(result).to.deep.equal(expectedEvent);
        });
      });
    });
  });

  describe('when handling a v2 certification', function () {
    let certificationCourseRepository,
      assessmentResultRepository,
      certificationAssessmentRepository,
      competenceMarkRepository,
      scoringCertificationService;

    beforeEach(function () {
      certificationCourseRepository = {
        get: sinon.stub(),
        update: sinon.stub(),
      };
      assessmentResultRepository = { save: sinon.stub() };
      certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
      scoringCertificationService = {
        handleV2CertificationScoring: sinon.stub(),
        isLackOfAnswersForTechnicalReason: sinon.stub(),
      };
    });

    context('when the certification has not enough non neutralized challenges to be trusted', function () {
      it('cancels the certification', async function () {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse({ id: 789 });

        const event = new ChallengeNeutralized({ certificationCourseId: 789, juryId: 7 });
        const certificationAssessment = new CertificationAssessment({
          id: 123,
          userId: 123,
          certificationCourseId: 789,
          createdAt: new Date('2020-01-01'),
          completedAt: new Date('2020-01-01'),
          state: CertificationAssessment.states.STARTED,
          version: 2,
          certificationChallenges: [
            domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
            domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
          ],
          certificationAnswersByDate: ['answer'],
        });
        const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 12 });
        const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 18 });
        const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          status: AssessmentResult.status.VALIDATED,
          competenceMarks: [competenceMark1, competenceMark2],
          percentageCorrectAnswers: 80,
          hasEnoughNonNeutralizedChallengesToBeTrusted: false,
        });

        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: 789 })
          .resolves(certificationAssessment);
        scoringCertificationService.handleV2CertificationScoring.resolves({
          certificationCourse,
          certificationAssessmentScore,
        });
        scoringCertificationService.isLackOfAnswersForTechnicalReason.resolves(true);
        certificationCourseRepository.update.resolves(certificationCourse);

        // when
        await handleCertificationRescoring({
          event,
          assessmentResultRepository,
          certificationAssessmentRepository,
          competenceMarkRepository,
          scoringCertificationService,
          certificationCourseRepository,
        });

        // then
        const expectedCertificationCourse = domainBuilder.buildCertificationCourse({
          id: certificationCourse.getId(),
          isCancelled: true,
        });
        expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
          certificationCourse: expectedCertificationCourse,
        });
      });

      context('when it has insufficient correct answers', function () {
        it('cancels the certification', async function () {
          // given
          const certificationCourse = domainBuilder.buildCertificationCourse({ id: 789 });

          const event = new ChallengeNeutralized({ certificationCourseId: 789, juryId: 7 });
          const certificationAssessment = new CertificationAssessment({
            id: 123,
            userId: 123,
            certificationCourseId: 789,
            createdAt: new Date('2020-01-01'),
            completedAt: new Date('2020-01-01'),
            state: CertificationAssessment.states.STARTED,
            version: 2,
            certificationChallenges: [
              domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
              domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
            ],
            certificationAnswersByDate: ['answer'],
          });
          const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            status: AssessmentResult.status.REJECTED,
            percentageCorrectAnswers: 45,
            hasEnoughNonNeutralizedChallengesToBeTrusted: false,
          });

          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 789 })
            .resolves(certificationAssessment);
          scoringCertificationService.handleV2CertificationScoring.resolves({
            certificationCourse,
            certificationAssessmentScore,
          });
          scoringCertificationService.isLackOfAnswersForTechnicalReason.resolves(true);
          certificationCourseRepository.update.resolves(certificationCourse);

          // when
          await handleCertificationRescoring({
            event,
            assessmentResultRepository,
            certificationAssessmentRepository,
            competenceMarkRepository,
            scoringCertificationService,
            certificationCourseRepository,
          });

          // then
          const expectedCertificationCourse = domainBuilder.buildCertificationCourse({
            id: certificationCourse.getId(),
            isCancelled: true,
          });
          expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
            certificationCourse: expectedCertificationCourse,
          });
        });
      });
    });

    context('when the certification has enough non neutralized challenges to be trusted', function () {
      it('uncancels the certification', async function () {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse({ id: 789, isCancelled: true });
        const event = new ChallengeNeutralized({ certificationCourseId: 789, juryId: 7 });
        const certificationAssessment = new CertificationAssessment({
          id: 123,
          userId: 123,
          certificationCourseId: 789,
          createdAt: new Date('2020-01-01'),
          completedAt: new Date('2020-01-01'),
          state: CertificationAssessment.states.STARTED,
          version: 2,
          certificationChallenges: [
            domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
            domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
          ],
          certificationAnswersByDate: ['answer'],
        });
        const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 12 });
        const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 18 });
        const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          status: AssessmentResult.status.VALIDATED,
          competenceMarks: [competenceMark1, competenceMark2],
          percentageCorrectAnswers: 80,
          hasEnoughNonNeutralizedChallengesToBeTrusted: true,
        });

        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: 789 })
          .resolves(certificationAssessment);
        scoringCertificationService.handleV2CertificationScoring.resolves({
          certificationCourse,
          certificationAssessmentScore,
        });
        scoringCertificationService.isLackOfAnswersForTechnicalReason.resolves(false);
        certificationCourseRepository.update.resolves(certificationCourse);

        // when
        await handleCertificationRescoring({
          event,
          assessmentResultRepository,
          certificationAssessmentRepository,
          competenceMarkRepository,
          scoringCertificationService,
          certificationCourseRepository,
        });

        // then
        const expectedCertificationCourse = domainBuilder.buildCertificationCourse({ id: 789, isCancelled: false });
        expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
          certificationCourse: expectedCertificationCourse,
        });
      });
    });

    context('when the certification course is rejected', function () {
      context('when it is rejected for fraud', function () {
        it('rejects the certification', async function () {
          // given
          const certificationCourse = domainBuilder.buildCertificationCourse({
            id: 789,
            isRejectedForFraud: true,
          });

          const event = new ChallengeNeutralized({ certificationCourseId: 789, juryId: 7 });
          const certificationAssessment = new CertificationAssessment({
            id: 123,
            userId: 123,
            certificationCourseId: 789,
            createdAt: new Date('2020-01-01'),
            completedAt: new Date('2020-01-01'),
            state: CertificationAssessment.states.STARTED,
            version: 2,
            certificationChallenges: [
              domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
              domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
            ],
            certificationAnswersByDate: ['answer'],
          });
          const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 12 });
          const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 18 });
          const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            status: AssessmentResult.status.VALIDATED,
            competenceMarks: [competenceMark1, competenceMark2],
            percentageCorrectAnswers: 80,
            hasEnoughNonNeutralizedChallengesToBeTrusted: true,
          });

          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 789 })
            .resolves(certificationAssessment);
          scoringCertificationService.handleV2CertificationScoring.resolves({
            certificationCourse,
            certificationAssessmentScore,
          });
          scoringCertificationService.isLackOfAnswersForTechnicalReason.resolves(false);
          certificationCourseRepository.update.resolves(certificationCourse);

          // when
          await handleCertificationRescoring({
            event,
            assessmentResultRepository,
            certificationAssessmentRepository,
            competenceMarkRepository,
            scoringCertificationService,
            certificationCourseRepository,
          });

          // then
          const expectedCertificationCourse = domainBuilder.buildCertificationCourse({
            id: 789,
            isRejectedForFraud: true,
          });
          expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
            certificationCourse: expectedCertificationCourse,
          });
        });
      });

      context('when it is rejected for insufficient correct answers', function () {
        it('should create and save an insufficient correct answers assessment result', async function () {
          // given
          const certificationCourse = domainBuilder.buildCertificationCourse({
            id: 789,
          });

          const event = new ChallengeDeneutralized({ certificationCourseId: 789, juryId: 7 });
          const certificationAssessment = new CertificationAssessment({
            id: 123,
            userId: 123,
            certificationCourseId: 789,
            createdAt: new Date('2020-01-01'),
            completedAt: new Date('2020-01-01'),
            state: CertificationAssessment.states.ENDED_BY_SUPERVISOR,
            version: 2,
            certificationChallenges: [
              domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
              domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
              domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
            ],
            certificationAnswersByDate: ['answer'],
          });
          const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 0 });
          const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 0 });
          const competenceMark3 = domainBuilder.buildCompetenceMark({ score: 0 });
          const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            competenceMarks: [competenceMark1, competenceMark2, competenceMark3],
            percentageCorrectAnswers: 33,
            hasEnoughNonNeutralizedChallengesToBeTrusted: true,
          });

          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 789 })
            .resolves(certificationAssessment);
          scoringCertificationService.handleV2CertificationScoring.resolves({
            certificationCourse,
            certificationAssessmentScore,
          });
          scoringCertificationService.isLackOfAnswersForTechnicalReason.resolves(false);
          certificationCourseRepository.update.resolves(certificationCourse);

          // when
          await handleCertificationRescoring({
            event,
            assessmentResultRepository,
            certificationAssessmentRepository,
            competenceMarkRepository,
            scoringCertificationService,
            certificationCourseRepository,
          });

          // then
          const expectedCertificationCourse = domainBuilder.buildCertificationCourse({
            id: 789,
            isRejectedForFraud: false,
          });
          expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
            certificationCourse: expectedCertificationCourse,
          });
        });

        context('when the candidate encountered a technical issue during certification', function () {
          it('cancels the certification', async function () {
            // given
            const certificationCourse = domainBuilder.buildCertificationCourse({
              id: 789,
              abortReason: ABORT_REASONS.TECHNICAL,
            });

            const event = new ChallengeDeneutralized({ certificationCourseId: 789, juryId: 7 });
            const certificationAssessment = new CertificationAssessment({
              id: 123,
              userId: 123,
              certificationCourseId: 789,
              createdAt: new Date('2020-01-01'),
              completedAt: new Date('2020-01-01'),
              state: CertificationAssessment.states.ENDED_BY_SUPERVISOR,
              version: 2,
              certificationChallenges: [domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false })],
              certificationAnswersByDate: ['answer'],
            });
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
              percentageCorrectAnswers: 33,
              hasEnoughNonNeutralizedChallengesToBeTrusted: true,
            });

            certificationAssessmentRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId: 789 })
              .resolves(certificationAssessment);
            scoringCertificationService.handleV2CertificationScoring.resolves({
              certificationCourse,
              certificationAssessmentScore,
            });
            scoringCertificationService.isLackOfAnswersForTechnicalReason.resolves(true);
            certificationCourseRepository.update.resolves(certificationCourse);

            // when
            await handleCertificationRescoring({
              event,
              assessmentResultRepository,
              certificationAssessmentRepository,
              competenceMarkRepository,
              scoringCertificationService,
              certificationCourseRepository,
            });

            // then
            const expectedCertificationCourse = domainBuilder.buildCertificationCourse({
              id: 789,
              isRejectedForFraud: false,
              abortReason: ABORT_REASONS.TECHNICAL,
              isCancelled: true,
            });
            expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
              certificationCourse: expectedCertificationCourse,
            });
          });
        });
      });

      it('returns a CertificationRescoringCompleted event', async function () {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse();

        const event = new ChallengeNeutralized({ certificationCourseId: certificationCourse.getId(), juryId: 7 });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          userId: 123,
          certificationCourseId: certificationCourse.getId(),
        });
        const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          competenceMarks: [],
          percentageCorrectAnswers: 80,
          hasEnoughNonNeutralizedChallengesToBeTrusted: true,
        });

        scoringCertificationService.handleV2CertificationScoring.resolves({
          certificationCourse,
          certificationAssessmentScore,
        });
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.getId() })
          .resolves(certificationAssessment);
        certificationCourseRepository.get.withArgs({ id: certificationCourse.getId() }).resolves(certificationCourse);

        // when
        const returnedEvent = await handleCertificationRescoring({
          event,
          assessmentResultRepository,
          certificationAssessmentRepository,
          competenceMarkRepository,
          scoringCertificationService,
          certificationCourseRepository,
        });

        // then
        const expectedReturnedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
          certificationCourseId: certificationCourse.getId(),
          userId: 123,
          reproducibilityRate: 80,
        });
        expect(returnedEvent).to.deep.equal(expectedReturnedEvent);
      });
    });

    context('when computation fails', function () {
      it('computes and persists the assessment result in error', async function () {
        // given
        const event = new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 });
        const certificationAssessment = new CertificationAssessment({
          id: 123,
          userId: 123,
          certificationCourseId: 789,
          createdAt: new Date('2020-01-01'),
          completedAt: new Date('2020-01-01'),
          state: CertificationAssessment.states.STARTED,
          version: 2,
          certificationChallenges: [
            domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
            domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
          ],
          certificationAnswersByDate: ['answer'],
        });
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: 1 })
          .resolves(certificationAssessment);

        scoringCertificationService.handleV2CertificationScoring.rejects(new CertificationComputeError('Oopsie'));

        const assessmentResultToBeSaved = new AssessmentResult({
          id: undefined,
          emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
          commentByJury: 'Oopsie',
          pixScore: 0,
          reproducibilityRate: 0,
          status: AssessmentResult.status.ERROR,
          assessmentId: 123,
          juryId: 7,
        });
        const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });
        assessmentResultRepository.save
          .withArgs({
            certificationCourseId: 123,
            assessmentResult: assessmentResultToBeSaved,
          })
          .resolves(savedAssessmentResult);

        // when
        await handleCertificationRescoring({
          event,
          assessmentResultRepository,
          certificationAssessmentRepository,
          competenceMarkRepository,
          scoringCertificationService,
          certificationCourseRepository,
        });

        // then
        expect(assessmentResultRepository.save).to.have.been.calledOnce;
      });
    });
  });
});
