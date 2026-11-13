/**
 * @typedef {object} LtiCompetence
 * @property {string} id
 * @property {string} index
 * @property {string} name
 * @property {number} maxLevel
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
    this.#lineItemResourcePrefix = `pix:campaign:${this.id}`;
  }

  /** @returns {string} tag shared by every line item of the campaign, used to find them on the platform */
  get lineItemTag() {
    return `pix-campaign-${this.id}`;
  }

  /**
   * Builds the AGS line items expected on the platform for this campaign:
   * one per competence, plus a global one depending on the campaign type.
   *
   * @param { string } resourceLinkId LTI resource link id
   * @param {{ __: (key: string) => string }} i18n
   * @returns {Array<{ label: string, resourceId: string, scoreMaximum: number, tag: string }>}
   */
  buildLineItems(resourceLinkId, i18n) {
    return this.competences
      .map((competence) => ({
        label: `${this.code} : ${competence.index} ${competence.name}`,
        resourceId: `${this.#lineItemResourcePrefix}:competence:${competence.id}`,
        scoreMaximum: Math.round(competence.maxLevel),
        tag: this.lineItemTag,
        resourceLinkId,
      }))
      .concat(this.#buildGlobalLineItem(resourceLinkId, i18n))
      .filter(Boolean);
  }

  #buildGlobalLineItem(resourceLinkId, i18n) {
    switch (this.type) {
      case 'ASSESSMENT':
      case 'EXAM':
        return {
          label: `${this.code} : ${i18n.__('lti.line-item-mastery-rate')}`,
          resourceId: `${this.#lineItemResourcePrefix}:mastery-rate`,
          scoreMaximum: MASTERY_RATE_SCORE_MAXIMUM,
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
