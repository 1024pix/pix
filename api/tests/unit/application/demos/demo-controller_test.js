const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');

const demoController = require('../../../../lib/application/demos/demo-controller');
const Demo = require('../../../../lib/domain/models/Demo');
const usecases = require('../../../../lib/domain/usecases');
const demoSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/demo-serializer');

describe('Unit | Controller | demo-controller', () => {

  let server;

  beforeEach(() => {
    sinon.stub(usecases, 'getDemo');
    sinon.stub(demoSerializer, 'serialize');

    server = this.server = Hapi.server();
    return server.register(require('../../../../lib/application/demos'));
  });

  describe('#get', () => {

    let demo;

    beforeEach(() => {
      demo = new Demo({ 'id': 'demo_id' });
    });

    it('should fetch and return the given demo, serialized as JSONAPI', async () => {
      // given
      usecases.getDemo.resolves(demo);
      demoSerializer.serialize.callsFake(() => demo);
      const request = {
        params: { id: 'demo_id' },
      };

      // when
      const response = await demoController.get(request);

      // then
      expect(usecases.getDemo).to.have.been.called;
      expect(usecases.getDemo).to.have.been.calledWithExactly({ demoId: 'demo_id' });
      expect(demoSerializer.serialize).to.have.been.called;
      expect(demoSerializer.serialize).to.have.been.calledWithExactly(demo);
      expect(response).to.deep.equal(demo);
    });
  });

});
