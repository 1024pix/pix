/**
 * @class NetworkOrganizationDTO
 */
export class NetworkOrganizationDTO {
  /**
   * @param {Object} params
   * @param {number} params.organizationId
   * @param {string|null} params.externalId
   */
  constructor({ organizationId, externalId }) {
    this.organizationId = organizationId;
    this.externalId = externalId;
  }
}
