import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import { _forTestOnly } from '../../../../lib/domain/events/index.js';
const { handleCertificationRescoring } = _forTestOnly.handlers;
import { ChallengeNeutralized } from '../../../../lib/domain/events/ChallengeNeutralized.js';
import { ChallengeDeneutralized } from '../../../../lib/domain/events/ChallengeDeneutralized.js';
import { CertificationJuryDone } from '../../../../lib/domain/events/CertificationJuryDone.js';
import { CertificationAssessment, CertificationResult, AssessmentResult } from '../../../../lib/domain/models/index.js';
import { CertificationComputeError } from '../../../../lib/domain/errors.js';
import { CertificationVersion } from '../../../../src/shared/domain/models/CertificationVersion.js';
import { config } from '../../../../src/shared/config.js';
import {
  generateAnswersForChallenges,
  generateChallengeList,
} from '../../../certification/shared/fixtures/challenges.js';

const CERTIFICATION_RESULT_EMITTER_AUTOJURY = CertificationResult.emitters.PIX_ALGO_AUTO_JURY;
const CERTIFICATION_RESULT_EMITTER_NEUTRALIZATION = CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION;
const { minimumAnswersRequiredToValidateACertification } = config.v3Certification.scoring;

describe('Unit | Domain | Events | handle-certification-rescoring', function () {
  describe('when handling a v3 certification', function () {
    describe('when less than the minimum number of answers required by the config has been answered', function () {
      it('should save the score with a rejected status', async function () {
        const assessmentResultRepository = {
          save: sinon.stub(),
        };
        const certificationAssessmentRepository = {
          getByCertificationCourseId: sinon.stub(),
        };
        const answerRepository = {
          findByAssessment: sinon.stub(),
        };
        const challengeRepository = {
          getManyFlashParameters: sinon.stub(),
        };

        const flashAlgorithmService = {
          getEstimatedLevelAndErrorRate: sinon.stub(),
        };

        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          version: CertificationVersion.V3,
        });

        const challenges = generateChallengeList({ length: minimumAnswersRequiredToValidateACertification - 1 });
        const challengeIds = challenges.map(({ id }) => id);

        const answers = generateAnswersForChallenges({ challenges });

        const expectedEstimatedLevel = 2;
        const scoreForEstimatedLevel = 592;
        const { certificationCourseId } = certificationAssessment;

        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(certificationAssessment);

        answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

        challengeRepository.getManyFlashParameters.withArgs(challengeIds).resolves(challenges);

        flashAlgorithmService.getEstimatedLevelAndErrorRate
          .withArgs({
            challenges,
            allAnswers: answers,
            estimatedLevel: sinon.match.number,
            variationPercent: undefined,
            doubleMeasuresUntil: undefined,
          })
          .returns({
            estimatedLevel: expectedEstimatedLevel,
          });

        const event = new CertificationJuryDone({
          certificationCourseId,
        });

        const dependencies = {
          certificationAssessmentRepository,
          answerRepository,
          challengeRepository,
          assessmentResultRepository,
          flashAlgorithmService,
        };

        const result = await handleCertificationRescoring({
          ...dependencies,
          event,
        });

        const expectedResult = {
          certificationCourseId,
          assessmentResult: new AssessmentResult({
            commentForJury: 'Computed',
            emitter: 'PIX-ALGO',
            pixScore: scoreForEstimatedLevel,
            reproducibilityRate: 100,
            status: 'rejected',
            competenceMarks: [],
            assessmentId: 123,
          }),
        };

        expect(assessmentResultRepository.save).to.have.been.calledWith(expectedResult);

        const expectedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
          certificationCourseId,
          userId: certificationAssessment.certificationCourseId,
          reproducibilityRate: 100,
        });

        expect(result).to.deep.equal(expectedEvent);
      });
    });
    it('should save the score', async function () {
      const assessmentResultRepository = {
        save: sinon.stub(),
      };
      const certificationAssessmentRepository = {
        getByCertificationCourseId: sinon.stub(),
      };
      const answerRepository = {
        findByAssessment: sinon.stub(),
      };
      const challengeRepository = {
        getManyFlashParameters: sinon.stub(),
      };

      const flashAlgorithmService = {
        getEstimatedLevelAndErrorRate: sinon.stub(),
      };

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        version: CertificationVersion.V3,
      });

      const challenges = generateChallengeList({ length: minimumAnswersRequiredToValidateACertification });
      const challengeIds = challenges.map(({ id }) => id);

      const answers = generateAnswersForChallenges({ challenges });

      const expectedEstimatedLevel = 2;
      const scoreForEstimatedLevel = 592;
      const { certificationCourseId } = certificationAssessment;

      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId })
        .resolves(certificationAssessment);

      answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

      challengeRepository.getManyFlashParameters.withArgs(challengeIds).resolves(challenges);

      flashAlgorithmService.getEstimatedLevelAndErrorRate
        .withArgs({
          challenges,
          allAnswers: answers,
          estimatedLevel: sinon.match.number,
          variationPercent: undefined,
          doubleMeasuresUntil: undefined,
        })
        .returns({
          estimatedLevel: expectedEstimatedLevel,
        });

      const event = new CertificationJuryDone({
        certificationCourseId,
      });

      const dependencies = {
        certificationAssessmentRepository,
        answerRepository,
        challengeRepository,
        assessmentResultRepository,
        flashAlgorithmService,
      };

      const result = await handleCertificationRescoring({
        ...dependencies,
        event,
      });

      const expectedResult = {
        certificationCourseId,
        assessmentResult: new AssessmentResult({
          commentForJury: 'Computed',
          emitter: 'PIX-ALGO',
          pixScore: scoreForEstimatedLevel,
          reproducibilityRate: 100,
          status: 'validated',
          competenceMarks: [],
          assessmentId: 123,
        }),
      };

      expect(assessmentResultRepository.save).to.have.been.calledWith(expectedResult);

      const expectedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
        certificationCourseId,
        userId: certificationAssessment.certificationCourseId,
        reproducibilityRate: 100,
      });

      expect(result).to.deep.equal(expectedEvent);
    });
  });

  describe('when handling a v2 certification', function () {
    it('computes and persists the assessment result and competence marks when computation succeeds', async function () {
      // given
      const certificationCourseRepository = {
        get: sinon.stub(),
        update: sinon.stub(),
      };
      const assessmentResultRepository = { save: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
      const competenceMarkRepository = { save: sinon.stub() };
      const scoringCertificationService = { calculateCertificationAssessmentScore: sinon.stub() };
      const certificationCourse = domainBuilder.buildCertificationCourse({
        isCancelled: false,
      });
      const expectedSaveCertificationCourse = domainBuilder.buildCertificationCourse({
        ...certificationCourse.toDTO(),
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
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves(certificationAssessment);
      certificationCourseRepository.get.withArgs(certificationCourse.getId()).resolves(certificationCourse);

      const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 5 });
      const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 4 });
      const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
        nbPix: 9,
        status: AssessmentResult.status.VALIDATED,
        competenceMarks: [competenceMark1, competenceMark2],
        percentageCorrectAnswers: 80,
        hasEnoughNonNeutralizedChallengesToBeTrusted: true,
      });
      scoringCertificationService.calculateCertificationAssessmentScore
        .withArgs({ certificationAssessment, continueOnError: false })
        .resolves(certificationAssessmentScore);

      const assessmentResultToBeSaved = new AssessmentResult({
        id: undefined,
        commentForJury: 'Computed',
        emitter: 'PIX-ALGO-NEUTRALIZATION',
        pixScore: 9,
        reproducibilityRate: 80,
        status: AssessmentResult.status.VALIDATED,
        assessmentId: 123,
        juryId: 7,
      });
      const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });
      assessmentResultRepository.save
        .withArgs({ certificationCourseId: 123, assessmentResult: assessmentResultToBeSaved })
        .resolves(savedAssessmentResult);

      const dependendencies = {
        assessmentResultRepository,
        certificationAssessmentRepository,
        competenceMarkRepository,
        scoringCertificationService,
        certificationCourseRepository,
      };

      // when
      await handleCertificationRescoring({
        ...dependendencies,
        event,
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
      expect(certificationCourseRepository.update).to.have.been.calledWithExactly(expectedSaveCertificationCourse);
    });

    context('when the certification has not enough non neutralized challenges to be trusted', function () {
      it('cancels the certification and save a not trustable assessment result', async function () {
        // given
        const certificationCourseRepository = {
          get: sinon.stub(),
          update: sinon.stub(),
        };
        const assessmentResultRepository = { save: sinon.stub() };
        const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
        const competenceMarkRepository = { save: sinon.stub() };
        const scoringCertificationService = { calculateCertificationAssessmentScore: sinon.stub() };
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
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: 789 })
          .resolves(certificationAssessment);
        certificationCourseRepository.get.withArgs(789).resolves(certificationCourse);
        const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 12 });
        const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 18 });
        const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          status: AssessmentResult.status.VALIDATED,
          competenceMarks: [competenceMark1, competenceMark2],
          percentageCorrectAnswers: 80,
          hasEnoughNonNeutralizedChallengesToBeTrusted: false,
        });
        scoringCertificationService.calculateCertificationAssessmentScore
          .withArgs({ certificationAssessment, continueOnError: false })
          .resolves(certificationAssessmentScore);

        const assessmentResultToBeSaved = domainBuilder.buildAssessmentResult.notTrustable({
          emitter: 'PIX-ALGO-NEUTRALIZATION',
          pixScore: 30,
          reproducibilityRate: 80,
          status: AssessmentResult.status.VALIDATED,
          assessmentId: 123,
          juryId: 7,
        });
        const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });
        assessmentResultRepository.save
          .withArgs({ certificationCourseId: 789, assessmentResult: assessmentResultToBeSaved })
          .resolves(savedAssessmentResult);

        const dependendencies = {
          assessmentResultRepository,
          certificationAssessmentRepository,
          competenceMarkRepository,
          scoringCertificationService,
          certificationCourseRepository,
        };

        // when
        await handleCertificationRescoring({
          ...dependendencies,
          event,
        });

        // then
        const expectedCertificationCourse = domainBuilder.buildCertificationCourse({
          id: certificationCourse.getId(),
          isCancelled: true,
        });

        expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
          certificationCourseId: 789,
          assessmentResult: assessmentResultToBeSaved,
        });
        expect(certificationCourseRepository.update).to.have.been.calledWithExactly(expectedCertificationCourse);
      });
    });

    context('when the certification has enough non neutralized challenges to be trusted', function () {
      it('uncancels the certification and save a standard assessment result', async function () {
        // given
        const certificationCourseRepository = {
          get: sinon.stub(),
          update: sinon.stub(),
        };
        const assessmentResultRepository = { save: sinon.stub() };
        const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
        const competenceMarkRepository = { save: sinon.stub() };
        const scoringCertificationService = { calculateCertificationAssessmentScore: sinon.stub() };
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
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: 789 })
          .resolves(certificationAssessment);
        certificationCourseRepository.get.withArgs(789).resolves(certificationCourse);
        const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 12 });
        const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 18 });
        const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          status: AssessmentResult.status.VALIDATED,
          competenceMarks: [competenceMark1, competenceMark2],
          percentageCorrectAnswers: 80,
          hasEnoughNonNeutralizedChallengesToBeTrusted: true,
        });
        scoringCertificationService.calculateCertificationAssessmentScore
          .withArgs({ certificationAssessment, continueOnError: false })
          .resolves(certificationAssessmentScore);

        const assessmentResultToBeSaved = domainBuilder.buildAssessmentResult.standard({
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

        const dependendencies = {
          assessmentResultRepository,
          certificationAssessmentRepository,
          competenceMarkRepository,
          scoringCertificationService,
          certificationCourseRepository,
        };

        // when
        await handleCertificationRescoring({
          ...dependendencies,
          event,
        });

        // then
        const expectedCertificationCourse = domainBuilder.buildCertificationCourse({ id: 789, isCancelled: false });

        expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
          certificationCourseId: 789,
          assessmentResult: assessmentResultToBeSaved,
        });
        expect(certificationCourseRepository.update).to.have.been.calledWithExactly(expectedCertificationCourse);
      });
    });

    it('returns a CertificationRescoringCompleted event', async function () {
      // given
      const certificationCourseRepository = {
        get: sinon.stub(),
        update: sinon.stub(),
      };
      const assessmentResultRepository = { save: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
      const competenceMarkRepository = { save: sinon.stub() };
      const scoringCertificationService = { calculateCertificationAssessmentScore: sinon.stub() };
      const certificationCourse = domainBuilder.buildCertificationCourse();

      const event = new ChallengeNeutralized({ certificationCourseId: certificationCourse.getId(), juryId: 7 });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        userId: 123,
        certificationCourseId: certificationCourse.getId(),
      });
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves(certificationAssessment);
      certificationCourseRepository.get.withArgs(certificationCourse.getId()).resolves(certificationCourse);

      const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
        competenceMarks: [],
        percentageCorrectAnswers: 80,
        hasEnoughNonNeutralizedChallengesToBeTrusted: true,
      });
      scoringCertificationService.calculateCertificationAssessmentScore
        .withArgs({ certificationAssessment, continueOnError: false })
        .resolves(certificationAssessmentScore);
      assessmentResultRepository.save.resolves(domainBuilder.buildAssessmentResult());

      const dependendencies = {
        assessmentResultRepository,
        certificationAssessmentRepository,
        competenceMarkRepository,
        scoringCertificationService,
        certificationCourseRepository,
      };

      // when
      const returnedEvent = await handleCertificationRescoring({
        ...dependendencies,
        event,
      });

      // then
      const expectedReturnedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
        certificationCourseId: certificationCourse.getId(),
        userId: 123,
        reproducibilityRate: 80,
      });
      expect(returnedEvent).to.deep.equal(expectedReturnedEvent);
    });

    it('computes and persists the assessment result in error when computation fails', async function () {
      // given
      const assessmentResultRepository = { save: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
      const competenceMarkRepository = { save: sinon.stub() };
      const scoringCertificationService = { calculateCertificationAssessmentScore: sinon.stub() };

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

      scoringCertificationService.calculateCertificationAssessmentScore
        .withArgs({ certificationAssessment, continueOnError: false })
        .rejects(new CertificationComputeError('Oopsie'));

      const assessmentResultToBeSaved = new AssessmentResult({
        id: undefined,
        emitter: 'PIX-ALGO-NEUTRALIZATION',
        commentForJury: 'Oopsie',
        pixScore: 0,
        reproducibilityRate: 0,
        status: 'error',
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

      const dependendencies = {
        assessmentResultRepository,
        certificationAssessmentRepository,
        competenceMarkRepository,
        scoringCertificationService,
      };

      // when
      await handleCertificationRescoring({
        ...dependendencies,
        event,
      });

      // then
      expect(assessmentResultRepository.save).to.have.been.calledOnce;
    });

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        eventType: CertificationJuryDone,
        emitter: CERTIFICATION_RESULT_EMITTER_AUTOJURY,
      },
      {
        eventType: ChallengeNeutralized,
        emitter: CERTIFICATION_RESULT_EMITTER_NEUTRALIZATION,
      },
      {
        eventType: ChallengeDeneutralized,
        emitter: CERTIFICATION_RESULT_EMITTER_NEUTRALIZATION,
      },
    ].forEach(({ eventType, emitter }) => {
      context(`when event is of type ${eventType}`, function () {
        it(`should save an assessment result with a ${emitter} emitter`, async function () {
          // given
          const certificationCourseRepository = {
            get: sinon.stub(),
            update: sinon.stub(),
          };
          const assessmentResultRepository = { save: sinon.stub() };
          const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
          const competenceMarkRepository = { save: sinon.stub() };
          const scoringCertificationService = { calculateCertificationAssessmentScore: sinon.stub() };
          const certificationCourse = domainBuilder.buildCertificationCourse({
            id: 789,
            isCancelled: false,
          });

          const event = new eventType({ certificationCourseId: certificationCourse.getId() });
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
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: certificationCourse.getId() })
            .resolves(certificationAssessment);
          certificationCourseRepository.get.withArgs(certificationCourse.getId()).resolves(certificationCourse);

          const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 5 });
          const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 4 });
          const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            nbPix: 9,
            status: AssessmentResult.status.VALIDATED,
            competenceMarks: [competenceMark1, competenceMark2],
            percentageCorrectAnswers: 80,
            hasEnoughNonNeutralizedChallengesToBeTrusted: true,
          });
          scoringCertificationService.calculateCertificationAssessmentScore
            .withArgs({ certificationAssessment, continueOnError: false })
            .resolves(certificationAssessmentScore);

          const assessmentResultToBeSaved = new AssessmentResult({
            id: undefined,
            commentForJury: 'Computed',
            emitter,
            pixScore: 9,
            reproducibilityRate: 80,
            status: AssessmentResult.status.VALIDATED,
            assessmentId: 123,
            juryId: undefined,
          });
          const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });
          assessmentResultRepository.save.resolves(savedAssessmentResult);

          const dependendencies = {
            assessmentResultRepository,
            certificationAssessmentRepository,
            competenceMarkRepository,
            scoringCertificationService,
            certificationCourseRepository,
          };

          // when
          await handleCertificationRescoring({
            ...dependendencies,
            event,
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
