import sinon from 'sinon';

import { findUserCertificationCourses } from '../../../../../../src/certification/results/domain/usecases/find-user-certification-courses.js';

describe('Unit | Certification | Results | UseCases | find-user-certification-courses', function () {
  it('should call findAllByUserId repository method', async function () {
    // given
    const userId = Symbol('userId');

    const sharedCertificationCourseRepository = {
      findAllByUserId: sinon.stub(),
    };

    // when
    await findUserCertificationCourses({
      userId,
      sharedCertificationCourseRepository,
    });

    // then
    expect(sharedCertificationCourseRepository.findAllByUserId.calledOnceWithExactly({ userId })).to.be.true;
  });
});
