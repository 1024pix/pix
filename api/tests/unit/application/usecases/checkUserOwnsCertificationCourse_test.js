import { expect, sinon } from '../../../test-helper';
import usecase from '../../../../lib/application/usecases/checkUserOwnsCertificationCourse';
import certificationCourseRepository from '../../../../lib/infrastructure/repositories/certification-course-repository';
import sessionRepository from '../../../../lib/infrastructure/repositories/sessions/session-repository';

describe('Unit | Application | Use Case | checkUserOwnsCertificationCourse', function () {
  beforeEach(function () {
    sinon.stub(certificationCourseRepository, 'get');
    sinon.stub(sessionRepository, 'doesUserHaveCertificationCenterMembershipForSession');
  });

  context('When user is member of certification center session', function () {
    it('should return true', async function () {
      // given
      const userId = 7;
      const certificationCourseId = 1;
      const doesBelongToStub = sinon.stub();
      const certificationCourse = {
        doesBelongTo: doesBelongToStub.withArgs(userId).returns(true),
      };

      certificationCourseRepository.get.withArgs(certificationCourseId).resolves(certificationCourse);

      // when
      const response = await usecase.execute({ userId, certificationCourseId });

      // then
      expect(response).to.be.true;
    });
  });
});
