import { usecases as devCompUsecases } from '../../../../../src/devcomp/domain/usecases/index.js';
import { scorecardController } from '../../../../../src/evaluation/application/scorecards/scorecard-controller.js';
import { Scorecard } from '../../../../../src/evaluation/domain/models/Scorecard.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import * as requestResponseUtils from '../../../../../src/shared/infrastructure/utils/request-response-utils.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | scorecard-controller', function () {
  const authenticatedUserId = '12';
  const scorecardId = 'foo';
  const locale = 'fr';

  describe('#getScorecard', function () {
    const authenticatedUserId = '12';

    const scorecard = { name: 'Competence1' };

    beforeEach(function () {
      sinon
        .stub(evaluationUsecases, 'getScorecard')
        .withArgs({ authenticatedUserId, scorecardId, locale })
        .resolves(scorecard);
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
    const competenceId = 13;
    const userId = authenticatedUserId;
    const scorecard = { userId, competenceId };

    it('should call the expected usecase', async function () {
      sinon
        .stub(devCompUsecases, 'findTutorials')
        .withArgs({ userId: authenticatedUserId, competenceId, locale })
        .resolves(tutorials);
      sinon.stub(Scorecard, 'parseId').withArgs(scorecardId).resolves(scorecard);
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

  describe('#resetScorecard', function () {
    beforeEach(function () {
      sinon.stub(evaluationUsecases, 'resetScorecard').resolves({
        name: 'Comp1',
      });
    });

    it('should call the expected usecase', async function () {
      // given
      const scorecardSerializer = { serialize: sinon.stub() };
      scorecardSerializer.serialize.resolves();
      const userId = '12';
      const competenceId = '875432';
      const locale = 'fr-fr';

      const request = {
        auth: {
          credentials: {
            userId,
          },
        },
        params: {
          userId,
          competenceId,
        },
      };

      // when
      await scorecardController.resetScorecard(request, hFake, { scorecardSerializer, requestResponseUtils });

      // then
      expect(evaluationUsecases.resetScorecard).to.have.been.calledWithExactly({ userId, competenceId, locale });
    });
  });
});
