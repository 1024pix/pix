const { sinon, expect, hFake } = require('../../../test-helper');

const scorecardController = require('../../../../lib/application/scorecards/scorecard-controller');

const usecases = require('../../../../lib/domain/usecases/index.js');
const requestResponseUtils = require('../../../../lib/infrastructure/utils/request-response-utils.js');

describe('Unit | Controller | scorecard-controller', function () {
  const authenticatedUserId = '12';
  const scorecardId = 'foo';
  const locale = 'fr';

  describe('#getScorecard', function () {
    const authenticatedUserId = '12';

    const scorecard = { name: 'Competence1' };

    beforeEach(function () {
      sinon.stub(usecases, 'getScorecard').withArgs({ authenticatedUserId, scorecardId, locale }).resolves(scorecard);
    });

    it('should call the expected usecase', async function () {
      // given
      const scorecardSerializer = {
        serialize: sinon.stub().resolvesArg(0),
      };
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
      const result = await scorecardController.getScorecard(request, hFake, {
        scorecardSerializer,
        requestResponseUtils,
      });

      // then
      expect(result).to.be.equal(scorecard);
    });
  });

  describe('#findTutorials', function () {
    const tutorials = [];

    beforeEach(function () {
      sinon.stub(usecases, 'findTutorials').withArgs({ authenticatedUserId, scorecardId, locale }).resolves(tutorials);
    });

    it('should call the expected usecase', async function () {
      // given
      const tutorialSerializer = {
        serialize: sinon.stub(),
      };
      tutorialSerializer.serialize.resolvesArg(0);
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
      const result = await scorecardController.findTutorials(request, hFake, {
        tutorialSerializer,
        requestResponseUtils,
      });

      // then
      expect(result).to.be.equal(tutorials);
    });
  });
});
