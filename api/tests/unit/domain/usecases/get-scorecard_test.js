import { expect, sinon } from '../../../test-helper.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../lib/domain/errors.js';
import { Scorecard } from '../../../../lib/domain/models/Scorecard.js';
import { getScorecard } from '../../../../lib/domain/usecases/get-scorecard.js';

describe('Unit | UseCase | get-scorecard', function () {
  let scorecardService;
  let competenceRepository;
  let skillRepository;
  let knowledgeElementRepository;
  let areaRepository;
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
    skillRepository = {};
    knowledgeElementRepository = {};
    areaRepository = {};
  });

  context('When user is authenticated', function () {
    beforeEach(function () {
      parseIdStub.withArgs(scorecardId).returns({ competenceId, userId: authenticatedUserId });
    });

    context('And user asks for his own scorecard', function () {
      it('should resolve', async function () {
        // given
        const scorecard = Symbol('Scorecard');
        scorecardService.computeScorecard.resolves(scorecard);

        // when
        const userScorecard = await getScorecard({
          authenticatedUserId,
          scorecardId,
          scorecardService,
          competenceRepository,
          skillRepository,
          knowledgeElementRepository,
          areaRepository,
          locale,
        });

        // then
        expect(scorecardService.computeScorecard).to.have.been.calledWith({
          userId: authenticatedUserId,
          competenceId,
          competenceRepository,
          areaRepository,
          skillRepository,
          knowledgeElementRepository,
          locale,
        });

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
