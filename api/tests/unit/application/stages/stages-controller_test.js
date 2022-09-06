const { sinon, expect, hFake } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const stagesController = require('../../../../lib/application/stages/stages-controller');

describe('Unit | Controller | stages-controller', function () {
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
