import { ChallengeDeneutralized } from '../../../../../../../lib/domain/events/ChallengeDeneutralized.js';
import { ChallengeNeutralized } from '../../../../../../../lib/domain/events/ChallengeNeutralized.js';
import { handleV2CertificationScoring } from '../../../../../../../src/certification/evaluation/domain/services/scoring/scoring-v2.js';
import { CertificationAssessment } from '../../../../../../../src/certification/session-management/domain/models/CertificationAssessment.js';
import { ABORT_REASONS } from '../../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { AutoJuryCommentKeys } from '../../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { AssessmentResult, status } from '../../../../../../../src/shared/domain/models/AssessmentResult.js';
import { CertificationResult } from '../../../../../../../src/shared/domain/models/index.js';
import { domainBuilder, expect, sinon } from '../../../../../../test-helper.js';

describe('Certification | Shared | Unit | Domain | Services | Scoring V2', function () {
  context('#handleV2CertificationScoring', function () {
    let assessmentResultRepository, competenceMarkRepository, certificationCourseRepository, scoringDegradationService;

    beforeEach(function () {
      competenceMarkRepository = { save: sinon.stub() };
      assessmentResultRepository = { save: sinon.stub() };
      certificationCourseRepository = { get: sinon.stub() };
      scoringDegradationService = {
        calculateCertificationAssessmentScore: sinon.stub(),
        isLackOfAnswersForTechnicalReason: sinon.stub(),
      };
    });

    context('for scoring certification', function () {
      context('when candidate has enough correct answers to be certified', function () {
        let certificationCourseId, certificationAssessmentScore, certificationAssessment, certificationCourse;

        beforeEach(function () {
          const assessmentResultId = 123123;
          certificationCourseId = 123;
          const competenceMark1 = domainBuilder.buildCompetenceMark({ assessmentResultId, score: 5 });
          const competenceMark2 = domainBuilder.buildCompetenceMark({ assessmentResultId, score: 4 });
          certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            competenceMarks: [competenceMark1, competenceMark2],
            percentageCorrectAnswers: 80,
          });
          certificationAssessment = domainBuilder.buildCertificationAssessment({
            id: 987,
            certificationCourseId,
            userId: 4567,
          });

          certificationCourse = domainBuilder.buildCertificationCourse({
            id: certificationCourseId,
            completedAt: null,
          });
          const savedAssessmentResult = domainBuilder.certification.scoring.buildAssessmentResult.standard({
            id: assessmentResultId,
            emitter: AssessmentResult.emitters.PIX_ALGO,
            pixScore: certificationAssessmentScore.nbPix,
            reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
            status: certificationAssessmentScore.status,
            assessmentId: certificationAssessment.id,
          });

          scoringDegradationService.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
          scoringDegradationService.isLackOfAnswersForTechnicalReason.returns(false);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          assessmentResultRepository.save
            .withArgs({ certificationCourseId, assessmentResult: savedAssessmentResult })
            .resolves(savedAssessmentResult);
          competenceMarkRepository.save.resolves();
        });

        it('builds and save an assessment result with the expected arguments', async function () {
          // when
          await handleV2CertificationScoring({
            emitter: AssessmentResult.emitters.PIX_ALGO,
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringDegradationService,
          });

          // then
          const expectedAssessmentResult = new AssessmentResult({
            pixScore: certificationAssessmentScore.nbPix,
            reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
            status: certificationAssessmentScore.status,
            assessmentId: certificationAssessment.id,
            emitter: AssessmentResult.emitters.PIX_ALGO,
          });
          expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
            certificationCourseId,
            assessmentResult: expectedAssessmentResult,
          });
        });

        it('builds and save as many competence marks as present in the certificationAssessmentScore', async function () {
          // when
          await handleV2CertificationScoring({
            emitter: AssessmentResult.emitters.PIX_ALGO,
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringDegradationService,
          });

          // then
          expect(competenceMarkRepository.save.callCount).to.equal(certificationAssessmentScore.competenceMarks.length);
        });
      });

      context('when candidate has insufficient correct answers to be certified', function () {
        it('builds and save an insufficient correct answers assessment result', async function () {
          // given
          const certificationCourseId = 123;
          const certificationCourse = domainBuilder.buildCertificationCourse({
            id: certificationCourseId,
            abortReason: null,
          });
          const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            competenceMarks: [],
            percentageCorrectAnswers: 49,
            hasEnoughNonNeutralizedChallengesToBeTrusted: true,
          });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            id: 45674567,
            certificationCourseId,
            userId: 4567,
          });
          const savedAssessmentResult = { id: 123123 };

          scoringDegradationService.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
          scoringDegradationService.isLackOfAnswersForTechnicalReason.returns(false);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          assessmentResultRepository.save.resolves(savedAssessmentResult);
          competenceMarkRepository.save.resolves();

          // when
          await handleV2CertificationScoring({
            emitter: AssessmentResult.emitters.PIX_ALGO,
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringDegradationService,
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
            certificationCourseId: 123,
            assessmentResult: expectedAssessmentResult,
          });
        });
      });
    });

    context('for rescoring certification', function () {
      it('computes and persists the assessment result and competence marks', async function () {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse({
          isCancelled: false,
        });

        const event = new ChallengeNeutralized({ certificationCourseId: certificationCourse.getId(), juryId: 7 });
        const certificationAssessment = new CertificationAssessment({
          id: 123,
          userId: 123,
          certificationCourseId: certificationCourse.getId(),
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
        const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 5 });
        const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 4 });
        const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          nbPix: 9,
          status: AssessmentResult.status.VALIDATED,
          competenceMarks: [competenceMark1, competenceMark2],
          percentageCorrectAnswers: 80,
          hasEnoughNonNeutralizedChallengesToBeTrusted: true,
        });

        const assessmentResultToBeSaved = new AssessmentResult({
          id: undefined,
          emitter: 'PIX-ALGO-NEUTRALIZATION',
          pixScore: 9,
          reproducibilityRate: 80,
          status: AssessmentResult.status.VALIDATED,
          assessmentId: 123,
          juryId: 7,
        });
        const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });
        assessmentResultRepository.save.resolves({
          certificationCourseId: 789,
          assessmentResult: savedAssessmentResult,
        });

        scoringDegradationService.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
        scoringDegradationService.isLackOfAnswersForTechnicalReason.returns(false);
        certificationCourseRepository.get
          .withArgs({ id: certificationAssessment.certificationCourseId })
          .resolves(certificationCourse);
        assessmentResultRepository.save.resolves(savedAssessmentResult);
        competenceMarkRepository.save.resolves();

        // when
        await handleV2CertificationScoring({
          event,
          emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
          certificationAssessment,
          assessmentResultRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringDegradationService,
        });

        // then
        expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
          certificationCourseId: 123,
          assessmentResult: assessmentResultToBeSaved,
        });
        competenceMark1.assessmentResultId = savedAssessmentResult.id;
        competenceMark2.assessmentResultId = savedAssessmentResult.id;
        expect(competenceMarkRepository.save).to.have.been.calledWithExactly(competenceMark1);
        expect(competenceMarkRepository.save).to.have.been.calledWithExactly(competenceMark2);
      });

      context('when the certification has not enough non neutralized challenges to be trusted', function () {
        let certificationCourse, event, certificationAssessment;

        beforeEach(function () {
          certificationCourse = domainBuilder.buildCertificationCourse({ id: 789 });
          event = new ChallengeNeutralized({ certificationCourseId: 789, juryId: 7 });
          certificationAssessment = new CertificationAssessment({
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
        });

        it('builds and save a not trustable assessment result', async function () {
          // given
          const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 12 });
          const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 18 });
          const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            status: AssessmentResult.status.VALIDATED,
            competenceMarks: [competenceMark1, competenceMark2],
            percentageCorrectAnswers: 80,
            hasEnoughNonNeutralizedChallengesToBeTrusted: false,
          });
          const assessmentResultToBeSaved = domainBuilder.certification.scoring.buildAssessmentResult.notTrustable({
            emitter: 'PIX-ALGO-NEUTRALIZATION',
            pixScore: 30,
            reproducibilityRate: 80,
            status: AssessmentResult.status.VALIDATED,
            assessmentId: 123,
            juryId: 7,
          });
          const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });

          assessmentResultRepository.save.resolves({
            certificationCourseId: 789,
            assessmentResult: savedAssessmentResult,
          });
          scoringDegradationService.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
          scoringDegradationService.isLackOfAnswersForTechnicalReason.returns(false);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          assessmentResultRepository.save.resolves(savedAssessmentResult);
          competenceMarkRepository.save.resolves();

          // when
          await handleV2CertificationScoring({
            event,
            emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringDegradationService,
          });

          // then
          expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
            certificationCourseId: 789,
            assessmentResult: assessmentResultToBeSaved,
          });
        });

        context('when it has insufficient correct answers', function () {
          it('builds and save a not trustable assessment result', async function () {
            // given
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
              status: AssessmentResult.status.REJECTED,
              percentageCorrectAnswers: 45,
              hasEnoughNonNeutralizedChallengesToBeTrusted: false,
            });
            const assessmentResultToBeSaved = domainBuilder.certification.scoring.buildAssessmentResult.notTrustable({
              emitter: 'PIX-ALGO-NEUTRALIZATION',
              pixScore: 0,
              reproducibilityRate: 45,
              status: AssessmentResult.status.REJECTED,
              assessmentId: 123,
              juryId: 7,
            });
            const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });

            assessmentResultRepository.save.resolves({
              certificationCourseId: 789,
              assessmentResult: savedAssessmentResult,
            });
            scoringDegradationService.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
            scoringDegradationService.isLackOfAnswersForTechnicalReason.returns(false);
            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(certificationCourse);
            assessmentResultRepository.save.resolves(savedAssessmentResult);
            competenceMarkRepository.save.resolves();

            // when
            await handleV2CertificationScoring({
              event,
              emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
              certificationAssessment,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringDegradationService,
            });

            // then
            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 789,
              assessmentResult: assessmentResultToBeSaved,
            });
          });
        });
      });

      context('when the certification has enough non neutralized challenges to be trusted', function () {
        it('build and save a standard assessment result', async function () {
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
          certificationCourseRepository.get.withArgs({ id: 789 }).resolves(certificationCourse);
          const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 12 });
          const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 18 });
          const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            status: AssessmentResult.status.VALIDATED,
            competenceMarks: [competenceMark1, competenceMark2],
            percentageCorrectAnswers: 80,
            hasEnoughNonNeutralizedChallengesToBeTrusted: true,
          });
          const assessmentResultToBeSaved = domainBuilder.certification.scoring.buildAssessmentResult.standard({
            emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
            pixScore: 30,
            reproducibilityRate: 80,
            status: AssessmentResult.status.VALIDATED,
            assessmentId: 123,
            juryId: 7,
          });
          const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });

          assessmentResultRepository.save.resolves({
            certificationCourseId: 789,
            assessmentResult: savedAssessmentResult,
          });
          scoringDegradationService.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
          scoringDegradationService.isLackOfAnswersForTechnicalReason.returns(false);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          assessmentResultRepository.save.resolves(savedAssessmentResult);
          competenceMarkRepository.save.resolves();

          // when
          await handleV2CertificationScoring({
            event,
            emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringDegradationService,
          });

          // then
          expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
            certificationCourseId: 789,
            assessmentResult: assessmentResultToBeSaved,
          });
        });
      });

      context('when the certification course is rejected', function () {
        context('when it is rejected for fraud', function () {
          it('builds and save a standard rejected assessment result ', async function () {
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

            const savedAssessmentResult = domainBuilder.certification.scoring.buildAssessmentResult.fraud({
              pixScore: 30,
              reproducibilityRate: 80,
              assessmentId: 123,
              juryId: 7,
            });
            assessmentResultRepository.save.resolves({
              certificationCourseId: 789,
              assessmentResult: savedAssessmentResult,
            });
            scoringDegradationService.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
            scoringDegradationService.isLackOfAnswersForTechnicalReason.returns(false);
            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(certificationCourse);
            competenceMarkRepository.save.resolves();

            // when
            await handleV2CertificationScoring({
              event,
              emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
              certificationAssessment,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringDegradationService,
            });

            // then
            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 789,
              assessmentResult: savedAssessmentResult,
            });
          });
        });

        context('when it is rejected for insufficient correct answers', function () {
          it('builds and save an insufficient correct answers assessment result', async function () {
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

            const assessmentResultToBeSaved =
              domainBuilder.certification.scoring.buildAssessmentResult.insufficientCorrectAnswers({
                pixScore: 0,
                reproducibilityRate: 33,
                assessmentId: 123,
                emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
                juryId: 7,
              });
            assessmentResultRepository.save.resolves({
              certificationCourseId: 789,
              assessmentResult: assessmentResultToBeSaved,
            });
            scoringDegradationService.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
            scoringDegradationService.isLackOfAnswersForTechnicalReason.returns(false);
            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(certificationCourse);
            competenceMarkRepository.save.resolves();

            // when
            await handleV2CertificationScoring({
              event,
              emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
              certificationAssessment,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringDegradationService,
            });

            // then
            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 789,
              assessmentResult: assessmentResultToBeSaved,
            });
          });

          context('when the candidate encountered a technical issue during certification', function () {
            it('builds and save an assessment result lacking answers for technical reason', async function () {
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

              const assessmentResultToBeSaved =
                domainBuilder.certification.scoring.buildAssessmentResult.lackOfAnswersForTechnicalReason({
                  pixScore: 0,
                  reproducibilityRate: 33,
                  status: AssessmentResult.status.REJECTED,
                  assessmentId: 123,
                  emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
                  juryId: 7,
                });

              assessmentResultRepository.save.resolves({
                certificationCourseId: 789,
                assessmentResult: assessmentResultToBeSaved,
              });
              scoringDegradationService.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
              scoringDegradationService.isLackOfAnswersForTechnicalReason.returns(true);
              certificationCourseRepository.get
                .withArgs({ id: certificationAssessment.certificationCourseId })
                .resolves(certificationCourse);
              competenceMarkRepository.save.resolves();

              // when
              await handleV2CertificationScoring({
                event,
                emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
                certificationAssessment,
                assessmentResultRepository,
                certificationCourseRepository,
                competenceMarkRepository,
                scoringDegradationService,
              });

              // then
              expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
                certificationCourseId: 789,
                assessmentResult: assessmentResultToBeSaved,
              });
            });
          });
        });
      });
    });
  });
});
