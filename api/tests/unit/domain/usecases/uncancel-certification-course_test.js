import { expect, sinon, domainBuilder } from '../../../test-helper';
import uncancelCertificationCourse from '../../../../lib/domain/usecases/uncancel-certification-course';

describe('Unit | UseCase | uncancel-certification-course', function () {
  it('should uncancel the certification course', async function () {
    // given
    const certificationCourse = domainBuilder.buildCertificationCourse({ id: 123 });
    sinon.spy(certificationCourse, 'uncancel');
    const certificationCourseRepository = {
      update: sinon.stub(),
      get: sinon.stub(),
    };
    certificationCourseRepository.get.withArgs(123).resolves(certificationCourse);
    certificationCourseRepository.update.resolves();

    // when
    await uncancelCertificationCourse({
      certificationCourseId: 123,
      certificationCourseRepository,
    });

    // then
    expect(certificationCourse.uncancel).to.have.been.calledOnce;
    expect(certificationCourseRepository.update).to.have.been.calledWith(certificationCourse);
  });
});
