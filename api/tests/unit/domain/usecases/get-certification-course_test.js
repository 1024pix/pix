const { expect, sinon } = require('../../../test-helper');
const getCertificationCourse = require('../../../../lib/domain/usecases/get-certification-course');

describe('Unit | UseCase | get-certification-course', () => {

  let certificationCourse;
  let certificationCourseRepository;
  let userRepository;

  beforeEach(() => {
    certificationCourse = {
      id: 'certification_course_id',
      userId: 'user_id',
    };
    certificationCourseRepository = {
      get: sinon.stub(),
    };
    userRepository = {
      isPixMaster: sinon.stub(),
    };
  });

  it('should get the certificationCourse when the user id matches the certification course user id', async () => {
    // given
    certificationCourseRepository.get.withArgs(certificationCourse.id).resolves(certificationCourse);

    // when
    const actualCertificationCourse = await getCertificationCourse({
      certificationCourseId: certificationCourse.id,
      userId: 'user_id',
      certificationCourseRepository,
      userRepository,
    });

    // then
    expect(actualCertificationCourse.id).to.equal(certificationCourse.id);
  });

  it('should get the certificationCourse when the user id does not match the certification course user id but is pix master', async () => {
    // given
    certificationCourseRepository.get.withArgs(certificationCourse.id).resolves(certificationCourse);
    userRepository.isPixMaster.withArgs('pix_master_user_id').resolves(true);

    // when
    const actualCertificationCourse = await getCertificationCourse({
      certificationCourseId: certificationCourse.id,
      userId: 'pix_master_user_id',
      certificationCourseRepository,
      userRepository,
    });

    // then
    expect(actualCertificationCourse.id).to.equal(certificationCourse.id);
  });

  it('should throw an error when the certification course is not linked to the user passed in parameter and user is not pix master', () => {
    // given
    certificationCourseRepository.get.withArgs(certificationCourse.id).resolves(certificationCourse);
    userRepository.isPixMaster.withArgs('other_user_id').resolves(false);

    // when
    const promise = getCertificationCourse({
      certificationCourseId: certificationCourse.id,
      userId: 'other_user_id',
      certificationCourseRepository,
      userRepository,
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
      userRepository,
    });

    // then
    return expect(promise).to.be.rejected;
  });

});
