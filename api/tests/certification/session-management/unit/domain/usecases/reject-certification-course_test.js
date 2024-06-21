import { CertificationCourseRejected } from '../../../../../../lib/domain/events/CertificationCourseRejected.js';
import { rejectCertificationCourse } from '../../../../../../src/certification/session-management/domain/usecases/reject-certification-course.js';
import { CertificationCourse } from '../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | reject-certification-course', function () {
  it('should reject a newly created assessment result', async function () {
    // given
    const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };
    const juryId = 123;

    const dependencies = {
      certificationCourseRepository,
    };
    const certificationCourse = domainBuilder.buildCertificationCourse();
    const certificationCourseId = certificationCourse.getId();

    certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);
    certificationCourseRepository.update.resolves();

    // when
    const event = await rejectCertificationCourse({
      ...dependencies,
      juryId,
      certificationCourseId: certificationCourseId,
    });

    // then
    const expectedCertificationCourse = new CertificationCourse({
      ...certificationCourse.toDTO(),
      isRejectedForFraud: true,
    });

    expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
      certificationCourse: expectedCertificationCourse,
    });
    expect(event).to.be.instanceOf(CertificationCourseRejected);
    expect(event).to.deep.equal(
      new CertificationCourseRejected({
        certificationCourseId,
        juryId,
      }),
    );
  });
});
