const { expect, sinon, domainBuilder } = require('../../../test-helper');
const cancelCertificationCourse = require('../../../../lib/domain/usecases/cancel-certification-course');

describe('Unit | UseCase | cancel-certification-course', () => {

  it('should update certification course cancelled status', async () => {
    // given
    const certificationCourse = domainBuilder.buildCertificationCourse({ id: 123, isCancelled: false });
    const cancelledCertificationCourse = domainBuilder.buildCertificationCourse({ id: 123, isCancelled: true });

    const certificationCourseRepository = {
      update: sinon.stub(),
      get: sinon.stub(),
    };

    certificationCourseRepository.get.withArgs(123).resolves(certificationCourse);
    certificationCourseRepository.update.resolves(cancelledCertificationCourse);

    // when
    const actualCertificationCourse = await cancelCertificationCourse({
      certificationCourseId: 123,
      certificationCourseRepository,
    });

    // then
    expect(actualCertificationCourse.isCancelled()).to.be.true;
    expect(certificationCourseRepository.update).to.have.been.calledWith(certificationCourse);
  });

  it('should not cancel an already cancelled certification course', async () => {
    // given
    const certificationCourse = domainBuilder.buildCertificationCourse({ id: 123, isCancelled: false });
    const cancelledCertificationCourse = domainBuilder.buildCertificationCourse({ id: 123, isCancelled: true });

    const certificationCourseRepository = {
      update: sinon.stub(),
      get: sinon.stub(),
    };

    certificationCourseRepository.get.withArgs(123).resolves(certificationCourse);
    certificationCourseRepository.update.resolves(cancelledCertificationCourse);

    // when
    await cancelCertificationCourse({
      certificationCourseId: 123,
      certificationCourseRepository,
    });

    const actualCertificationCourse = await cancelCertificationCourse({
      certificationCourseId: 123,
      certificationCourseRepository,
    });

    // then
    expect(actualCertificationCourse.isCancelled()).to.be.true;
  });
});
