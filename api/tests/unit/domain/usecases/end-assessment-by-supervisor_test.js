import _ from 'lodash';
import { expect, sinon, domainBuilder } from '../../../test-helper';
import endAssessmentBySupervisor from '../../../../lib/domain/usecases/end-assessment-by-supervisor';

describe('Unit | UseCase | end-assessment-by-supervisor', function () {
  let assessmentRepository;

  beforeEach(function () {
    assessmentRepository = {
      getByCertificationCandidateId: _.noop,
      endBySupervisorByAssessmentId: _.noop,
    };
  });

  context('when assessment is already completed', function () {
    it('should not end the assessment', async function () {
      // when
      const completedAssessment = domainBuilder.buildAssessment.ofTypeCertification({ state: 'completed' });
      const certificationCandidateId = domainBuilder.buildCertificationCandidate().id;
      sinon.stub(assessmentRepository, 'endBySupervisorByAssessmentId').resolves();
      sinon
        .stub(assessmentRepository, 'getByCertificationCandidateId')
        .withArgs(certificationCandidateId)
        .resolves(completedAssessment);

      await endAssessmentBySupervisor({
        certificationCandidateId,
        assessmentRepository,
      });

      // then
      expect(assessmentRepository.endBySupervisorByAssessmentId).not.to.have.been.called;
    });
  });

  context('when assessment is not completed', function () {
    it('should end the assessment', async function () {
      // when
      const assessment = domainBuilder.buildAssessment.ofTypeCertification({ state: 'started', userId: 123 });
      const certificationCandidateId = domainBuilder.buildCertificationCandidate({ userId: 123 }).id;
      sinon.stub(assessmentRepository, 'endBySupervisorByAssessmentId').resolves();
      sinon
        .stub(assessmentRepository, 'getByCertificationCandidateId')
        .withArgs(certificationCandidateId)
        .resolves(assessment);

      await endAssessmentBySupervisor({
        certificationCandidateId,
        assessmentRepository,
      });

      // then
      expect(assessmentRepository.endBySupervisorByAssessmentId).to.have.been.calledWithExactly(assessment.id);
    });
  });
});
