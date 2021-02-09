const { sinon, expect, hFake } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');

const stageSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/stage-serializer');

const stagesController = require('../../../../lib/application/stages/stages-controller');

describe('Unit | Controller | stages-controller', () => {

  describe('#create', () => {
    const userId = '1';

    beforeEach(() => {
      sinon.stub(stageSerializer, 'serialize');
      sinon.stub(stageSerializer, 'deserialize');
      sinon.stub(usecases, 'createStage');
    });

    it('should return a newly created stage', async function() {
      // given
      const requestPayload = {};
      const request = {
        auth: {
          credentials: {
            userId: userId,
          },
        },
        payload: requestPayload,
      };
      const deserializedStage = {
        title: 'My stage',
      };
      const createdStage = {};
      stageSerializer.deserialize.returns(deserializedStage);
      usecases.createStage.resolves(createdStage);

      // when
      const response = await stagesController.create(request, hFake);

      // then
      expect(response.statusCode).to.equal(201);
      expect(stageSerializer.deserialize.calledWith(requestPayload)).to.be.true;
      expect(usecases.createStage.calledWith({ stage: deserializedStage })).to.be.true;
      expect(stageSerializer.serialize.calledWith(createdStage)).to.be.true;
    });
  });

});
