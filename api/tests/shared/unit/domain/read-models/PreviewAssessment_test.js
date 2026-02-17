import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { PreviewAssessment } from '../../../../../src/shared/domain/read-models/PreviewAssessment.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Read-Models | PreviewAssessment', function () {
  describe('#constructor', function () {
    let assessment;
    before(function () {
      assessment = new PreviewAssessment({});
    });

    it('should be of type PREVIEW', function () {
      expect(assessment.type).to.equal(Assessment.types.PREVIEW);
    });

    it('should have method of type CHOSEN', function () {
      expect(assessment.method).to.equal(Assessment.methods.CHOSEN);
    });

    it('should init showChallengeStepper', function () {
      expect(assessment.showChallengeStepper).to.equal(false);
    });

    it('should init showGlobalProgression', function () {
      expect(assessment.showGlobalProgression).to.equal(false);
    });

    it('should init hasCheckpoints', function () {
      expect(assessment.hasCheckpoints).to.equal(false);
    });

    it('should init showLevelup', function () {
      expect(assessment.showLevelup).to.equal(false);
    });

    it('should init showQuestionCounter', function () {
      expect(assessment.showQuestionCounter).to.equal(true);
    });

    it('should init title', function () {
      expect(assessment.title).to.equal('Preview');
    });
  });
});
