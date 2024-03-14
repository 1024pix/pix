import { CertificationComputeError } from '../../../../lib/domain/errors.js';
import { CertificationCourseRejected } from '../../../../lib/domain/events/CertificationCourseRejected.js';
import { CertificationCourseUnrejected } from '../../../../lib/domain/events/CertificationCourseUnrejected.js';
import { CertificationJuryDone } from '../../../../lib/domain/events/CertificationJuryDone.js';
import { ChallengeDeneutralized } from '../../../../lib/domain/events/ChallengeDeneutralized.js';
import { ChallengeNeutralized } from '../../../../lib/domain/events/ChallengeNeutralized.js';
import { _forTestOnly } from '../../../../lib/domain/events/index.js';
import { ABORT_REASONS } from '../../../../lib/domain/models/CertificationCourse.js';
import { AssessmentResult, CertificationAssessment, CertificationResult } from '../../../../lib/domain/models/index.js';
import { AutoJuryCommentKeys } from '../../../../src/certification/shared/domain/models/JuryComment.js';
import { config } from '../../../../src/shared/config.js';
import { CertificationVersion } from '../../../../src/shared/domain/models/CertificationVersion.js';
import {
  generateAnswersForChallenges,
  generateChallengeList,
} from '../../../certification/shared/fixtures/challenges.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

const { handleCertificationRescoring } = _forTestOnly.handlers;

const CERTIFICATION_RESULT_EMITTER_AUTOJURY = CertificationResult.emitters.PIX_ALGO_AUTO_JURY;
const CERTIFICATION_RESULT_EMITTER_NEUTRALIZATION = CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION;
const CERTIFICATION_RESULT_EMITTER_FRAUD_REJECTION = CertificationResult.emitters.PIX_ALGO_FRAUD_REJECTION;
const { minimumAnswersRequiredToValidateACertification } = config.v3Certification.scoring;
const maximumAssessmentLength = 32;

describe('Unit | Domain | Events | handle-certification-rescoring', function () {
  describe('when handling a v3 certification', function () {
    let assessmentResultRepository,
      certificationAssessmentRepository,
      certificationChallengeForScoringRepository,
      answerRepository,
      certificationCourseRepository,
      flashAlgorithmConfigurationRepository,
      flashAlgorithmService,
      certificationAssessmentHistoryRepository,
      competenceForScoringRepository,
      competenceMarkRepository;

    let baseFlashAlgorithmConfig;
    let assessmentResult;
    let dependencies;

    beforeEach(function () {
      assessmentResultRepository = {
        save: sinon.stub(),
      };
      certificationAssessmentRepository = {
        getByCertificationCourseId: sinon.stub(),
      };
      certificationChallengeForScoringRepository = {
        getByCertificationCourseId: sinon.stub(),
      };
      answerRepository = {
        findByAssessment: sinon.stub(),
      };
      certificationCourseRepository = {
        get: sinon.stub(),
        update: sinon.stub().resolves(),
      };
      flashAlgorithmConfigurationRepository = {
        getMostRecentBeforeDate: sinon.stub(),
      };
      flashAlgorithmService = {
        getEstimatedLevelAndErrorRate: sinon.stub(),
        getEstimatedLevelAndErrorRateHistory: sinon.stub(),
      };

      certificationAssessmentHistoryRepository = {
        save: sinon.stub(),
      };

      competenceForScoringRepository = {
        listByLocale: sinon.stub(),
      };

      competenceMarkRepository = {
        save: sinon.stub(),
      };

      dependencies = {
        certificationAssessmentRepository,
        certificationChallengeForScoringRepository,
        answerRepository,
        assessmentResultRepository,
        certificationCourseRepository,
        flashAlgorithmConfigurationRepository,
        flashAlgorithmService,
        certificationAssessmentHistoryRepository,
        competenceForScoringRepository,
        competenceMarkRepository,
      };

      baseFlashAlgorithmConfig = domainBuilder.buildFlashAlgorithmConfiguration({
        maximumAssessmentLength,
      });

      competenceForScoringRepository.listByLocale.resolves([domainBuilder.buildCompetenceForScoring()]);

      assessmentResult = domainBuilder.buildAssessmentResult();
      assessmentResultRepository.save.resolves(assessmentResult);
      competenceMarkRepository.save.resolves();
    });

    describe('when less than the minimum number of answers required by the config has been answered', function () {
      describe('when the certification was not finished due to a lack of time', function () {
        it('should save the score with a rejected status', async function () {
          // given
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            version: CertificationVersion.V3,
          });

          const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
            abortReason: ABORT_REASONS.CANDIDATE,
          });

          const challenges = generateChallengeList({ length: minimumAnswersRequiredToValidateACertification - 1 });
          const certificationChallengesForScoring = challenges.map((challenge) =>
            domainBuilder.buildCertificationChallengeForScoring(challenge),
          );
          const answers = generateAnswersForChallenges({ challenges });

          const expectedEstimatedLevel = 2;
          const scoreForEstimatedLevel = 592;
          const { certificationCourseId } = certificationAssessment;

          const capacityHistory = [
            domainBuilder.buildCertificationChallengeCapacity({
              certificationChallengeId: certificationChallengesForScoring[0].certificationChallengeId,
              capacity: expectedEstimatedLevel,
            }),
          ];

          const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
            capacityHistory,
          });

          certificationChallengeForScoringRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationChallengesForScoring);

          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationAssessment);

          answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

          certificationCourseRepository.get
            .withArgs(certificationAssessment.certificationCourseId)
            .resolves(abortedCertificationCourse);

          flashAlgorithmService.getEstimatedLevelAndErrorRate
            .withArgs({
              challenges: certificationChallengesForScoring,
              allAnswers: answers,
              estimatedLevel: sinon.match.number,
              variationPercent: undefined,
              variationPercentUntil: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns({
              estimatedLevel: expectedEstimatedLevel,
            });

          flashAlgorithmService.getEstimatedLevelAndErrorRateHistory
            .withArgs({
              challenges: certificationChallengesForScoring,
              allAnswers: answers,
              estimatedLevel: sinon.match.number,
              variationPercent: undefined,
              variationPercentUntil: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns([
              {
                estimatedLevel: expectedEstimatedLevel,
              },
            ]);

          const event = new CertificationJuryDone({
            certificationCourseId,
          });

          // when
          const result = await handleCertificationRescoring({
            ...dependencies,
            event,
          });

          // then
          const expectedResult = {
            certificationCourseId,
            assessmentResult: new AssessmentResult({
              emitter: AssessmentResult.emitters.PIX_ALGO,
              pixScore: scoreForEstimatedLevel,
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

          const expectedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
            certificationCourseId,
            userId: certificationAssessment.certificationCourseId,
            reproducibilityRate: 100,
          });

          expect(result).to.deep.equal(expectedEvent);
          expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
            certificationAssessmentHistory,
          );
        });
      });

      describe('when the certification was not finished due to technical difficulties', function () {
        it('should save the score with a rejected status and cancel the certification course', async function () {
          // given
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            version: CertificationVersion.V3,
          });

          const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
            abortReason: ABORT_REASONS.TECHNICAL,
          });

          const challenges = generateChallengeList({ length: minimumAnswersRequiredToValidateACertification - 1 });
          const certificationChallengesForScoring = challenges.map((challenge) =>
            domainBuilder.buildCertificationChallengeForScoring(challenge),
          );
          const answers = generateAnswersForChallenges({ challenges });

          const expectedEstimatedLevel = 2;
          const scoreForEstimatedLevel = 592;
          const { certificationCourseId } = certificationAssessment;

          const capacityHistory = [
            domainBuilder.buildCertificationChallengeCapacity({
              certificationChallengeId: certificationChallengesForScoring[0].certificationChallengeId,
              capacity: expectedEstimatedLevel,
            }),
          ];

          const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
            capacityHistory,
          });

          certificationChallengeForScoringRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationChallengesForScoring);

          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationAssessment);

          answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

          certificationCourseRepository.get
            .withArgs(certificationAssessment.certificationCourseId)
            .resolves(abortedCertificationCourse);

          flashAlgorithmService.getEstimatedLevelAndErrorRate
            .withArgs({
              challenges: certificationChallengesForScoring,
              allAnswers: answers,
              estimatedLevel: sinon.match.number,
              variationPercent: undefined,
              variationPercentUntil: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns({
              estimatedLevel: expectedEstimatedLevel,
            });

          flashAlgorithmService.getEstimatedLevelAndErrorRateHistory
            .withArgs({
              challenges: certificationChallengesForScoring,
              allAnswers: answers,
              estimatedLevel: sinon.match.number,
              variationPercent: undefined,
              variationPercentUntil: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns([
              {
                estimatedLevel: expectedEstimatedLevel,
              },
            ]);

          const event = new CertificationJuryDone({
            certificationCourseId,
          });

          // when
          const result = await handleCertificationRescoring({
            ...dependencies,
            event,
          });

          // then
          const expectedResult = {
            certificationCourseId,
            assessmentResult: new AssessmentResult({
              emitter: AssessmentResult.emitters.PIX_ALGO,
              pixScore: scoreForEstimatedLevel,
              reproducibilityRate: 100,
              status: AssessmentResult.status.REJECTED,
              competenceMarks: [],
              assessmentId: 123,
              commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
                fallbackComment:
                  "Un ou plusieurs problème(s) technique(s), signalé(s) à votre surveillant pendant la session de certification, a/ont affecté la qualité du test de certification. En raison du trop grand nombre de questions auxquelles vous n'avez pas pu répondre dans de bonnes conditions, nous ne sommes malheureusement pas en mesure de calculer un score fiable et de fournir un certificat. La certification est annulée, le prescripteur de votre certification (le cas échéant), en est informé.",
              }),
              commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
                fallbackComment:
                  "Un ou plusieurs problème(s) technique(s), signalés par ce(cette) candidat(e) au surveillant de la session de certification, a/ont affecté le bon déroulement du test de certification. Nous sommes dans l'incapacité de le/la certifier, sa certification est donc annulée. Cette information est à prendre en compte et peut vous conduire à proposer une nouvelle session de certification pour ce(cette) candidat(e).",
              }),
            }),
          };

          const expectedCertificationCourse = domainBuilder.buildCertificationCourse({
            abortReason: ABORT_REASONS.TECHNICAL,
            isCancelled: true,
          });

          expect(assessmentResultRepository.save).to.have.been.calledWith(expectedResult);

          expect(certificationCourseRepository.update).to.have.been.calledOnce;
          expect(certificationCourseRepository.update).to.have.been.calledWithExactly(expectedCertificationCourse);

          const expectedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
            certificationCourseId,
            userId: certificationAssessment.certificationCourseId,
            reproducibilityRate: 100,
          });

          expect(result).to.deep.equal(expectedEvent);
          expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
            certificationAssessmentHistory,
          );
        });
      });
    });

    describe('when not all questions were answered', function () {
      describe('when the candidate did not finish due to technical difficulties', function () {
        it('should save the raw score', async function () {
          // given
          const certificationCourseStartDate = new Date('2022-01-01');
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            version: CertificationVersion.V3,
          });

          const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
            abortReason: ABORT_REASONS.TECHNICAL,
            createdAt: certificationCourseStartDate,
          });

          const challenges = generateChallengeList({ length: minimumAnswersRequiredToValidateACertification });
          const certificationChallengesForScoring = challenges.map((challenge) =>
            domainBuilder.buildCertificationChallengeForScoring(challenge),
          );
          const answers = generateAnswersForChallenges({ challenges });

          const expectedEstimatedLevel = 2;
          const rawScore = 592;
          const { certificationCourseId } = certificationAssessment;

          const capacityHistory = [
            domainBuilder.buildCertificationChallengeCapacity({
              certificationChallengeId: certificationChallengesForScoring[0].certificationChallengeId,
              capacity: expectedEstimatedLevel,
            }),
          ];

          const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
            capacityHistory,
          });

          certificationChallengeForScoringRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationChallengesForScoring);

          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationAssessment);

          answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

          certificationCourseRepository.get
            .withArgs(certificationAssessment.certificationCourseId)
            .resolves(abortedCertificationCourse);

          flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
            .withArgs(abortedCertificationCourse.getStartDate())
            .resolves(baseFlashAlgorithmConfig);

          flashAlgorithmService.getEstimatedLevelAndErrorRate
            .withArgs({
              challenges: certificationChallengesForScoring,
              allAnswers: answers,
              estimatedLevel: sinon.match.number,
              variationPercent: undefined,
              variationPercentUntil: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns({
              estimatedLevel: expectedEstimatedLevel,
            });

          flashAlgorithmService.getEstimatedLevelAndErrorRateHistory
            .withArgs({
              challenges: certificationChallengesForScoring,
              allAnswers: answers,
              estimatedLevel: sinon.match.number,
              variationPercent: undefined,
              variationPercentUntil: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns([
              {
                estimatedLevel: expectedEstimatedLevel,
              },
            ]);

          const event = new CertificationJuryDone({
            certificationCourseId,
          });

          // when
          const result = await handleCertificationRescoring({
            ...dependencies,
            event,
          });

          // then
          const expectedResult = {
            certificationCourseId,
            assessmentResult: new AssessmentResult({
              emitter: AssessmentResult.emitters.PIX_ALGO,
              pixScore: rawScore,
              reproducibilityRate: 100,
              status: AssessmentResult.status.VALIDATED,
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
          expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
            certificationAssessmentHistory,
          );
        });
      });

      describe('when the candidate did not finish in time', function () {
        it('should save the degraded score', async function () {
          const certificationCourseStartDate = new Date('2022-01-01');
          // given
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            version: CertificationVersion.V3,
          });

          const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
            abortReason: ABORT_REASONS.CANDIDATE,
            createdAt: certificationCourseStartDate,
          });

          const challenges = generateChallengeList({ length: minimumAnswersRequiredToValidateACertification });
          const certificationChallengesForScoring = challenges.map((challenge) =>
            domainBuilder.buildCertificationChallengeForScoring(challenge),
          );
          const answers = generateAnswersForChallenges({ challenges });

          const expectedEstimatedLevel = 2;
          const degradedScore = 474;
          const { certificationCourseId } = certificationAssessment;

          const capacityHistory = [
            domainBuilder.buildCertificationChallengeCapacity({
              certificationChallengeId: certificationChallengesForScoring[0].certificationChallengeId,
              capacity: expectedEstimatedLevel,
            }),
          ];

          const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
            capacityHistory,
          });

          certificationChallengeForScoringRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationChallengesForScoring);

          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationAssessment);

          answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

          certificationCourseRepository.get
            .withArgs(certificationAssessment.certificationCourseId)
            .resolves(abortedCertificationCourse);

          flashAlgorithmConfigurationRepository.getMostRecentBeforeDate.withArgs(
            abortedCertificationCourse.getStartDate(),
          );

          flashAlgorithmService.getEstimatedLevelAndErrorRate
            .withArgs({
              challenges: certificationChallengesForScoring,
              allAnswers: answers,
              estimatedLevel: sinon.match.number,
              variationPercent: undefined,
              variationPercentUntil: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns({
              estimatedLevel: expectedEstimatedLevel,
            });

          flashAlgorithmService.getEstimatedLevelAndErrorRateHistory
            .withArgs({
              challenges: certificationChallengesForScoring,
              allAnswers: answers,
              estimatedLevel: sinon.match.number,
              variationPercent: undefined,
              variationPercentUntil: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns([
              {
                estimatedLevel: expectedEstimatedLevel,
              },
            ]);

          const event = new CertificationJuryDone({
            certificationCourseId,
          });

          // when
          const result = await handleCertificationRescoring({
            ...dependencies,
            event,
          });

          // then
          const expectedResult = {
            certificationCourseId,
            assessmentResult: new AssessmentResult({
              emitter: AssessmentResult.emitters.PIX_ALGO,
              pixScore: degradedScore,
              reproducibilityRate: 100,
              status: AssessmentResult.status.VALIDATED,
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
          expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
            certificationAssessmentHistory,
          );
        });
      });
    });

    describe('when all the questions were answered', function () {
      it('should save the score', async function () {
        // given
        const certificationCourseStartDate = new Date('2022-01-01');
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          version: CertificationVersion.V3,
        });

        const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
          abortReason: ABORT_REASONS.TECHNICAL,
          createdAt: certificationCourseStartDate,
        });

        const challenges = generateChallengeList({ length: maximumAssessmentLength });
        const certificationChallengesForScoring = challenges.map((challenge) =>
          domainBuilder.buildCertificationChallengeForScoring(challenge),
        );
        const answers = generateAnswersForChallenges({ challenges });

        const expectedEstimatedLevel = 2;
        const scoreForEstimatedLevel = 592;
        const { certificationCourseId } = certificationAssessment;

        const capacityHistory = [
          domainBuilder.buildCertificationChallengeCapacity({
            certificationChallengeId: certificationChallengesForScoring[0].certificationChallengeId,
            capacity: expectedEstimatedLevel,
          }),
        ];

        const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
          capacityHistory,
        });

        certificationChallengeForScoringRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(certificationChallengesForScoring);

        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(certificationAssessment);

        flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
          .withArgs(certificationCourseStartDate)
          .resolves(baseFlashAlgorithmConfig);

        answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

        certificationCourseRepository.get
          .withArgs(certificationAssessment.certificationCourseId)
          .resolves(abortedCertificationCourse);

        flashAlgorithmService.getEstimatedLevelAndErrorRate
          .withArgs({
            challenges: certificationChallengesForScoring,
            allAnswers: answers,
            estimatedLevel: sinon.match.number,
            variationPercent: undefined,
            variationPercentUntil: undefined,
            doubleMeasuresUntil: undefined,
          })
          .returns({
            estimatedLevel: expectedEstimatedLevel,
          });

        flashAlgorithmService.getEstimatedLevelAndErrorRateHistory
          .withArgs({
            challenges: certificationChallengesForScoring,
            allAnswers: answers,
            estimatedLevel: sinon.match.number,
            variationPercent: undefined,
            variationPercentUntil: undefined,
            doubleMeasuresUntil: undefined,
          })
          .returns([
            {
              estimatedLevel: expectedEstimatedLevel,
            },
          ]);

        const event = new CertificationJuryDone({
          certificationCourseId,
        });

        // when
        const result = await handleCertificationRescoring({
          ...dependencies,
          event,
        });

        // then
        const expectedResult = {
          certificationCourseId,
          assessmentResult: new AssessmentResult({
            emitter: AssessmentResult.emitters.PIX_ALGO,
            pixScore: scoreForEstimatedLevel,
            reproducibilityRate: 100,
            status: AssessmentResult.status.VALIDATED,
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
        expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
          certificationAssessmentHistory,
        );
        expect(competenceMarkRepository.save).to.have.been.calledWithExactly(
          domainBuilder.buildCompetenceMark({
            id: undefined,
            assessmentResultId: assessmentResult.id,
            area_code: '1',
            competenceId: 'recCompetenceId',
            competence_code: '1.1',
            level: 2,
            score: 0,
          }),
        );
      });

      describe('when certification is rejected for fraud', function () {
        it('should save the score with rejected status', async function () {
          const certificationCourseStartDate = new Date('2022-01-01');
          // given
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            version: CertificationVersion.V3,
          });

          const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
            isRejectedForFraud: true,
            createdAt: certificationCourseStartDate,
          });

          const challenges = generateChallengeList({ length: maximumAssessmentLength });
          const certificationChallengesForScoring = challenges.map((challenge) =>
            domainBuilder.buildCertificationChallengeForScoring(challenge),
          );
          const answers = generateAnswersForChallenges({ challenges });

          const expectedEstimatedLevel = 2;
          const scoreForEstimatedLevel = 592;
          const { certificationCourseId } = certificationAssessment;

          const capacityHistory = [
            domainBuilder.buildCertificationChallengeCapacity({
              certificationChallengeId: certificationChallengesForScoring[0].certificationChallengeId,
              capacity: expectedEstimatedLevel,
            }),
          ];

          const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
            capacityHistory,
          });

          certificationChallengeForScoringRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationChallengesForScoring);

          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationAssessment);

          flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
            .withArgs(certificationCourseStartDate)
            .resolves(baseFlashAlgorithmConfig);

          answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

          certificationCourseRepository.get
            .withArgs(certificationAssessment.certificationCourseId)
            .resolves(abortedCertificationCourse);

          flashAlgorithmService.getEstimatedLevelAndErrorRate
            .withArgs({
              challenges: certificationChallengesForScoring,
              allAnswers: answers,
              estimatedLevel: sinon.match.number,
              variationPercent: undefined,
              variationPercentUntil: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns({
              estimatedLevel: expectedEstimatedLevel,
            });

          flashAlgorithmService.getEstimatedLevelAndErrorRateHistory
            .withArgs({
              challenges: certificationChallengesForScoring,
              allAnswers: answers,
              estimatedLevel: sinon.match.number,
              variationPercent: undefined,
              variationPercentUntil: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns([
              {
                estimatedLevel: expectedEstimatedLevel,
              },
            ]);

          const event = new CertificationCourseRejected({
            certificationCourseId,
          });

          // when
          const result = await handleCertificationRescoring({
            ...dependencies,
            event,
          });

          // then
          const assessmentResultToBeSaved = domainBuilder.certification.scoring.buildAssessmentResult.fraud({
            pixScore: scoreForEstimatedLevel,
            reproducibilityRate: 100,
            assessmentId: 123,
          });

          expect(assessmentResultRepository.save).to.have.been.calledWith({
            certificationCourseId: 123,
            assessmentResult: assessmentResultToBeSaved,
          });

          const expectedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
            certificationCourseId,
            userId: certificationAssessment.certificationCourseId,
            reproducibilityRate: 100,
          });

          expect(result).to.deep.equal(expectedEvent);
          expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
            certificationAssessmentHistory,
          );
        });
      });

      describe('when the certification would reach a very high score', function () {
        it('should return the score capped based on the maximum available level when the certification was done', async function () {
          const certificationCourseStartDate = new Date('2022-01-01');
          // given
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            version: CertificationVersion.V3,
          });

          const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
            createdAt: certificationCourseStartDate,
          });

          const challenges = generateChallengeList({ length: maximumAssessmentLength });
          const certificationChallengesForScoring = challenges.map((challenge) =>
            domainBuilder.buildCertificationChallengeForScoring(challenge),
          );

          const answers = generateAnswersForChallenges({ challenges });

          const expectedEstimatedLevel = 8;
          const cappedScoreForEstimatedLevel = 896;
          const { certificationCourseId } = certificationAssessment;

          const capacityHistory = [
            domainBuilder.buildCertificationChallengeCapacity({
              certificationChallengeId: certificationChallengesForScoring[0].certificationChallengeId,
              capacity: expectedEstimatedLevel,
            }),
          ];

          const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
            capacityHistory,
          });

          certificationChallengeForScoringRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationChallengesForScoring);

          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationAssessment);

          flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
            .withArgs(certificationCourseStartDate)
            .resolves(baseFlashAlgorithmConfig);

          answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

          certificationCourseRepository.get
            .withArgs(certificationAssessment.certificationCourseId)
            .resolves(abortedCertificationCourse);

          flashAlgorithmService.getEstimatedLevelAndErrorRate
            .withArgs({
              challenges: certificationChallengesForScoring,
              allAnswers: answers,
              estimatedLevel: sinon.match.number,
              variationPercent: undefined,
              variationPercentUntil: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns({
              estimatedLevel: expectedEstimatedLevel,
            });

          flashAlgorithmService.getEstimatedLevelAndErrorRateHistory
            .withArgs({
              challenges: certificationChallengesForScoring,
              allAnswers: answers,
              estimatedLevel: sinon.match.number,
              variationPercent: undefined,
              variationPercentUntil: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns([
              {
                estimatedLevel: expectedEstimatedLevel,
              },
            ]);

          const expectedResult = {
            certificationCourseId,
            assessmentResult: new AssessmentResult({
              emitter: AssessmentResult.emitters.PIX_ALGO,
              pixScore: cappedScoreForEstimatedLevel,
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
          await handleCertificationRescoring({
            ...dependencies,
            event,
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

        const assessmentResultToBeSaved = domainBuilder.certification.scoring.buildAssessmentResult.notTrustable({
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

        const assessmentResultToBeSaved = domainBuilder.certification.scoring.buildAssessmentResult.standard({
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

    context('when the certification course is rejected', function () {
      context('when it is rejected for fraud', function () {
        it('save a standard rejected assessment result ', async function () {
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

          const assessmentResultToBeSaved = domainBuilder.certification.scoring.buildAssessmentResult.fraud({
            pixScore: 30,
            reproducibilityRate: 80,
            assessmentId: 123,
            juryId: 7,
          });
          assessmentResultRepository.save.resolves({
            certificationCourseId: 789,
            assessmentResult: assessmentResultToBeSaved,
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
          const expectedCertificationCourse = domainBuilder.buildCertificationCourse({
            id: 789,
            isRejectedForFraud: true,
          });

          expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
            certificationCourseId: 789,
            assessmentResult: assessmentResultToBeSaved,
          });
          expect(certificationCourseRepository.update).to.have.been.calledWithExactly(expectedCertificationCourse);
        });
      });

      context('when it is rejected for insufficient correct answers', function () {
        it('should create and save an insufficient correct answers assessment result', async function () {
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
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 789 })
            .resolves(certificationAssessment);
          certificationCourseRepository.get.withArgs(789).resolves(certificationCourse);
          const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 0 });
          const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 0 });
          const competenceMark3 = domainBuilder.buildCompetenceMark({ score: 0 });
          const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            competenceMarks: [competenceMark1, competenceMark2, competenceMark3],
            percentageCorrectAnswers: 33,
            hasEnoughNonNeutralizedChallengesToBeTrusted: true,
          });
          scoringCertificationService.calculateCertificationAssessmentScore
            .withArgs({ certificationAssessment, continueOnError: false })
            .resolves(certificationAssessmentScore);

          const assessmentResultToBeSaved =
            domainBuilder.certification.scoring.buildAssessmentResult.insufficientCorrectAnswers({
              pixScore: 0,
              reproducibilityRate: 33,
              assessmentId: 123,
              emitter: CERTIFICATION_RESULT_EMITTER_NEUTRALIZATION,
              juryId: 7,
            });
          assessmentResultRepository.save.resolves({
            certificationCourseId: 789,
            assessmentResult: assessmentResultToBeSaved,
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
          const expectedCertificationCourse = domainBuilder.buildCertificationCourse({
            id: 789,
            isRejectedForFraud: false,
          });

          expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
            certificationCourseId: 789,
            assessmentResult: assessmentResultToBeSaved,
          });
          expect(certificationCourseRepository.update).to.have.been.calledWithExactly(expectedCertificationCourse);
        });
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
        emitter: CERTIFICATION_RESULT_EMITTER_NEUTRALIZATION,
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
      {
        eventType: CertificationCourseRejected,
        emitter: CERTIFICATION_RESULT_EMITTER_FRAUD_REJECTION,
      },
      {
        eventType: CertificationCourseUnrejected,
        emitter: CERTIFICATION_RESULT_EMITTER_FRAUD_REJECTION,
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
