const { expect, sinon, catchErr } = require('../../../test-helper');
const findCertificationCourses = require('../../../../lib/domain/usecases/find-certification-courses');
const { UserNotAuthorizedToGetSessionCertificationCoursesError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-certification-courses', () => {

  const sessionId = 1;
  const certificationCenterId = 2;
  const userId = 3;
  let userRepository;
  let sessionRepository;
  let certificationCourseRepository;
  let user;

  beforeEach(() => {
    userRepository = {
      getWithCertificationCenterMemberships: sinon.stub(),
    };
    sessionRepository = {
      get: sinon.stub(),
    };
    certificationCourseRepository = {
      find: sinon.stub(),
    };
    user = {
      id: 1,
      hasAccessToCertificationCenter: sinon.stub(),
    };
  });

  it('should throw an unauthorized error', async () => {
    // given
    userRepository.getWithCertificationCenterMemberships.withArgs(userId).resolves(user);
    sessionRepository.get.withArgs(sessionId).resolves({ certificationCenterId });
    user.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(false);

    // when
    const error = await catchErr(findCertificationCourses)({ userId, sessionId, sessionRepository, certificationCourseRepository, userRepository });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToGetSessionCertificationCoursesError);
  });

  it('should find the certification courses of the given session', async () => {
    // given
    userRepository.getWithCertificationCenterMemberships.withArgs(userId).resolves(user);
    sessionRepository.get.withArgs(sessionId).resolves({ certificationCenterId });
    user.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(true);
    certificationCourseRepository.find.withArgs(sessionId).resolves([{ id: 1 }, { id: 2 }]);

    // when
    const result = await findCertificationCourses({ userId, sessionId, sessionRepository, certificationCourseRepository, userRepository });

    // then
    expect(result).to.deep.equal([{ id: 1 }, { id: 2 }]);
  });

});
