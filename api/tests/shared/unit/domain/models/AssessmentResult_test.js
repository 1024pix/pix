import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { AssessmentResult } from '../../../../../src/shared/domain/models/AssessmentResult.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Domain | Models | AssessmentResult', function () {
  describe('#buildStartedAssessmentResult', function () {
    it('should return a started AssessmentResult', function () {
      // when
      const actualAssessmentResult = AssessmentResult.buildStartedAssessmentResult({ assessmentId: 123 });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        assessmentId: 123,
        status: Assessment.states.STARTED,
        competenceMarks: [],
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.commentForCandidate = undefined;
      expectedAssessmentResult.commentForOrganization = undefined;
      expectedAssessmentResult.commentByJury = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expectedAssessmentResult.juryId = undefined;
      expectedAssessmentResult.pixScore = undefined;
      expectedAssessmentResult.reproducibilityRate = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });

  describe('#isValidated', function () {
    it('should return true if the assessment result is validated', function () {
      // given
      const assessmentResult = domainBuilder.buildAssessmentResult.validated();

      // when
      const isValidated = assessmentResult.isValidated();

      // then
      expect(isValidated).to.be.true;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [AssessmentResult.status.CANCELLED, AssessmentResult.status.REJECTED, AssessmentResult.status.ERROR].forEach(
      (assessmentResultStatus) => {
        it(`should return false if the assessment result is ${assessmentResultStatus}`, function () {
          // given
          const assessmentResult = domainBuilder.buildAssessmentResult();
          assessmentResult.status = assessmentResultStatus;

          // when
          const isValidated = assessmentResult.isValidated();

          // then
          expect(isValidated).to.be.false;
        });
      },
    );
  });
});
