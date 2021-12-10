const _ = require('lodash');
const { expect, sinon, domainBuilder } = require('../../../test-helper');
const endAssessmentBySupervisor = require('../../../../lib/domain/usecases/end-assessment-by-supervisor');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | UseCase | end-by-supervisor-assessment', function () {
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
      const completedAssessment = _buildCertificationAssessment({ state: 'completed' });
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
      const assessment = _buildCertificationAssessment({ state: 'started' });
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

function _buildCertificationAssessment({ state }) {
  return domainBuilder.buildAssessment({
    id: Symbol('assessmentId'),
    certificationCourseId: Symbol('certificationCourseId'),
    state,
    type: Assessment.types.CERTIFICATION,
  });
}
