const { expect, sinon } = require('../../../test-helper');

const competenceEvaluationService = require('../../../../lib/domain/services/competence-evaluation-service');

describe('Unit | Service | CompetenceEvaluationService', function() {

  let resetKnowledgeElements;

  const userId = 1;
  const competenceId = 2;
  const knowledgeElements = [{ id: 1 }, { id: 2 }];
  const resetKnowledgeElement1 = Symbol();
  const resetKnowledgeElement2 = Symbol();

  const knowledgeElementRepository = {
    save: sinon.stub(),
    findUniqByUserIdAndCompetenceId: sinon.stub(),
  };

  beforeEach(async () => {
    // when
    knowledgeElementRepository.findUniqByUserIdAndCompetenceId
      .withArgs({ userId, competenceId }).resolves(knowledgeElements);

    knowledgeElementRepository.save
      .onFirstCall().resolves(resetKnowledgeElement1)
      .onSecondCall().resolves(resetKnowledgeElement2);

    resetKnowledgeElements = await competenceEvaluationService.resetCompetenceEvaluation({
      userId, competenceId, knowledgeElementRepository
    });
  });

  // then
  it('should reset each knowledge elements', async () => {
    expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 1, status: 'reset', earnedPix: 0 });
    expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 2, status: 'reset', earnedPix: 0 });
    expect(resetKnowledgeElements).to.deep.equal([resetKnowledgeElement1, resetKnowledgeElement2]);
  });
});
