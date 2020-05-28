const { sinon, expect } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');
const prescriberSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/prescriber-serializer');

const prescriberController = require('../../../../lib/application/prescribers/prescriber-controller');

describe('Unit | Controller | prescriber-controller', () => {

  describe('#get', () => {

    let request;

    beforeEach(() => {
      request = { auth: { credentials: { userId: 1 } } };

      sinon.stub(usecases, 'getPrescriber');
      sinon.stub(prescriberSerializer, 'serialize');
    });

    it('should get the prescriber', async () => {
      // given
      usecases.getPrescriber.withArgs({ userId: 1 }).resolves({});
      prescriberSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await prescriberController.get(request);

      // then
      expect(response).to.be.equal('ok');
    });

  });
});
