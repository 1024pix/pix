import { CertificationCourse } from '../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { getCertificationCourse } from '../../../../../../src/certification/shared/domain/usecases/get-certification-course.js';
import { expect, sinon } from '../../../../../test-helper.js';

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
    certificationCourseRepository.get.withArgs({ id: certificationCourse.getId() }).resolves(certificationCourse);

    // when
    const actualCertificationCourse = await getCertificationCourse({
      certificationCourseId: certificationCourse.getId(),
      certificationCourseRepository,
    });

    // then
    expect(actualCertificationCourse.getId()).to.equal(certificationCourse.getId());
  });
});
