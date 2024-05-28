import { prescriberInformationsController } from '../../../../src/team/application/prescriber-informations.controller.js';
import { usecases } from '../../../../src/team/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Team | Application | Controller | prescriber-informations', function () {
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
      const response = await prescriberInformationsController.get(request, hFake, { prescriberSerializer });

      // then
      expect(response).to.be.equal('ok');
    });
  });
});
