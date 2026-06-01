import { AssessmentResultNotRejectedError } from '../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { AssessmentResult } from '../../../../../src/shared/domain/models/AssessmentResult.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErrSync } from '../../../../tooling/test-utils/error.js';

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
        capacity: null,
        reachedMeshIndex: null,
        versionId: null,
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

  describe('#unreject', function () {
    it('should set status to validated and assign the jury id when status is rejected', function () {
      // given
      const assessmentResult = domainBuilder.buildAssessmentResult({
        status: AssessmentResult.status.REJECTED,
        juryId: 456,
      });

      // when
      assessmentResult.unreject({ juryId: 123 });

      // then
      expect(assessmentResult.status).to.equal(AssessmentResult.status.VALIDATED);
      expect(assessmentResult.juryId).to.equal(123);
    });

    [AssessmentResult.status.VALIDATED, AssessmentResult.status.CANCELLED, AssessmentResult.status.ERROR].forEach(
      (assessmentResultStatus) => {
        it(`should throw AssessmentResultNotRejectedError when status is ${assessmentResultStatus}`, function () {
          // given
          const assessmentResult = domainBuilder.buildAssessmentResult({
            status: assessmentResultStatus,
            juryId: 456,
          });

          // when
          const error = catchErrSync(() => assessmentResult.unreject({ juryId: 123 }))();

          // then
          expect(error).to.be.instanceOf(AssessmentResultNotRejectedError);
          expect(assessmentResult.status).to.equal(assessmentResultStatus);
          expect(assessmentResult.juryId).to.equal(456);
        });
      },
    );
  });
});
