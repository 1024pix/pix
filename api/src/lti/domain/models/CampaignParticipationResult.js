/**
 * @typedef {object} CompetenceResult
 * @property {string} id
 * @property {string} index
 * @property {string} name
 * @property {number} maxLevel maximum level reachable on the competence
 * @property {number} reachedLevel level reached by the participant on the competence
 */

export class CampaignParticipationResult {
  /**
   * @param {Object} props
   * @param {number} props.campaignParticipationId
   * @param {number|null} [props.masteryRate] mastery rate of the participation, between 0 and 1 for assessment participation
   * @param {number|null} [props.pixScore] pixScore of the user, for profile collection participation
   * @param {Array<CompetenceResult>} [props.competences]
   */
  constructor({ campaignParticipationId, pixScore = null, masteryRate = null, competences = [] }) {
    this.campaignParticipationId = campaignParticipationId;
    this.masteryRate = masteryRate;
    this.pixScore = pixScore;
    this.competences = competences.map(({ id, index, name, maxLevel, reachedLevel }) => ({
      id,
      index,
      name,
      maxLevel,
      reachedLevel,
    }));
  }
}
