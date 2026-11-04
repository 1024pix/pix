export class CampaignOverview {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {string} props.code
   * @param {string} props.name
   * @param {string} props.type
   * @param {string} props.organizationName
   * @param {string} props.organizationId
   * @param {string} props.targetProfileId
   * @param {string} props.description
   */
  constructor({ id, code, name, type, organizationName, organizationId, targetProfileId, description }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.type = type;
    this.organizationName = organizationName;
    this.organizationId = organizationId;
    this.targetProfileId = targetProfileId;
    this.description = description;
  }
}
