const { sinon, expect, hFake } = require('../../../test-helper');

const scorecardController = require('../../../../lib/application/scorecards/scorecard-controller');

const usecases = require('../../../../lib/domain/usecases/index.js');

const scorecardSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/scorecard-serializer');
const tutorialSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/tutorial-serializer');

describe('Unit | Controller | scorecard-controller', function () {
  const authenticatedUserId = '12';
  const scorecardId = 'foo';
  const locale = 'fr';

  describe('#getScorecard', function () {
    const authenticatedUserId = '12';

    const scorecard = { name: 'Competence1' };

    beforeEach(function () {
      sinon.stub(usecases, 'getScorecard').withArgs({ authenticatedUserId, scorecardId, locale }).resolves(scorecard);
      sinon.stub(scorecardSerializer, 'serialize').resolvesArg(0);
    });

    it('should call the expected usecase', async function () {
      // given
      const scorecardId = 'foo';
      const locale = 'fr';

      const request = {
        auth: {
          credentials: {
            userId: authenticatedUserId,
          },
        },
        params: {
          id: scorecardId,
        },
        headers: { 'accept-language': locale },
      };

      // when
      const result = await scorecardController.getScorecard(request, hFake);

      // then
      expect(result).to.be.equal(scorecard);
    });
  });

  describe('#findTutorials', function () {
    const tutorials = [];

    beforeEach(function () {
      sinon.stub(usecases, 'findTutorials').withArgs({ authenticatedUserId, scorecardId, locale }).resolves(tutorials);
      sinon.stub(tutorialSerializer, 'serialize').withArgs(tutorials).resolves('ok');
    });

    it('should call the expected usecase', async function () {
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
        headers: { 'accept-language': locale },
      };

      // when
      const result = await scorecardController.findTutorials(request, hFake);

      // then
      expect(result).to.be.equal('ok');
    });
  });
});
