import { companionController } from '../../../../../src/certification/enrolment/application/companion-controller.js';
import { usecases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | companion-controller', function () {
  describe('#savePing', function () {
    it('should call the use case with the user id and return 204', async function () {
      // given
      const userId = 456;
      sinon.stub(usecases, 'saveCompanionPing').withArgs({ userId }).resolves();

      // when
      const response = await companionController.savePing(
        {
          auth: {
            credentials: { userId },
          },
        },
        hFake,
      );

      // then
      expect(response.statusCode).to.equal(204);
      expect(usecases.saveCompanionPing).to.have.been.calledWith({ userId });
    });
  });
});
