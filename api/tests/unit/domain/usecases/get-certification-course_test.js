import { expect, sinon } from '../../../test-helper';
import getCertificationCourse from '../../../../lib/domain/usecases/get-certification-course';
import CertificationCourse from '../../../../lib/domain/models/CertificationCourse';

describe('Unit | UseCase | get-certification-course', function () {
  let certificationCourse;
  let certificationCourseRepository;

  beforeEach(function () {
    certificationCourse = new CertificationCourse({
      id: 'certification_course_id',
    });
    certificationCourseRepository = {
      get: sinon.stub(),
    };
  });

  it('should get the certificationCourse', async function () {
    // given
    certificationCourseRepository.get.withArgs(certificationCourse.getId()).resolves(certificationCourse);

    // when
    const actualCertificationCourse = await getCertificationCourse({
      certificationCourseId: certificationCourse.getId(),
      certificationCourseRepository,
    });

    // then
    expect(actualCertificationCourse.getId()).to.equal(certificationCourse.getId());
  });
});
