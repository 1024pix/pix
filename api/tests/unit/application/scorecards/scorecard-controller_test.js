const { sinon, expect, hFake } = require('../../../test-helper');

const scorecardController = require('../../../../lib/application/scorecards/scorecard-controller');

const usecases = require('../../../../lib/domain/usecases');

const scorecardSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/scorecard-serializer');

describe('Unit | Controller | user-controller', () => {

  describe('#getScorecard', () => {

    const scorecard = { name: 'Competence1' };

    beforeEach(() => {
      sinon.stub(usecases, 'getScorecard').resolves(scorecard);
      sinon.stub(scorecardSerializer, 'serialize').resolvesArg(0);
    });

    it('should call the expected usecase', async () => {
      // given
      const authenticatedUserId = '12';
      const scorecardId = 'foo';

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
      const result = await scorecardController.getScorecard(request, hFake);

      // then
      expect(usecases.getScorecard).to.have.been.calledWith({ authenticatedUserId, scorecardId });
      expect(result).to.be.equal(scorecard);
    });
  });
});
