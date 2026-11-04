export class CampaignCompetence {
  /**
   * @param {Object} props
   * @param {string} props.id
   * @param {string} props.index
   * @param {string} props.name
   * @param {number} props.maxLevel
   */
  constructor({ id, index, name, maxLevel }) {
    this.id = id;
    this.index = index;
    this.name = name;
    this.maxLevel = maxLevel;
  }
}
