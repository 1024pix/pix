import { calculatePixScore } from '../../../../evaluation/domain/services/scoring/scoring-service.js';
import { MAX_REACHABLE_PIX_BY_COMPETENCE } from '../../../../shared/constants.js';
const MAX_PIX_SCORE = MAX_REACHABLE_PIX_BY_COMPETENCE * 16;

class ParticipantResultsShared {
  /**
   * @param {KnowledgeState} knowledgeState l'état figé au partage
   */
  constructor({ campaignParticipationId, knowledgeState, skillIds, placementProfile }) {
    const validatedSkills = _getValidatedSkills(knowledgeState, skillIds);

    this.id = campaignParticipationId;
    this.validatedSkillsCount = validatedSkills.length;
    this.pixScore = calculatePixScore(validatedSkills);
    if (skillIds.length > 0) {
      this.masteryRate = this.validatedSkillsCount / skillIds.length;
      this.isCertifiable = null;
    } else {
      this.masteryRate = this.pixScore / MAX_PIX_SCORE;
      this.isCertifiable = placementProfile.isCertifiable();
    }
  }
}

function _getValidatedSkills(knowledgeState, skillIds) {
  const validatedSkills = knowledgeState.validatedSkills();
  if (skillIds.length > 0) {
    return validatedSkills.filter(({ id }) => skillIds.includes(id));
  }

  return validatedSkills;
}

export { ParticipantResultsShared };
