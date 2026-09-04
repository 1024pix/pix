export class OrganizationBatchUpdateDTO {
  /**
   * @param data
   * @param {string} data.id
   * @param {string|undefined} data.name
   * @param {string|undefined} data.externalId
   * @param {string|undefined} data.parentOrganizationId
   * @param {string|undefined} data.identityProviderForCampaigns
   * @param {string|undefined} data.documentationUrl
   * @param {string|undefined} data.provinceCode
   * @param {string|undefined} data.dataProtectionOfficerLastName
   * @param {string|undefined} data.dataProtectionOfficerFirstName
   * @param {string|undefined} data.dataProtectionOfficerEmail
   * @param {string|undefined} data.administrationTeamId
   * @param {string|undefined} data.countryCode
   * @param {string|undefined} data.organizationLearnerTypeId
   */
  constructor(data) {
    this.id = data.id;
    this.name = data.name ?? '';
    this.externalId = data.externalId ?? '';
    this.parentOrganizationId = data.parentOrganizationId ?? '';
    this.identityProviderForCampaigns = data.identityProviderForCampaigns ?? '';
    this.documentationUrl = data.documentationUrl ?? '';
    this.provinceCode = data.provinceCode ?? '';
    this.dataProtectionOfficerLastName = data.dataProtectionOfficerLastName ?? '';
    this.dataProtectionOfficerFirstName = data.dataProtectionOfficerFirstName ?? '';
    this.dataProtectionOfficerEmail = data.dataProtectionOfficerEmail ?? '';
    this.administrationTeamId = data.administrationTeamId ?? '';
    this.countryCode = data.countryCode ?? '';
    this.organizationLearnerTypeId = data.organizationLearnerTypeId ?? '';
    this.categoryId = data.categoryId ?? '';
  }
}
