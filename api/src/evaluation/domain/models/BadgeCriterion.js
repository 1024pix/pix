export default class BadgeCriterion {
  /**
   *
   * @param {number} id
   * @param {number} badgeId
   * @param {array<{id: string, level: number}>|null} cappedTubes
   * @param {string|null} name
   * @param {('CampaignParticipation'|'CappedTubes')} scope
   * @param {number} threshold
   */
  constructor({ id, badgeId, cappedTubes, name, scope, threshold } = {}) {
    this.id = id;
    this.badgeId = badgeId;
    this.cappedTubes = cappedTubes;
    this.name = name;
    this.scope = scope;
    this.threshold = threshold;
  }
}
