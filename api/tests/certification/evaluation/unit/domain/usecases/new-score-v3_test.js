import { scoreV3Certification } from '../../../../../../src/certification/evaluation/domain/usecases/new-score-v3.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Evaluation | Integration | Domain | UseCase | New Score V3', function () {
  context('#scoreV3Certification', function () {
    context('CLEA certificaiton', function () {
      it('should create and persist an AssessmentResult', async function () {
        const assessmentSheetRepository = stubAssessmentSheetRepository();
        const certificationCandidateRepository = stubCertificationCandidateRepository();
        const sharedVersionRepository = stubSharedVersionRepository();
        const services = stubServices();
        const scoringConfigurationRepository = stubScoringConfigurationRepository();
        const certificationAssessmentHistoryRepository = stubCertificationAssessmentHistoryRepository();
        const assessmentResultRepository = stubAssessmentResultRepository();
        const certificationCourseRepository = stubCertificationCourseRepository();
        const complementaryCertificationCourseResultRepository = stubComplementaryCertificationCourseResultRepository();

        await scoreV3Certification({
          assessmentSheetRepository,
          certificationCandidateRepository,
          sharedVersionRepository,
          services,
          scoringConfigurationRepository,
          certificationAssessmentHistoryRepository,
          assessmentResultRepository,
          certificationCourseRepository,
          complementaryCertificationCourseResultRepository,
        });

        expect(assessmentResultRepository.save).to.have.been.called;
      });
    });
  });
});

function stubAssessmentSheetRepository() {
  const assessmentSheetRepository = {
    findByCertificationCourseId: sinon.stub().rejects(new Error('Args mismatch')),
  };
  const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet();
  assessmentSheetRepository.findByCertificationCourseId.resolves(assessmentSheet);

  return assessmentSheetRepository;
}

function stubCertificationCandidateRepository() {
  const certificationCandidateRepository = {
    findByAssessmentId: sinon.stub().rejects(new Error('Args mismatch')),
  };
  const candidate = domainBuilder.certification.evaluation.buildCandidate();
  certificationCandidateRepository.findByAssessmentId.resolves(candidate);

  return certificationCandidateRepository;
}

function stubSharedVersionRepository() {
  const sharedVersionRepository = {
    getByScopeAndReconciliationDate: sinon.stub().rejects(new Error('Args mismatch')),
  };
  const version = domainBuilder.certification.shared.buildVersion();
  sharedVersionRepository.getByScopeAndReconciliationDate.resolves(version);

  return sharedVersionRepository;
}

function stubServices() {
  const services = {
    findByCertificationCourseAndVersion: sinon.stub(),
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
  const scoringObject = {
    coreScoring: {
      certificationAssessmentScore: domainBuilder.buildCertificationAssessmentScore(),
      assessmentResult: domainBuilder.buildAssessmentResult(),
    },
    doubleCertificationScoring: domainBuilder.certification.evaluation.buildDoubleCertificationScoring(),
  };
  services.findByCertificationCourseAndVersion.resolves(object);
  services.handleV3CertificationScoring.returns(scoringObject);
  services.flashAlgorithmService.getCapacityAndErrorRateHistory.returns([]);

  return services;
}

function stubScoringConfigurationRepository() {
  const scoringConfigurationRepository = {
    getLatestByVersionAndLocale: sinon.stub().rejects(new Error('Args mismatch')),
  };
  const v3CertificationScoring = domainBuilder.buildV3CertificationScoring();
  scoringConfigurationRepository.getLatestByVersionAndLocale.resolves(v3CertificationScoring);

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

function stubComplementaryCertificationCourseResultRepository() {
  const complementaryCertificationCourseResultRepository = {
    save: sinon.stub(),
  };
  return complementaryCertificationCourseResultRepository;
}
