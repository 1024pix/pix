/**
 * @typedef {object} CompetenceResult
 * @property {string} id
 * @property {string} index
 * @property {string} name
 * @property {number} maxLevel maximum level reachable on the competence
 * @property {number} reachedLevel level reached by the participant on the competence
 */

export class CampaignAssessmentResult {
  /**
   * @param {Object} props
   * @param {number} props.campaignParticipationId
   * @param {number|null} [props.masteryRate] mastery rate of the participation, between 0 and 1
   * @param {Array<CompetenceResult>} [props.competences]
   */
  constructor({ campaignParticipationId, masteryRate = null, competences = [] }) {
    this.campaignParticipationId = campaignParticipationId;
    this.masteryRate = masteryRate;
    this.competences = competences.map(({ id, index, name, maxLevel, reachedLevel }) => ({
      id,
      index,
      name,
      maxLevel,
      reachedLevel,
    }));
  }
}
