import { expect, sinon, domainBuilder } from '../../../../../test-helper.js';
import { CertificationCourse } from '../../../../../../lib/domain/models/index.js';
import { CertificationCourseUnrejected } from '../../../../../../lib/domain/events/CertificationCourseUnrejected.js';
import { unrejectCertificationCourse } from '../../../../../../src/certification/course/domain/usecases/unreject-certification-course.js';

describe('Unit | UseCase | unreject-certification-course', function () {
  it('should unreject a rejected certification course', async function () {
    // given
    const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };
    const juryId = 123;

    const dependencies = {
      certificationCourseRepository,
    };
    const certificationCourse = domainBuilder.buildCertificationCourse({
      isRejectedForFraud: true,
    });
    const certificationCourseId = certificationCourse.getId();

    certificationCourseRepository.get.withArgs(certificationCourse.getId()).resolves(certificationCourse);
    certificationCourseRepository.update.resolves();

    // when
    const event = await unrejectCertificationCourse({
      ...dependencies,
      juryId,
      certificationCourseId: certificationCourseId,
    });

    // then
    const expectedCertificationCourse = new CertificationCourse({
      ...certificationCourse.toDTO(),
      isRejectedForFraud: false,
    });

    expect(certificationCourseRepository.update).to.have.been.calledWithExactly(expectedCertificationCourse);
    expect(event).to.be.instanceOf(CertificationCourseUnrejected);
    expect(event).to.deep.equal(
      new CertificationCourseUnrejected({
        certificationCourseId,
        juryId,
      }),
    );
  });
});
