export class LtiCampaign {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {string} props.code
   * @param {string} props.name
   * @param {string} props.type
   * @param {string} props.organizationName
   * @param {string} props.organizationId
   * @param {string} props.description
   * @param {Array<{ id: string, index: string, name: string, maxLevel: number }>} [props.competences]
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
  }
}
