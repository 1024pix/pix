import { getCertificationCourse } from '../../../../../../src/certification/evaluation/domain/usecases/get-certification-course.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-certification-course', function () {
  let certificationCourse;
  let candidate;
  let version;

  let sharedCertificationCandidateRepository;
  let certificationCourseRepository;
  let versionRepository;

  beforeEach(function () {
    certificationCourse = domainBuilder.buildCertificationCourse({
      id: 'certification_course_id',
      sessionId: 'session_id',
      userId: 'user_id',
      version: AlgorithmEngineVersion.V3,
    });

    candidate = domainBuilder.certification.evaluation.buildCandidate({
      reconciledAt: new Date('2024-01-15'),
    });

    sharedCertificationCandidateRepository = {
      getBySessionIdAndUserId: sinon.stub(),
    };

    certificationCourseRepository = {
      get: sinon.stub(),
      getCertificationScope: sinon.stub(),
    };

    versionRepository = {
      getByScopeAndReconciliationDate: sinon.stub(),
    };

    version = domainBuilder.certification.shared.buildVersion({
      challengesConfiguration: { maximumAssessmentLength: 42 },
    });
  });

  it('should get the certificationCourse with numberOfChallenges from version', async function () {
    certificationCourseRepository.get.withArgs({ id: certificationCourse.getId() }).resolves(certificationCourse);
    sharedCertificationCandidateRepository.getBySessionIdAndUserId.resolves(candidate);
    certificationCourseRepository.getCertificationScope.resolves(SCOPES.CORE);
    versionRepository.getByScopeAndReconciliationDate.resolves(version);

    const actualCertificationCourse = await getCertificationCourse({
      certificationCourseId: certificationCourse.getId(),
      sharedCertificationCandidateRepository,
      certificationCourseRepository,
      versionRepository,
    });

    expect(certificationCourseRepository.get).to.have.been.calledOnceWithExactly({
      id: certificationCourse.getId(),
    });
    expect(sharedCertificationCandidateRepository.getBySessionIdAndUserId).to.have.been.calledOnceWithExactly({
      sessionId: certificationCourse.getSessionId(),
      userId: certificationCourse.getUserId(),
    });
    expect(certificationCourseRepository.getCertificationScope).to.have.been.calledOnceWithExactly({
      courseId: certificationCourse.getId(),
    });
    expect(versionRepository.getByScopeAndReconciliationDate).to.have.been.calledOnceWithExactly({
      scope: SCOPES.CORE,
      reconciliationDate: candidate.reconciledAt,
    });
    expect(actualCertificationCourse.getNumberOfChallenges()).to.equal(42);
    expect(actualCertificationCourse.getId()).to.equal(certificationCourse.getId());
  });
});
