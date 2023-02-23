const { sinon, expect } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases/index.js');
const prescriberSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/prescriber-serializer');

const prescriberController = require('../../../../lib/application/prescribers/prescriber-controller');

describe('Unit | Controller | prescriber-controller', function () {
  describe('#get', function () {
    let request;

    beforeEach(function () {
      request = { auth: { credentials: { userId: 1 } } };

      sinon.stub(usecases, 'getPrescriber');
      sinon.stub(prescriberSerializer, 'serialize');
    });

    it('should get the prescriber', async function () {
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
