import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { CompetenceEvaluationAssessment } from '../../../../../src/shared/domain/read-models/CompetenceEvaluationAssessment.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Read-Models | CompetenceEvaluationAssessment', function () {
  describe('#constructor', function () {
    let assessment;
    before(function () {
      assessment = new CompetenceEvaluationAssessment({ title: 'Ma Compétence' });
    });

    it('should be of type COMPETENCE_EVALUATION', function () {
      expect(assessment.type).to.equal(Assessment.types.COMPETENCE_EVALUATION);
    });

    it('should have method of type SMART_RANDOM', function () {
      expect(assessment.method).to.equal(Assessment.methods.SMART_RANDOM);
    });

    it('should init showChallengeStepper', function () {
      expect(assessment.showChallengeStepper).to.equal(true);
    });

    it('should init showGlobalProgression', function () {
        expect(assessment.showGlobalProgression).to.equal(false);
    });

    it('should init hasCheckpoints', function () {
      expect(assessment.hasCheckpoints).to.equal(true);
    });

    it('should init showLevelup', function () {
      expect(assessment.showLevelup).to.equal(true);
    });

    it('should init showQuestionCounter', function () {
      expect(assessment.showQuestionCounter).to.equal(true);
    });

    it('should init title', function () {
      expect(assessment.title).to.equal('Ma Compétence');
    });
  });
});
