const { sinon, expect, hFake } = require('../../../test-helper');

const scorecardController = require('../../../../lib/application/scorecards/scorecard-controller');

const usecases = require('../../../../lib/domain/usecases');

const scorecardSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/scorecard-serializer');
const tutorialSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/tutorial-serializer');

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

  describe('#findTutorials', () => {
    const authenticatedUserId = '12';
    const scorecardId = 'foo';

    const tutorials = [];

    beforeEach(() => {
      sinon.stub(usecases, 'findTutorials').withArgs({ authenticatedUserId, scorecardId }).resolves(tutorials);
      sinon.stub(tutorialSerializer, 'serialize').withArgs(tutorials).resolves('ok');
    });

    it('should call the expected usecase', async () => {
      // given
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
      const result = await scorecardController.findTutorials(request, hFake);

      // then
      expect(usecases.findTutorials).to.have.been.calledWith({ authenticatedUserId, scorecardId });
      expect(result).to.be.equal('ok');
    });
  });
});
