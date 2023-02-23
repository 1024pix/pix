const KnowledgeElement = require('./KnowledgeElement.js');
const { calculatePixScore } = require('../services/scoring/scoring-service.js');
const { MAX_REACHABLE_PIX_BY_COMPETENCE } = require('../constants.js');
const MAX_PIX_SCORE = MAX_REACHABLE_PIX_BY_COMPETENCE * 16;

class ParticipantResultsShared {
  constructor({ campaignParticipationId, knowledgeElements, skillIds, placementProfile }) {
    const validatedKnowledgeElements = _getValidatedKnowledgeElements(knowledgeElements, skillIds);

    this.id = campaignParticipationId;
    this.validatedSkillsCount = validatedKnowledgeElements.length;
    this.pixScore = calculatePixScore(validatedKnowledgeElements);
    if (skillIds.length > 0) {
      this.masteryRate = this.validatedSkillsCount / skillIds.length;
      this.isCertifiable = null;
    } else {
      this.masteryRate = this.pixScore / MAX_PIX_SCORE;
      this.isCertifiable = placementProfile.isCertifiable();
    }
  }
}

function _getValidatedKnowledgeElements(knowledgeElements, skillIds) {
  let filteredKnowledgeElements = knowledgeElements.filter((ke) => ke.status === KnowledgeElement.StatusType.VALIDATED);
  if (skillIds.length > 0) {
    filteredKnowledgeElements = filteredKnowledgeElements.filter((ke) => skillIds.includes(ke.skillId));
  }

  return filteredKnowledgeElements;
}

module.exports = ParticipantResultsShared;
