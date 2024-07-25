import { cancellationController } from '../../../../../src/certification/session-management/application/cancellation-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Session-management | Unit | Application | cancellation-controller', function () {
  describe('#cancelCertificationCourse', function () {
    it('should call cancel-certification-course usecase', async function () {
      // given
      sinon.stub(usecases, 'cancelCertificationCourse');
      const request = {
        params: {
          id: 123,
        },
      };
      usecases.cancelCertificationCourse.resolves();

      // when
      await cancellationController.cancel(request, hFake);

      // then
      expect(usecases.cancelCertificationCourse).to.have.been.calledWithExactly({ certificationCourseId: 123 });
    });
  });
});
