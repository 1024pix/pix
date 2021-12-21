const _ = require('lodash');
const { expect, sinon, domainBuilder } = require('../../../test-helper');
const endAssessmentBySupervisor = require('../../../../lib/domain/usecases/end-assessment-by-supervisor');

describe('Unit | UseCase | end-assessment-by-supervisor', function () {
  let assessmentRepository;

  beforeEach(function () {
    assessmentRepository = {
      get: _.noop,
      endBySupervisorByAssessmentId: _.noop,
    };
  });

  context('when assessment is already completed', function () {
    it('should not end the assessment', async function () {
      // when
      const completedAssessment = domainBuilder.buildAssessment.ofTypeCertification({ state: 'completed' });
      sinon.stub(assessmentRepository, 'endBySupervisorByAssessmentId').resolves();
      sinon.stub(assessmentRepository, 'get').withArgs(completedAssessment.id).resolves(completedAssessment);

      await endAssessmentBySupervisor({
        assessmentId: completedAssessment.id,
        assessmentRepository,
      });

      // then
      expect(assessmentRepository.endBySupervisorByAssessmentId).not.to.have.been.called;
    });
  });

  context('when assessment is not completed', function () {
    it('should end the assessment', async function () {
      // when
      const assessment = domainBuilder.buildAssessment.ofTypeCertification({ state: 'started' });
      sinon.stub(assessmentRepository, 'endBySupervisorByAssessmentId').resolves();
      sinon.stub(assessmentRepository, 'get').withArgs(assessment.id).resolves(assessment);

      await endAssessmentBySupervisor({
        assessmentId: assessment.id,
        assessmentRepository,
      });

      // then
      expect(assessmentRepository.endBySupervisorByAssessmentId).to.have.been.calledWithExactly(assessment.id);
    });
  });
});
