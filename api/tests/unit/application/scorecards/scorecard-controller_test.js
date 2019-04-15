const { sinon, expect, hFake } = require('../../../test-helper');

const scorecardController = require('../../../../lib/application/scorecards/scorecard-controller');

const usecases = require('../../../../lib/domain/usecases');

const scorecardSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/scorecard-serializer');

describe('Unit | Controller | user-controller', () => {

  describe('#getScorecard', () => {

    beforeEach(() => {
      sinon.stub(usecases, 'getScorecard').resolves({
        name:'Competence1',
      });
      sinon.stub(scorecardSerializer, 'serialize').resolves();
    });

    it('should call the expected usecase', async () => {
      // given
      const authenticatedUserId= '12';
      const scorecardId= '12_foo';

      const request = {
        auth: {
          credentials: {
            userId: authenticatedUserId,
          },
        },
        params: {
          id: scorecardId,
        },
      };

      // when
      await scorecardController.getScorecard(request, hFake);

      // then
      expect(usecases.getScorecard).to.have.been.calledWith({ authenticatedUserId, scorecardId });
    });
  });
});
