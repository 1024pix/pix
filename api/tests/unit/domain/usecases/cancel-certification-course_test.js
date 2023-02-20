import { expect, sinon, domainBuilder } from '../../../test-helper';
import cancelCertificationCourse from '../../../../lib/domain/usecases/cancel-certification-course';

describe('Unit | UseCase | cancel-certification-course', function () {
  it('should cancel the certification course', async function () {
    // given
    const certificationCourse = domainBuilder.buildCertificationCourse({ id: 123 });
    sinon.spy(certificationCourse, 'cancel');
    const certificationCourseRepository = {
      update: sinon.stub(),
      get: sinon.stub(),
    };
    certificationCourseRepository.get.withArgs(123).resolves(certificationCourse);
    certificationCourseRepository.update.resolves();

    // when
    await cancelCertificationCourse({
      certificationCourseId: 123,
      certificationCourseRepository,
    });

    // then
    expect(certificationCourse.cancel).to.have.been.calledOnce;
    expect(certificationCourseRepository.update).to.have.been.calledWith(certificationCourse);
  });
});
