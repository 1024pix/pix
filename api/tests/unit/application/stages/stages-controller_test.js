const { sinon, expect } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const stagesController = require('../../../../lib/application/stages/stages-controller');

describe('Unit | Controller | stages-controller', function () {
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
