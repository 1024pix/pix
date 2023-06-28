import { sinon, expect, hFake } from '../../../test-helper.js';
import { usecases } from '../../../../lib/shared/domain/usecases/index.js';
import { prescriberController } from '../../../../lib/shared/application/prescribers/prescriber-controller.js';

describe('Unit | Controller | prescriber-controller', function () {
  describe('#get', function () {
    let request;

    beforeEach(function () {
      request = { auth: { credentials: { userId: 1 } } };

      sinon.stub(usecases, 'getPrescriber');
    });

    it('should get the prescriber', async function () {
      // given
      const prescriberSerializer = {
        serialize: sinon.stub(),
      };
      usecases.getPrescriber.withArgs({ userId: 1 }).resolves({});
      prescriberSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await prescriberController.get(request, hFake, { prescriberSerializer });

      // then
      expect(response).to.be.equal('ok');
    });
  });
});
