import { sinon, expect, hFake } from '../../../../test-helper.js';
import { usecases } from '../../../../../src/shared/prescriber-management/domain/usecases/index.js';
import { prescriberController } from '../../../../../src/shared/prescriber-management/application/prescriber-informations-controller.js';

describe('Unit | Controller | prescriber-informations-controller', function () {
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
