/**
 * @typedef {object} LtiCompetence
 * @property {string} id
 * @property {string} index
 * @property {string} name
 * @property {number} maxLevel
 * @property {number} [reachedLevel] level reached by a participant, set by LtiCampaign#populateScore
 */

const MASTERY_RATE_SCORE_MAXIMUM = 100;
const PIX_SCORE_MAXIMUM = 1024;

export class LtiCampaign {
  #lineItemResourcePrefix;

  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {string} props.code
   * @param {string} props.name
   * @param {string} props.type
   * @param {string} props.organizationName
   * @param {string} props.organizationId
   * @param {string} props.description
   * @param {Array<LtiCompetence>} [props.competences]
   */
  constructor({ id, code, name, type, organizationName, organizationId, description, competences = [] }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.type = type;
    this.organizationName = organizationName;
    this.organizationId = organizationId;
    this.description = description;
    this.competences = competences;
    this.masteryRate = null;
    this.#lineItemResourcePrefix = `pix:campaign:${this.id}`;
  }

  /** @returns {string} tag shared by every line item of the campaign, used to find them on the platform */
  get lineItemTag() {
    return `pix-campaign-${this.id}`;
  }

  /**
   * Sets the results of a participant on the campaign: the reached level of each competence and the mastery rate.
   * Competences missing from the result are left without reached level.
   *
   * @param {import('./CampaignAssessmentResult.js').CampaignAssessmentResult} campaignAssessmentResult
   */
  populateScore(campaignAssessmentResult) {
    const reachedLevelByCompetenceId = new Map(
      campaignAssessmentResult.competences.map(({ id, reachedLevel }) => [id, reachedLevel]),
    );

    this.competences = this.competences.map((competence) =>
      reachedLevelByCompetenceId.has(competence.id)
        ? { ...competence, reachedLevel: reachedLevelByCompetenceId.get(competence.id) }
        : competence,
    );
    this.masteryRate = campaignAssessmentResult.masteryRate ?? null;
  }

  /**
   * Builds the AGS line items expected on the platform for this campaign:
   * one per competence, plus a global one depending on the campaign type.
   * When the campaign has been populated with a participant result, line items also carry the given score.
   *
   * @param { string } resourceLinkId LTI resource link id
   * @param {{ __: (key: string) => string }} i18n
   * @returns {Array<{ label: string, resourceId: string, scoreMaximum: number, scoreGiven?: number, tag: string, resourceLinkId: string }>}
   */
  buildLineItems(resourceLinkId, i18n) {
    return this.competences
      .map((competence) => this.#buildCompetenceLineItem(competence, resourceLinkId))
      .concat(this.#buildGlobalLineItem(resourceLinkId, i18n))
      .filter(Boolean);
  }

  #buildCompetenceLineItem(competence, resourceLinkId) {
    return {
      label: `${this.code} : ${competence.index} ${competence.name}`,
      resourceId: `${this.#lineItemResourcePrefix}:competence:${competence.id}`,
      scoreMaximum: Math.round(competence.maxLevel),
      scoreGiven: competence.reachedLevel != null ? Math.round(competence.reachedLevel * 10) / 10 : null,
      tag: this.lineItemTag,
      resourceLinkId,
    };
  }

  #buildGlobalLineItem(resourceLinkId, i18n) {
    switch (this.type) {
      case 'ASSESSMENT':
      case 'EXAM':
        return {
          label: `${this.code} : ${i18n.__('lti.line-item-mastery-rate')}`,
          resourceId: `${this.#lineItemResourcePrefix}:mastery-rate`,
          scoreMaximum: MASTERY_RATE_SCORE_MAXIMUM,
          scoreGiven: this.masteryRate ? Math.round(this.masteryRate * MASTERY_RATE_SCORE_MAXIMUM) : null,
          tag: this.lineItemTag,
          resourceLinkId,
        };
      case 'PROFILES_COLLECTION':
        return {
          label: `${this.code} : ${i18n.__('lti.line-item-pix-score')}`,
          resourceId: `${this.#lineItemResourcePrefix}:pix-score`,
          scoreMaximum: PIX_SCORE_MAXIMUM,
          tag: this.lineItemTag,
          resourceLinkId,
        };
      default:
        return null;
    }
  }
}
