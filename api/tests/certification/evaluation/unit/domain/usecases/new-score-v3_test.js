import { scoreV3Certification } from '../../../../../../src/certification/evaluation/domain/usecases/new-score-v3.js';
import { SessionAlreadyPublishedError } from '../../../../../../src/certification/session-management/domain/errors.js';
import { NotFinalizedSessionError, NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, knex, sinon } from '../../../../../test-helper.js';
import { generateAnswersForChallenges, generateChallengeList } from '../../../../shared/fixtures/challenges.js';

describe('Unit | Certification | Evaluation | Domain | UseCase | New Score V3', function () {
  beforeEach(function () {
    sinon.stub(knex, 'transaction').callsFake(async (callback) => {
      return callback(knex);
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  context('when certification course does not exist', function () {
    it('should throw an error', async function () {
      const dependencies = createDependencies({
        assessmentSheetRepository: {
          findByCertificationCourseId: sinon.stub().withArgs(1).resolves(null),
        },
        certificationCourseId: 1,
      });

      const error = await catchErr(scoreV3Certification)(dependencies);
      expect(error).to.deepEqualInstance(new NotFoundError('No AssessmentSheet found for certificationCourseId 1'));
    });
  });

  context('when candidate is not scorable', function () {
    context('when session is already published', function () {
      it('should throw a SessionAlreadyPublishedError', async function () {
        const dependencies = createDependencies({
          evaluationSessionRepository: stubEvaluationSessionRepository({ isFinalized: true, isPublished: true }),
        });

        const error = await catchErr(scoreV3Certification)(dependencies);
        expect(error).to.deepEqualInstance(new SessionAlreadyPublishedError());
      });
    });

    context('when session is not finalized ', function () {
      context('when candidate has not seen the test end screen', function () {
        it('should throw a NotFinalizedSessionError', async function () {
          const dependencies = createDependencies({
            evaluationSessionRepository: stubEvaluationSessionRepository({
              isFinalized: false,
              isPublished: false,
            }),
            assessmentSheetRepository: stubAssessmentSheetRepository({ hasCandidateFinishedTest: false }),
          });

          const error = await catchErr(scoreV3Certification)(dependencies);
          expect(error).to.deepEqualInstance(new NotFinalizedSessionError());
        });
      });
    });
  });

  context('when candidate is scorable', function () {
    context('when session is only finalized', function () {
      it('should score the certification', async function () {
        const dependencies = createDependencies({
          evaluationSessionRepository: stubEvaluationSessionRepository({ isFinalized: true, isPublished: false }),
        });

        await scoreV3Certification(dependencies);
        expect(dependencies.certificationAssessmentHistoryRepository.save).to.have.been.called;
      });
    });

    context('when session is not finalized ', function () {
      context('when candidate has seen the test end screen', function () {
        it('should score the certification', async function () {
          const dependencies = createDependencies({
            evaluationSessionRepository: stubEvaluationSessionRepository({
              isFinalized: false,
              isPublished: false,
            }),
            assessmentSheetRepository: stubAssessmentSheetRepository({ hasCandidateFinishedTest: true }),
          });

          await scoreV3Certification(dependencies);
          expect(dependencies.certificationAssessmentHistoryRepository.save).to.have.been.called;
        });
      });
    });

    context('when scoring a CORE only certification', function () {
      it('should persist scoring information', async function () {
        const dependencies = createDependencies();

        await scoreV3Certification(dependencies);

        expect(dependencies.assessmentResultRepository.save).to.have.been.called;
        expect(dependencies.sharedCompetenceMarkRepository.save).to.have.been.called;
        expect(dependencies.certificationCourseRepository.update).to.have.been.called;
        expect(dependencies.certificationAssessmentHistoryRepository.save).to.have.been.called;

        expect(dependencies.complementaryCertificationCourseResultRepository.save).not.to.have.been.called;
      });
    });

    context('when scoring a CLEA certification', function () {
      it('should persist scoring information', async function () {
        const dependencies = createDependencies({
          services: stubServices({ hasCleaSubscription: true }),
        });

        await scoreV3Certification(dependencies);

        expect(dependencies.assessmentResultRepository.save).to.have.been.called;
        expect(dependencies.sharedCompetenceMarkRepository.save).to.have.been.called;
        expect(dependencies.certificationCourseRepository.update).to.have.been.called;
        expect(dependencies.complementaryCertificationCourseResultRepository.save).to.have.been.called;
        expect(dependencies.certificationAssessmentHistoryRepository.save).to.have.been.called;
      });
    });

    context('when scoring a Pix+ certification', function () {
      it('should only persist certification assessment history', async function () {
        const dependencies = createDependencies({
          services: stubServices({ hasPixPlusSubscription: true }),
        });

        await scoreV3Certification(dependencies);

        expect(dependencies.certificationAssessmentHistoryRepository.save).to.have.been.called;

        expect(dependencies.assessmentResultRepository.save).not.to.have.been.called;
        expect(dependencies.sharedCompetenceMarkRepository.save).not.to.have.been.called;
        expect(dependencies.certificationCourseRepository.update).not.to.have.been.called;
        expect(dependencies.complementaryCertificationCourseResultRepository.save).not.to.have.been.called;
      });
    });
  });
});

function _generateCertificationChallengeForChallenge({ discriminant, difficulty, id }) {
  return domainBuilder.certification.scoring.buildChallengeCalibration({
    id,
    discriminant,
    difficulty,
    certificationChallengeId: `certification-challenge-id-for-${id}`,
  });
}

function _buildDataFromAnsweredChallenges(answeredChallenges) {
  const challengeCalibrationsWithoutLiveAlerts = answeredChallenges.map(_generateCertificationChallengeForChallenge);
  const answers = generateAnswersForChallenges({ challenges: answeredChallenges });

  return { answers, challengeCalibrationsWithoutLiveAlerts };
}

function _buildAnswerList(hasCandidateFinishedTest) {
  const NUMBER_OF_QUESTIONS_IN_FINISHED_TEST = 32;
  const NUMBER_OF_QUESTIONS_IN_UNFINISHED_TEST = 25;
  const challenges = generateChallengeList({
    length: hasCandidateFinishedTest ? NUMBER_OF_QUESTIONS_IN_FINISHED_TEST : NUMBER_OF_QUESTIONS_IN_UNFINISHED_TEST,
  });
  const { answers } = _buildDataFromAnsweredChallenges(challenges);
  return answers;
}

function stubAssessmentSheetRepository({ hasCandidateFinishedTest = true } = {}) {
  const assessmentSheetRepository = {
    findByCertificationCourseId: sinon.stub(),
  };
  const answers = _buildAnswerList(hasCandidateFinishedTest);
  const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({ answers });
  assessmentSheetRepository.findByCertificationCourseId.resolves(assessmentSheet);

  return assessmentSheetRepository;
}

function stubCertificationCandidateRepository() {
  const certificationCandidateRepository = {
    findByAssessmentId: sinon.stub(),
  };
  const candidate = domainBuilder.certification.evaluation.buildCandidate();
  certificationCandidateRepository.findByAssessmentId.resolves(candidate);

  return certificationCandidateRepository;
}

function stubSharedVersionRepository() {
  const sharedVersionRepository = {
    getByScopeAndReconciliationDate: sinon.stub(),
  };
  const version = domainBuilder.certification.shared.buildVersion();
  sharedVersionRepository.getByScopeAndReconciliationDate.resolves(version);

  return sharedVersionRepository;
}

function stubServices({ hasCleaSubscription = false, hasPixPlusSubscription = false } = {}) {
  const services = {
    findByCertificationCourseAndVersion: sinon.stub(),
    handleNewV3CertificationScoring: sinon.stub(),
    flashAlgorithmService: {
      getCapacityAndErrorRateHistory: sinon.stub(),
    },
  };
  const object = {
    allChallenges: [],
    askedChallengesWithoutLiveAlerts: [],
    challengeCalibrationsWithoutLiveAlerts: [],
  };
  const assessmentResultId = 123;

  const scoringObject = {
    coreScoring: !hasPixPlusSubscription
      ? {
          certificationAssessmentScore: domainBuilder.buildCertificationAssessmentScore({
            competenceMarks: [domainBuilder.buildCompetenceMark(assessmentResultId)],
          }),
          assessmentResult: domainBuilder.buildAssessmentResult({ id: assessmentResultId }),
        }
      : undefined,
    doubleCertificationScoring:
      hasCleaSubscription && !hasPixPlusSubscription
        ? domainBuilder.certification.evaluation.buildDoubleCertificationScoring()
        : null,
  };
  services.findByCertificationCourseAndVersion.resolves(object);
  services.handleNewV3CertificationScoring.returns(scoringObject);
  services.flashAlgorithmService.getCapacityAndErrorRateHistory.returns([]);

  return services;
}

function stubScoringConfigurationRepository() {
  const scoringConfigurationRepository = {
    getLatestByVersion: sinon.stub(),
  };
  const v3CertificationScoring = domainBuilder.buildV3CertificationScoring();
  scoringConfigurationRepository.getLatestByVersion.resolves(v3CertificationScoring);

  return scoringConfigurationRepository;
}

function stubCertificationAssessmentHistoryRepository() {
  const certificationAssessmentHistoryRepository = {
    save: sinon.stub(),
  };

  return certificationAssessmentHistoryRepository;
}

function stubAssessmentResultRepository() {
  const assessmentResultRepository = {
    save: sinon.stub(),
  };

  assessmentResultRepository.save.resolves(domainBuilder.buildAssessmentResult());
  return assessmentResultRepository;
}

function stubCertificationCourseRepository() {
  const certificationCourseRepository = {
    get: sinon.stub(),
    update: sinon.stub(),
  };
  const certificationCourse = domainBuilder.buildCertificationCourse();
  certificationCourseRepository.get.resolves(certificationCourse);

  return certificationCourseRepository;
}

function stubSharedCompetenceMarkRepository() {
  const sharedCompetenceMarkRepository = {
    save: sinon.stub(),
  };
  return sharedCompetenceMarkRepository;
}

function stubComplementaryCertificationCourseResultRepository() {
  const complementaryCertificationCourseResultRepository = {
    save: sinon.stub(),
  };
  return complementaryCertificationCourseResultRepository;
}

function stubComplementaryCertificationScoringCriteriaRepository() {
  const complementaryCertificationScoringCriteriaRepository = {
    findByCertificationCourseId: sinon.stub(),
  };
  const scoringCriteria = domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria();
  complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId.resolves([scoringCriteria]);

  return complementaryCertificationScoringCriteriaRepository;
}

function stubEvaluationSessionRepository({ isFinalized = false, isPublished = false }) {
  const evaluationSessionRepository = {
    getByCertificationCourseId: sinon.stub(),
  };
  const session = domainBuilder.certification.evaluation.buildResultsSession({ isFinalized, isPublished });
  evaluationSessionRepository.getByCertificationCourseId.resolves(session);

  return evaluationSessionRepository;
}

function createDependencies(overrides = {}) {
  return {
    assessmentSheetRepository: stubAssessmentSheetRepository(),
    certificationCandidateRepository: stubCertificationCandidateRepository(),
    sharedVersionRepository: stubSharedVersionRepository(),
    services: stubServices(),
    scoringConfigurationRepository: stubScoringConfigurationRepository(),
    certificationAssessmentHistoryRepository: stubCertificationAssessmentHistoryRepository(),
    assessmentResultRepository: stubAssessmentResultRepository(),
    certificationCourseRepository: stubCertificationCourseRepository(),
    sharedCompetenceMarkRepository: stubSharedCompetenceMarkRepository(),
    complementaryCertificationCourseResultRepository: stubComplementaryCertificationCourseResultRepository(),
    complementaryCertificationScoringCriteriaRepository: stubComplementaryCertificationScoringCriteriaRepository(),
    evaluationSessionRepository: stubEvaluationSessionRepository({ isFinalized: true, isPublished: false }),
    ...overrides,
  };
}
