import sinon from 'sinon';

import { scoreV3Certification } from '../../../../../../src/certification/evaluation/domain/usecases/score-v3-certification.js';
import { SessionAlreadyPublishedError } from '../../../../../../src/certification/session-management/domain/errors.js';
import { NotFinalizedSessionError, NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';
import { generateAnswersForChallenges, generateChallengeList } from '../../../../shared/fixtures/challenges.js';

describe('Unit | Certification | Evaluation | Domain | UseCase | Score V3 Certification', function () {
  beforeEach(function () {
    sinon.stub(knex, 'transaction').callsFake(async (callback) => {
      return callback(knex);
    });
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
          sessionRepository: stubSessionRepository({ isFinalized: true, isPublished: true }),
        });

        const error = await catchErr(scoreV3Certification)(dependencies);
        expect(error).to.deepEqualInstance(new SessionAlreadyPublishedError());
      });
    });

    context('when session is not finalized ', function () {
      context('when candidate has not seen the test end screen', function () {
        it('should throw a NotFinalizedSessionError', async function () {
          const dependencies = createDependencies({
            sessionRepository: stubSessionRepository({
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
          sessionRepository: stubSessionRepository({ isFinalized: true, isPublished: false }),
        });

        await scoreV3Certification(dependencies);
        expect(dependencies.certificationAssessmentHistoryRepository.save).to.have.been.called;
      });
    });

    context('when session is not finalized', function () {
      context('when candidate has seen the test end screen', function () {
        it('should score the certification', async function () {
          const dependencies = createDependencies({
            sessionRepository: stubSessionRepository({
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

    context('when scoring a Pix+ certification', function () {
      it('should only persist certification assessment history', async function () {
        const dependencies = createDependencies({
          services: stubServices({ hasPixPlusSubscription: true }),
        });

        await scoreV3Certification(dependencies);

        expect(dependencies.certificationAssessmentHistoryRepository.save).to.have.been.called;
        expect(dependencies.assessmentResultRepository.save).not.to.have.been.called;
        expect(dependencies.sharedCompetenceMarkRepository.saveMany).not.to.have.been.called;
        expect(dependencies.certificationCourseRepository.update).not.to.have.been.called;
        expect(dependencies.complementaryCertificationCourseResultRepository.save).not.to.have.been.called;
      });
    });
  });
});

function _generateCertificationChallengeForChallenge({ discriminant, difficulty, id }) {
  return domainBuilder.certification.evaluation.buildChallengeCalibration({
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

function stubVersionApi() {
  const versionApi = {
    getById: sinon.stub(),
  };
  const version = domainBuilder.certification.configuration.buildVersion();
  versionApi.getById.resolves(version);

  return versionApi;
}
function stubServices({ hasPixPlusSubscription = false } = {}) {
  const services = {
    findCalibratedChallenges: sinon.stub(),
    handleV3CertificationScoring: sinon.stub(),
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
    coreAssessmentResult: !hasPixPlusSubscription
      ? domainBuilder.buildAssessmentResult({
          id: assessmentResultId,
          competenceMarks: [domainBuilder.buildCompetenceMark(assessmentResultId)],
        })
      : null,
    doubleCertificationScoring: null,
  };
  services.findCalibratedChallenges.resolves(object);
  services.handleV3CertificationScoring.returns(scoringObject);
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
    saveMany: sinon.stub(),
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

function stubSessionRepository({ isFinalized = false, isPublished = false }) {
  const sessionRepository = {
    getByCertificationCourseId: sinon.stub(),
  };
  const session = domainBuilder.certification.evaluation.buildSession({ isFinalized, isPublished });
  sessionRepository.getByCertificationCourseId.resolves(session);

  return sessionRepository;
}

function createDependencies(overrides = {}) {
  return {
    assessmentSheetRepository: stubAssessmentSheetRepository(),
    versionApi: stubVersionApi(),
    services: stubServices(),
    scoringConfigurationRepository: stubScoringConfigurationRepository(),
    certificationAssessmentHistoryRepository: stubCertificationAssessmentHistoryRepository(),
    assessmentResultRepository: stubAssessmentResultRepository(),
    certificationCourseRepository: stubCertificationCourseRepository(),
    sharedCompetenceMarkRepository: stubSharedCompetenceMarkRepository(),
    complementaryCertificationCourseResultRepository: stubComplementaryCertificationCourseResultRepository(),
    complementaryCertificationScoringCriteriaRepository: stubComplementaryCertificationScoringCriteriaRepository(),
    sessionRepository: stubSessionRepository({ isFinalized: true, isPublished: false }),
    ...overrides,
  };
}
