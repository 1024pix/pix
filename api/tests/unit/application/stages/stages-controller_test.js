const { sinon, expect, hFake } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const stageSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/stage-serializer');
const stagesController = require('../../../../lib/application/stages/stages-controller');

describe('Unit | Controller | stages-controller', function () {
  describe('#create', function () {
    const userId = '1';

    beforeEach(function () {
      sinon.stub(stageSerializer, 'serialize');
      sinon.stub(stageSerializer, 'deserialize');
      sinon.stub(usecases, 'createStage');
    });

    it('should return a newly created stage', async function () {
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

  describe('#updateStage', function () {
    let request;

    beforeEach(function () {
      sinon.stub(usecases, 'updateStage');
      request = {
        params: {
          id: 44,
        },
        payload: {
          data: {
            attributes: {
              title: "c'est cool",
              message: "ça va aller t'inquiète pas",
              threshold: 64,
              'prescriber-title': 'palier bof',
              'prescriber-description': 'tu es moyen',
            },
          },
        },
      };
    });

    context('successful case', function () {
      it('should succeed', async function () {
        // when
        const response = await stagesController.updateStage(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
        expect(usecases.updateStage).to.have.been.calledWithMatch({
          title: "c'est cool",
          message: "ça va aller t'inquiète pas",
          threshold: 64,
          prescriberDescription: 'tu es moyen',
          prescriberTitle: 'palier bof',
          stageId: 44,
        });
      });
    });
  });

  describe('#getStageDetails', function () {
    let request;

    beforeEach(function () {
      sinon.stub(usecases, 'getStageDetails');
      request = {
        params: {
          id: 44,
        },
      };
    });

    context('successful case', function () {
      it('should succeed', async function () {
        // when
        stagesController.getStageDetails(request);

        // then
        expect(usecases.getStageDetails).to.have.been.calledWithMatch({ stageId: 44 });
      });
    });
  });
});
