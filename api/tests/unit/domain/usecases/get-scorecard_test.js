const { sinon, expect, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const getScorecard = require('../../../../lib/domain/usecases/get-scorecard');

describe('Unit | UseCase | get-scorecard', () => {

  let competenceRepository;
  let knowledgeElementRepository;
  let competenceEvaluationRepository;
  let buildFromStub;
  let scorecardId;
  let competenceId;
  let authenticatedUserId;
  let parseIdStub;

  beforeEach(() => {
    scorecardId = '1_1';
    competenceId = 1;
    authenticatedUserId = 1;
    competenceRepository = { get: sinon.stub() };
    knowledgeElementRepository = { findUniqByUserIdGroupedByCompetenceId: sinon.stub() };
    competenceEvaluationRepository = { findByUserId: sinon.stub() };
    buildFromStub = sinon.stub(Scorecard, 'buildFrom');
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
        competenceRepository.get.resolves([]);
        knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId.resolves({});

        // when
        const promise = getScorecard({
          authenticatedUserId,
          scorecardId,
          knowledgeElementRepository,
          competenceRepository,
          competenceEvaluationRepository,
        });

        // then
        return expect(promise).to.be.fulfilled;
      });

      it('should return the user scorecard', async () => {
        // given
        const earnedPixForCompetenceId1 = 8;
        const levelForCompetenceId1 = 1;
        const pixScoreAheadOfNextLevelForCompetenceId1 = 0;

        const competence = domainBuilder.buildCompetence({ id: 1 });

        competenceRepository.get.resolves(competence);

        const knowledgeElementList = [
          domainBuilder.buildKnowledgeElement({ competenceId: 1 }),
          domainBuilder.buildKnowledgeElement({ competenceId: 1 }),
        ];

        knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId.resolves({ '1': knowledgeElementList });

        const assessment = domainBuilder.buildAssessment({ state: 'completed', type: 'COMPETENCE_EVALUATION' });
        const competenceEvaluations = [domainBuilder.buildCompetenceEvaluation({
          competenceId: 1,
          assessmentId: assessment.id,
          assessment
        })];

        competenceEvaluationRepository.findByUserId.resolves(competenceEvaluations);

        const expectedUserScorecard = domainBuilder.buildUserScorecard({
          name: competence.name,
          earnedPix: earnedPixForCompetenceId1,
          level: levelForCompetenceId1,
          pixScoreAheadOfNextLevel: pixScoreAheadOfNextLevelForCompetenceId1
        });

        buildFromStub.withArgs({
          userId: authenticatedUserId,
          knowledgeElements: knowledgeElementList,
          competence,
          competenceEvaluations
        }).returns(expectedUserScorecard);

        // when
        const userScorecard = await getScorecard({
          authenticatedUserId,
          scorecardId,
          knowledgeElementRepository,
          competenceRepository,
          competenceEvaluationRepository,
        });

        //then
        expect(userScorecard).to.deep.equal(expectedUserScorecard);
      });
    });

    context('And user asks for a scorecard that do not belongs to him', () => {
      it('should reject a "UserNotAuthorizedToAccessEntity" domain error', () => {
        // given
        const unauthorizedUserId = 42;
        competenceRepository.get.resolves([]);
        knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId.resolves({});

        // when
        const promise = getScorecard({
          authenticatedUserId: unauthorizedUserId,
          scorecardId,
          knowledgeElementRepository,
          competenceRepository,
          competenceEvaluationRepository,
        });

        // then
        return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
      });
    });
  });
});
