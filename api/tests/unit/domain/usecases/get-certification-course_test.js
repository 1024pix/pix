const { expect, sinon } = require('../../../test-helper');
const getCertificationCourse = require('../../../../lib/domain/usecases/get-certification-course');

describe('Unit | UseCase | get-certification-course', () => {

  let certificationCourse;
  let certificationCourseRepository;

  beforeEach(() => {
    certificationCourse = {
      id: 'certification_course_id',
      userId: 'user_id',
    };
    certificationCourseRepository = {
      get: sinon.stub(),
    };
  });

  it('should get the certificationCourse', async () => {
    // given
    certificationCourseRepository.get.withArgs(certificationCourse.id).resolves(certificationCourse);

    // when
    const actualCertificationCourse = await getCertificationCourse({
      certificationCourseId: certificationCourse.id,
      userId: 'user_id',
      certificationCourseRepository,
    });

    // then
    expect(actualCertificationCourse.id).to.equal(certificationCourse.id);
  });

  it('should throw an error when the certification course is not linked to the user passed in parameter', () => {
    // given
    certificationCourseRepository.get.withArgs(certificationCourse.id).resolves(certificationCourse);

    // when
    const promise = getCertificationCourse({
      certificationCourseId: certificationCourse.id,
      userId: 'other_user_id',
      certificationCourseRepository,
    });

    // then
    return expect(promise).to.be.rejected;
  });

  it('should throw an error when the certification course could not be retrieved', () => {
    // given
    certificationCourseRepository.get.withArgs(certificationCourse.id).rejects();

    // when
    const promise = getCertificationCourse({
      certificationCourseId: certificationCourse.id,
      userId: 'other_user_id',
      certificationCourseRepository,
    });

    // then
    return expect(promise).to.be.rejected;
  });

});
