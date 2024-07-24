import { uncancelCertificationCourse } from '../../../../../../src/certification/session-management/domain/usecases/uncancel-certification-course.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Session-management | Unit | Domain | UseCases | uncancel-certification-course', function () {
  it('should uncancel the certification course', async function () {
    // given
    const certificationCourse = domainBuilder.buildCertificationCourse({ id: 123 });
    sinon.spy(certificationCourse, 'uncancel');
    const certificationCourseRepository = {
      update: sinon.stub(),
      get: sinon.stub(),
    };
    certificationCourseRepository.get.withArgs({ id: 123 }).resolves(certificationCourse);
    certificationCourseRepository.update.resolves();

    // when
    await uncancelCertificationCourse({
      certificationCourseId: 123,
      certificationCourseRepository,
    });

    // then
    expect(certificationCourse.uncancel).to.have.been.calledOnce;
    expect(certificationCourseRepository.update).to.have.been.calledWithExactly({ certificationCourse });
  });
});
