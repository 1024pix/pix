import sinon from 'sinon';

import { uncancel } from '../../../../../../src/certification/session-management/domain/usecases/uncancel.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Session-management | Unit | Domain | UseCases | uncancel', function () {
  describe('when certification is cancelled', function () {
    it('should uncancel the certification without re-scoring', async function () {
      // given
      const assessmentResultRepository = {
        getByCertificationCourseId: sinon.stub(),
        save: sinon.stub(),
      };
      const juryId = 123;

      const dependencies = { assessmentResultRepository };

      const canceledAssessmentResult = domainBuilder.buildAssessmentResult({
        status: AssessmentResult.status.CANCELLED,
        juryId: 456,
      });
      assessmentResultRepository.getByCertificationCourseId.resolves(canceledAssessmentResult);

      // when
      await uncancel({
        ...dependencies,
        certificationCourseId: 123,
        juryId,
      });

      // then
      expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
        certificationCourseId: 123,
        assessmentResult: new AssessmentResult({
          ...canceledAssessmentResult,
          status: AssessmentResult.status.VALIDATED,
          juryId,
          id: undefined,
          createdAt: undefined,
        }),
      });
    });
  });
});
