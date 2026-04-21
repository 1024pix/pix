import { DetachedAssessment } from '../../../../../../src/prescription/campaign-participation/domain/read-models/DetachedAssessment.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';

describe('Unit | Domain | Read-Models | DetachAssessment', function () {
  describe('constructor', function () {
    it('should correctly initialize the information about Detach assessment', function () {
      const updatedAt = new Date('2012-01-01');
      const assessment = new DetachedAssessment({
        id: 1,
        updatedAt,
        state: Assessment.states.COMPLETED,
      });

      expect(assessment.id).equal(1);
      expect(assessment.updatedAt).equal(updatedAt);
      expect(assessment.state).equal(Assessment.states.COMPLETED);
    });
  });
});
