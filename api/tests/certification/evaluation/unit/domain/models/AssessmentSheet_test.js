import { ABORT_REASONS } from '../../../../../../src/certification/evaluation/domain/models/AssessmentSheet.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Evaluation | Domain | Models | AssessmentSheet', function () {
  context('isAbortReasonTechnical', function () {
    it('should return false when abort reason is null', function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        abortReason: null,
      });
      expect(assessmentSheet.isAbortReasonTechnical).to.be.false;
    });
    it('should return true when abort reason is technical', function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        abortReason: ABORT_REASONS.TECHNICAL,
      });
      expect(assessmentSheet.isAbortReasonTechnical).to.be.true;
    });
    it('should return false when abort reason is not technical', function () {
      const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
        abortReason: ABORT_REASONS.CANDIDATE,
      });
      expect(assessmentSheet.isAbortReasonTechnical).to.be.false;
    });
  });
});
