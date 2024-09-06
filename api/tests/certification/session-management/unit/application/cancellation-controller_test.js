import { cancellationController } from '../../../../../src/certification/session-management/application/cancellation-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Session-management | Unit | Application | Controller | cancellation', function () {
  describe('#cancel', function () {
    it('should call cancel-certification-course usecase', async function () {
      // given
      sinon.stub(usecases, 'cancelCertificationCourse');
      const request = {
        params: {
          certificationCourseId: 123,
        },
      };
      usecases.cancelCertificationCourse.resolves();

      // when
      await cancellationController.cancel(request, hFake);

      // then
      expect(usecases.cancelCertificationCourse).to.have.been.calledWithExactly({ certificationCourseId: 123 });
    });
  });

  describe('#uncancelCertificationCourse', function () {
    it('should call uncancel-certification-course usecase', async function () {
      // given
      sinon.stub(usecases, 'uncancelCertificationCourse');
      const request = {
        params: {
          certificationCourseId: 123,
        },
      };
      usecases.uncancelCertificationCourse.resolves();

      // when
      await cancellationController.uncancel(request, hFake);

      // then
      expect(usecases.uncancelCertificationCourse).to.have.been.calledWithExactly({ certificationCourseId: 123 });
    });
  });
});
