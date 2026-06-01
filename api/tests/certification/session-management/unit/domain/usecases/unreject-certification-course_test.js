import sinon from 'sinon';

import { unrejectCertificationCourse } from '../../../../../../src/certification/session-management/domain/usecases/unreject-certification-course.js';
import { CertificationCourse } from '../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCase | unreject-certification-course', function () {
  it('should unreject a rejected certification course without re-scoring', async function () {
    // given
    const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };
    const assessmentResultRepository = {
      getByCertificationCourseId: sinon.stub(),
      save: sinon.stub(),
    };
    const juryId = 123;

    const dependencies = {
      certificationCourseRepository,
      assessmentResultRepository,
    };
    const certificationCourse = domainBuilder.buildCertificationCourse({
      isRejectedForFraud: true,
    });
    const certificationCourseId = certificationCourse.getId();

    certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);
    certificationCourseRepository.update.resolves();

    const rejectedAssessmentResult = domainBuilder.buildAssessmentResult({
      status: AssessmentResult.status.REJECTED,
      juryId: 456,
    });
    assessmentResultRepository.getByCertificationCourseId.resolves(rejectedAssessmentResult);

    // when
    await unrejectCertificationCourse({
      ...dependencies,
      juryId,
      certificationCourseId: certificationCourseId,
    });

    // then
    const expectedCertificationCourse = new CertificationCourse({
      ...certificationCourse.toDTO(),
      isRejectedForFraud: false,
    });

    expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
      certificationCourse: expectedCertificationCourse,
    });
    expect(assessmentResultRepository.save).to.have.been.calledOnceWithExactly({
      certificationCourseId,
      assessmentResult: new AssessmentResult({
        ...rejectedAssessmentResult,
        status: AssessmentResult.status.VALIDATED,
        juryId,
        id: undefined,
        createdAt: undefined,
      }),
    });
  });
});
