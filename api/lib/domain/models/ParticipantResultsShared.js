const KnowledgeElement = require('./KnowledgeElement');
const { calculatePixScore } = require('../services/scoring/scoring-service');
const { MAX_REACHABLE_PIX_BY_COMPETENCE } = require('../constants');
const MAX_PIX_SCORE = MAX_REACHABLE_PIX_BY_COMPETENCE * 16;

class ParticipantResultsShared {
  constructor({ campaignParticipationId, knowledgeElements, targetedSkillIds }) {
    const validatedKnowledgeElements = _getValidatedKnowledgeElements(knowledgeElements, targetedSkillIds);

    this.id = campaignParticipationId;
    this.validatedSkillsCount = validatedKnowledgeElements.length;
    this.pixScore = calculatePixScore(validatedKnowledgeElements);
    if (targetedSkillIds.length > 0) {
      this.masteryRate = this.validatedSkillsCount / targetedSkillIds.length;
    } else {
      this.masteryRate = this.pixScore / MAX_PIX_SCORE;
    }
  }
}

function _getValidatedKnowledgeElements(knowledgeElements, targetedSkillIds) {
  let filteredKnowledgeElements = knowledgeElements.filter((ke) => ke.status === KnowledgeElement.StatusType.VALIDATED);
  if (targetedSkillIds.length > 0) {
    filteredKnowledgeElements = filteredKnowledgeElements.filter((ke) => targetedSkillIds.includes(ke.skillId));
  }

  return filteredKnowledgeElements;
}

module.exports = ParticipantResultsShared;
