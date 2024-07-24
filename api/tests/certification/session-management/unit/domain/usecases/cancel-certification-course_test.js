import { cancelCertificationCourse } from '../../../../../../src/certification/session-management/domain/usecases/cancel-certification-course.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Session-management | Unit | Domain | UseCases | cancel-certification-course', function () {
  it('should cancel the certification course', async function () {
    // given
    const certificationCourse = domainBuilder.buildCertificationCourse({ id: 123 });
    sinon.spy(certificationCourse, 'cancel');
    const certificationCourseRepository = {
      update: sinon.stub(),
      get: sinon.stub(),
    };
    certificationCourseRepository.get.withArgs({ id: 123 }).resolves(certificationCourse);
    certificationCourseRepository.update.resolves();

    // when
    await cancelCertificationCourse({
      certificationCourseId: 123,
      certificationCourseRepository,
    });

    // then
    expect(certificationCourse.cancel).to.have.been.calledOnce;
    expect(certificationCourseRepository.update).to.have.been.calledWithExactly({ certificationCourse });
  });
});
