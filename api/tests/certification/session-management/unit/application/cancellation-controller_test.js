import sinon from 'sinon';

import { cancellationController } from '../../../../../src/certification/session-management/application/cancellation-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Certification | Session-management | Unit | Application | Controller | cancellation', function () {
  describe('#cancel', function () {
    it('should call cancel usecase', async function () {
      // given
      sinon.stub(usecases, 'cancel');
      const request = {
        auth: {
          credentials: {
            userId: 345,
          },
        },
        params: {
          certificationCourseId: 123,
        },
      };
      usecases.cancel.resolves();

      // when
      await cancellationController.cancel(request, hFake);

      // then
      expect(usecases.cancel).to.have.been.calledWithExactly({
        certificationCourseId: 123,
        juryId: 345,
      });
    });
  });

  describe('#uncancel', function () {
    it('should call uncancel usecase', async function () {
      // given
      sinon.stub(usecases, 'uncancel');
      const request = {
        auth: {
          credentials: {
            userId: 345,
          },
        },
        params: {
          certificationCourseId: 123,
        },
      };
      usecases.uncancel.resolves();

      // when
      await cancellationController.uncancel(request, hFake);

      // then
      expect(usecases.uncancel).to.have.been.calledWithExactly({ certificationCourseId: 123, juryId: 345 });
    });
  });
});
