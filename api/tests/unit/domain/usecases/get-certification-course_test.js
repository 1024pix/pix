const { expect, sinon } = require('../../../test-helper');
const getCertificationCourse = require('../../../../lib/domain/usecases/get-certification-course');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');

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
