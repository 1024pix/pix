const { sinon, expect } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const getScorecard = require('../../../../lib/domain/usecases/get-scorecard');

describe('Unit | UseCase | get-scorecard', () => {

  let scorecardService;
  let scorecardId;
  let competenceId;
  let authenticatedUserId;
  let parseIdStub;

  beforeEach(() => {
    scorecardId = '1_1';
    competenceId = 1;
    authenticatedUserId = 1;
    scorecardService = { computeScorecard: sinon.stub() };
    parseIdStub = sinon.stub(Scorecard, 'parseId');
  });

  afterEach(() => {
    sinon.restore();
  });

  context('When user is authenticated', () => {

    beforeEach(() => {
      parseIdStub.withArgs(scorecardId).returns({ competenceId, userId: authenticatedUserId });
    });

    context('And user asks for his own scorecard', () => {

      it('should resolve', () => {
        // given
        scorecardService.computeScorecard.resolves({});

        // when
        const promise = getScorecard({
          authenticatedUserId,
          scorecardId,
          scorecardService,
        });

        // then
        return expect(promise).to.be.fulfilled;
      });

      it('should return the user scorecard', async () => {
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

    context('And user asks for a scorecard that do not belongs to him', () => {
      it('should reject a "UserNotAuthorizedToAccessEntity" domain error', () => {
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
        return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
      });
    });
  });
});
