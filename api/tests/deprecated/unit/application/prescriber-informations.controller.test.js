import sinon from 'sinon';

import { prescriberInformationsController } from '../../../../src/deprecated/application/prescriber-informations.controller.js';
import { usecases } from '../../../../src/deprecated/domain/usecases/index.js';
import { expect } from '../../../test-helper.js';
import { hFake } from '../../../tooling/mocks/hapi.mock.js';

describe('Deprecated | Unit | Application | Controller | prescriber-informations', function () {
  describe('#get', function () {
    it('should get the prescriber', async function () {
      // given
      sinon.stub(usecases, 'getPrescriber');
      usecases.getPrescriber.withArgs({ userId: 1 }).resolves({});
      const prescriberSerializer = { serialize: sinon.stub() };
      prescriberSerializer.serialize.withArgs({}).returns('ok');

      // when
      const request = { auth: { credentials: { userId: 1 } } };
      const response = await prescriberInformationsController.get(request, hFake, { prescriberSerializer });

      // then
      expect(response).to.be.equal('ok');
    });
  });
});
