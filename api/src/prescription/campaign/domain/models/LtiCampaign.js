export class LtiCampaign {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {string} props.code
   * @param {string} props.name
   * @param {string} props.type
   * @param {string} props.organizationName
   * @param {string} props.description
   */
  constructor({ id, code, name, type, organizationName, description }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.type = type;
    this.organizationName = organizationName;
    this.description = description;
  }
}
