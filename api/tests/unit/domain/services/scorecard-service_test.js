const { expect, sinon, domainBuilder } = require('../../../test-helper');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const CompetenceEvaluation = require('../../../../lib/domain/models/CompetenceEvaluation');
const scorecardService = require('../../../../lib/domain/services/scorecard-service');

describe('Unit | Service | ScorecardService', function() {

  describe('#computeScorecard', function() {

    let competenceRepository;
    let knowledgeElementRepository;
    let competenceEvaluationRepository;
    let buildFromStub;
    let competenceId;
    let authenticatedUserId;

    beforeEach(() => {
      competenceId = 1;
      authenticatedUserId = 1;
      competenceRepository = { get: sinon.stub() };
      knowledgeElementRepository = { findUniqByUserIdAndCompetenceId: sinon.stub() };
      competenceEvaluationRepository = { findByUserId: sinon.stub() };
      buildFromStub = sinon.stub(Scorecard, 'buildFrom');
    });

    afterEach(() => {
      sinon.restore();
    });

    context('And user asks for his own scorecard', () => {

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

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId.resolves(knowledgeElementList);

        const assessment = domainBuilder.buildAssessment({ state: 'completed', type: 'COMPETENCE_EVALUATION' });
        const competenceEvaluation = domainBuilder.buildCompetenceEvaluation({
          competenceId: 1,
          assessmentId: assessment.id,
          assessment
        });

        competenceEvaluationRepository.findByUserId.resolves([competenceEvaluation]);

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
          competenceEvaluation
        }).returns(expectedUserScorecard);

        // when
        const userScorecard = await scorecardService.computeScorecard({
          userId: authenticatedUserId,
          competenceId,
          competenceRepository,
          competenceEvaluationRepository,
          knowledgeElementRepository
        });

        //then
        expect(userScorecard).to.deep.equal(expectedUserScorecard);
      });
    });
  });

  describe('#resetScorecard', function() {

    let resetKnowledgeElements;
    let resetCompetenceEvaluation;
    let knowledgeElementRepository;
    let competenceEvaluationRepository;

    const userId = 1;
    const competenceId = 2;
    const knowledgeElements = [{ id: 1 }, { id: 2 }];
    const resetKnowledgeElement1 = Symbol('reset knowledge element 1');
    const resetKnowledgeElement2 = Symbol('reset knowledge element 2');
    const updatedCompetenceEvaluation = Symbol('updated competence evaluation');

    context('when competence evaluation exists', function() {

      beforeEach(async () => {
        // when
        const shouldResetCompetenceEvaluation = true;
        competenceEvaluationRepository = {
          updateStatusByUserIdAndCompetenceId: sinon.stub(),
        };

        knowledgeElementRepository = {
          save: sinon.stub(),
          findUniqByUserIdAndCompetenceId: sinon.stub(),
        };

        competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId
          .withArgs({ userId, competenceId, status: CompetenceEvaluation.statuses.RESET })
          .resolves(updatedCompetenceEvaluation);

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId
          .withArgs({ userId, competenceId }).resolves(knowledgeElements);

        knowledgeElementRepository.save
          .onFirstCall().resolves(resetKnowledgeElement1)
          .onSecondCall().resolves(resetKnowledgeElement2);

        [resetCompetenceEvaluation, resetKnowledgeElements] = await scorecardService.resetScorecard({
          userId, competenceId, shouldResetCompetenceEvaluation, knowledgeElementRepository, competenceEvaluationRepository,
        });
      });

      // then
      it('should reset each knowledge elements', async () => {
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 1, status: 'reset', earnedPix: 0 });
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 2, status: 'reset', earnedPix: 0 });
        expect(resetKnowledgeElements).to.deep.equal([resetKnowledgeElement1, resetKnowledgeElement2]);
      });

      it('should reset the competence evaluation', () => {
        expect(resetCompetenceEvaluation).to.deep.equal(updatedCompetenceEvaluation);
      });
    });

    context('when competence evaluation does not exists - there is only knowledge elements thanks to campaign', function() {

      beforeEach(async () => {
        // when
        const shouldResetCompetenceEvaluation = false;
        knowledgeElementRepository = {
          save: sinon.stub(),
          findUniqByUserIdAndCompetenceId: sinon.stub(),
        };

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId
          .withArgs({ userId, competenceId }).resolves(knowledgeElements);

        knowledgeElementRepository.save
          .onFirstCall().resolves(resetKnowledgeElement1)
          .onSecondCall().resolves(resetKnowledgeElement2);

        resetKnowledgeElements = await scorecardService.resetScorecard({
          userId, competenceId, shouldResetCompetenceEvaluation, knowledgeElementRepository, competenceEvaluationRepository,
        });
      });

      // then
      it('should reset each knowledge elements', async () => {
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 1, status: 'reset', earnedPix: 0 });
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 2, status: 'reset', earnedPix: 0 });
        expect(resetKnowledgeElements).to.deep.equal([resetKnowledgeElement1, resetKnowledgeElement2]);
      });
    });
  });

});
