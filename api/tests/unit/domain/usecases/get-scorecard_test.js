const { sinon, expect } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const getScorecard = require('../../../../lib/domain/usecases/get-scorecard');

describe('Unit | UseCase | get-scorecard', function() {

  let scorecardService;
  let scorecardId;
  let competenceId;
  let authenticatedUserId;
  let parseIdStub;

  beforeEach(function() {
    scorecardId = '1_1';
    competenceId = 1;
    authenticatedUserId = 1;
    scorecardService = { computeScorecard: sinon.stub() };
    parseIdStub = sinon.stub(Scorecard, 'parseId');
  });

  afterEach(function() {
    sinon.restore();
  });

  context('When user is authenticated', function() {

    beforeEach(function() {
      parseIdStub.withArgs(scorecardId).returns({ competenceId, userId: authenticatedUserId });
    });

    context('And user asks for his own scorecard', function() {

      it('should return the user scorecard', async function() {
        // given
        const scorecard = Symbol('Scorecard');

        scorecardService.computeScorecard.returns(scorecard);

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

    context('And user asks for a scorecard that do not belongs to him', function() {
      it('should reject a "UserNotAuthorizedToAccessEntityError" domain error', function() {
        // given
        const unauthorizedUserId = 42;
        scorecardService.computeScorecard.returns({});

        // when
        try {
          getScorecard({
            authenticatedUserId: unauthorizedUserId,
            scorecardId,
            scorecardService,
          });

          expect.fail('Expected error to have been thrown');
        } catch (e) {
          // then
          expect(e).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
        }
      });
    });
  });
});
