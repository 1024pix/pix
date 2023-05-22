import { expect, sinon } from '../../../test-helper.js';
import { usecase } from '../../../../lib/application/usecases/checkUserOwnsCertificationCourse.js';

describe('Unit | Application | Use Case | checkUserOwnsCertificationCourse', function () {
  context('When user is member of certification center session', function () {
    it('should return true', async function () {
      // given
      const userId = 7;
      const certificationCourseId = 1;
      const doesBelongToStub = sinon.stub();
      const certificationCourseBookshelfStub = {
        doesBelongTo: doesBelongToStub.withArgs(userId).returns(true),
      };

      const certificationCourseRepositoryStub = {
        get: sinon.stub(),
      };

      certificationCourseRepositoryStub.get.withArgs(certificationCourseId).resolves(certificationCourseBookshelfStub);

      // when
      const response = await usecase.execute({
        userId,
        certificationCourseId,
        dependencies: { certificationCourseRepository: certificationCourseRepositoryStub },
      });

      // then
      expect(response).to.be.true;
    });
  });
});
