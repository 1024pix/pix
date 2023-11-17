import { sinon, expect } from '../../../test-helper.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../lib/domain/errors.js';
import { Scorecard } from '../../../../src/evaluation/domain/models/Scorecard.js';
import { getScorecard } from '../../../../lib/domain/usecases/get-scorecard.js';

describe('Unit | UseCase | get-scorecard', function () {
  let scorecardService;
  let competenceRepository;
  let competenceEvaluationRepository;
  let knowledgeElementRepository;
  let scorecardId;
  let competenceId;
  let authenticatedUserId;
  let parseIdStub;
  const locale = 'fr';

  beforeEach(function () {
    scorecardId = '1_1';
    competenceId = 1;
    authenticatedUserId = 1;
    scorecardService = { computeScorecard: sinon.stub() };
    parseIdStub = sinon.stub(Scorecard, 'parseId');
    competenceRepository = {};
    competenceEvaluationRepository = {};
    knowledgeElementRepository = {};
  });

  context('When user is authenticated', function () {
    beforeEach(function () {
      parseIdStub.withArgs(scorecardId).returns({ competenceId, userId: authenticatedUserId });
    });

    context('And user asks for his own scorecard', function () {
      it('should resolve', function () {
        // given
        scorecardService.computeScorecard
          .withArgs({
            userId: authenticatedUserId,
            competenceRepository,
            competenceEvaluationRepository,
            knowledgeElementRepository,
            locale,
          })
          .resolves({});

        // when
        const promise = getScorecard({
          authenticatedUserId,
          scorecardId,
          scorecardService,
          competenceRepository,
          competenceEvaluationRepository,
          knowledgeElementRepository,
          locale,
        });

        // then
        return expect(promise).to.be.fulfilled;
      });

      it('should return the user scorecard', async function () {
        // given
        const scorecard = Symbol('Scorecard');

        scorecardService.computeScorecard.resolves(scorecard);

        // when
        const userScorecard = await getScorecard({
          authenticatedUserId,
          scorecardId,
          scorecardService,
        });

        //then
        expect(userScorecard).to.deep.equal(scorecard);
      });
    });

    context('And user asks for a scorecard that do not belongs to him', function () {
      it('should reject a "UserNotAuthorizedToAccessEntityError" domain error', function () {
        // given
        const unauthorizedUserId = 42;
        scorecardService.computeScorecard.resolves({});

        // when
        const promise = getScorecard({
          authenticatedUserId: unauthorizedUserId,
          scorecardId,
          scorecardService,
        });

        // then
        return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntityError);
      });
    });
  });
});
