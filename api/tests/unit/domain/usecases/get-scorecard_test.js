const { sinon, expect, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const getScorecard = require('../../../../lib/domain/usecases/get-scorecard');

function assertScorecard(userScorecard, expectedUserScorecard) {
  expect(userScorecard.earnedPix).to.equal(expectedUserScorecard.earnedPix);
  expect(userScorecard.level).to.equal(expectedUserScorecard.level);
  expect(userScorecard.pixScoreAheadOfNextLevel).to.equal(expectedUserScorecard.pixScoreAheadOfNextLevel);
}

describe('Unit | UseCase | get-scorecard', () => {

  let competenceRepository;
  let knowledgeElementRepository;
  let competenceEvaluationRepository;
  const scorecard = { id: 'foo' };

  beforeEach(() => {
    competenceRepository = { get: sinon.stub() };
    knowledgeElementRepository = { findUniqByUserId: sinon.stub() };
    competenceEvaluationRepository = { findByUserId: sinon.stub() };
    sinon.stub(Scorecard, 'buildFrom').returns(scorecard);
  });

  afterEach(() => {
    sinon.restore();
  });

  context('When user is authenticated', () => {
    const authenticatedUserId = 2;

    context('And user asks for his own scorecard', () => {
      const scorecardId = `${authenticatedUserId}_1`;

      it('should resolve', () => {
        // given
        competenceRepository.get.resolves([]);
        knowledgeElementRepository.findUniqByUserId.resolves([]);

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

        knowledgeElementRepository.findUniqByUserId.resolves(knowledgeElementList);

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

        Scorecard.buildFrom.withArgs({
          userId: authenticatedUserId,
          userKEList: knowledgeElementList,
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
        assertScorecard(userScorecard, expectedUserScorecard);
      });
    });

    context('And user asks for a scorecard that do not belongs to him', () => {
      it('should reject a "UserNotAuthorizedToAccessEntity" domain error', () => {
        // given
        const authenticatedUserId = 34;

        competenceRepository.get.resolves([]);
        knowledgeElementRepository.findUniqByUserId.resolves([]);

        // when
        const promise = getScorecard({
          authenticatedUserId,
          scorecardId: '1_1',
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
