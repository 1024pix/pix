import { endAssessmentBySupervisor } from '../../../../../../src/certification/course/domain/usecases/end-assessment-by-supervisor.js';
import { CertificationAssessment } from '../../../../../../src/certification/session-management/domain/models/CertificationAssessment.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | end-assessment-by-supervisor', function () {
  let certificationAssessmentRepository;

  beforeEach(function () {
    certificationAssessmentRepository = {
      getByCertificationCandidateId: sinon.stub(),
      save: sinon.stub(),
    };
  });

  context('when assessment is already completed', function () {
    it('should not end the assessment', async function () {
      // when
      const certificationCandidateId = domainBuilder.buildCertificationCandidate().id;
      const completedCertificationAssessment = domainBuilder.buildCertificationAssessment({
        state: CertificationAssessment.states.COMPLETED,
      });

      certificationAssessmentRepository.getByCertificationCandidateId
        .withArgs(certificationCandidateId)
        .resolves(completedCertificationAssessment);

      await endAssessmentBySupervisor({
        certificationCandidateId,
        certificationAssessmentRepository,
      });

      // then
      expect(certificationAssessmentRepository.save).not.to.have.been.called;
    });
  });

  context('when assessment is not completed', function () {
    it('should end the assessment', async function () {
      // when
      const certificationCandidateId = domainBuilder.buildCertificationCandidate().id;
      const startedCertificationAssessment = domainBuilder.buildCertificationAssessment({
        state: CertificationAssessment.states.STARTED,
      });

      certificationAssessmentRepository.getByCertificationCandidateId
        .withArgs(certificationCandidateId)
        .resolves(startedCertificationAssessment);

      await endAssessmentBySupervisor({
        certificationCandidateId,
        certificationAssessmentRepository,
      });

      // then
      expect(startedCertificationAssessment.endedAt).to.be.instanceOf(Date);
      expect(startedCertificationAssessment.state).to.equal(CertificationAssessment.states.ENDED_BY_SUPERVISOR);
      expect(certificationAssessmentRepository.save).to.have.been.calledWithExactly(startedCertificationAssessment);
    });
  });
});
