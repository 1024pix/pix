const { expect, sinon } = require('../../../test-helper');

const CompetenceEvaluation = require('../../../../lib/domain/models/CompetenceEvaluation');
const competenceEvaluationService = require('../../../../lib/domain/services/competence-evaluation-service');

describe('Unit | Service | CompetenceEvaluationService', function() {

  let resetKnowledgeElements;
  let resetCompetenceEvaluation;

  const userId = 1;
  const competenceId = 2;
  const knowledgeElements = [{ id: 1 }, { id: 2 }];
  const resetKnowledgeElement1 = Symbol('reset knowledge element 1');
  const resetKnowledgeElement2 = Symbol('reset knowledge element 2');
  const updatedCompetenceEvaluation = Symbol('updated competence evaluation');

  const competenceEvaluationRepository = {
    updateStatusByUserIdAndCompetenceId: sinon.stub(),
  };

  const knowledgeElementRepository = {
    save: sinon.stub(),
    findUniqByUserIdAndCompetenceId: sinon.stub(),
  };

  beforeEach(async () => {
    // when
    competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId
      .withArgs({ userId, competenceId, status: CompetenceEvaluation.statuses.RESET })
      .resolves(updatedCompetenceEvaluation);

    knowledgeElementRepository.findUniqByUserIdAndCompetenceId
      .withArgs({ userId, competenceId }).resolves(knowledgeElements);

    knowledgeElementRepository.save
      .onFirstCall().resolves(resetKnowledgeElement1)
      .onSecondCall().resolves(resetKnowledgeElement2);

    [resetCompetenceEvaluation, resetKnowledgeElements] = await competenceEvaluationService.resetCompetenceEvaluation({
      userId, competenceId, knowledgeElementRepository, competenceEvaluationRepository,
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
