import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { DemoAssessment } from '../../../../../src/shared/domain/read-models/DemoAssessment.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Read-Models | DemoAssessment', function () {
  describe('#constructor', function () {
    let assessment;
    before(function () {
      assessment = new DemoAssessment({ title: 'Mon Course' });
    });

    it('should be of type DEMO', function () {
      expect(assessment.type).to.equal(Assessment.types.DEMO);
    });

    it('should have method of type COURSE_DETERMINED', function () {
      expect(assessment.method).to.equal(Assessment.methods.COURSE_DETERMINED);
    });

    it('should init showChallengeStepper', function () {
      expect(assessment.showChallengeStepper).to.equal(true);
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
      expect(assessment.title).to.equal('Mon Course');
    });
  });
});
