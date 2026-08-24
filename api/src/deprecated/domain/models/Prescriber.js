class Prescriber {
  /**
   * @param {{
   *   id: string,
   *   firstName: string,
   *   lastName: string,
   *   pixOrgaTermsOfServiceStatus: string,
   *   pixOrgaTermsOfServiceDocumentPath: string,
   *   lang: string,
   *   areNewYearOrganizationLearnersImported: boolean,
   *   participantCount: number,
   *   memberships: *[],
   *   userOrgaSettings: UserOrgaSettings,
   *   features: *
   * }} data
   */
  constructor({
    id,
    firstName,
    lastName,
    pixOrgaTermsOfServiceStatus,
    pixOrgaTermsOfServiceDocumentPath,
    lang,
    areNewYearOrganizationLearnersImported,
    participantCount,
    memberships = [],
    userOrgaSettings,
    features,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.pixOrgaTermsOfServiceStatus = pixOrgaTermsOfServiceStatus;
    this.pixOrgaTermsOfServiceDocumentPath = pixOrgaTermsOfServiceDocumentPath;
    this.lang = lang;
    this.areNewYearOrganizationLearnersImported = areNewYearOrganizationLearnersImported;
    this.participantCount = participantCount;
    this.memberships = memberships;
    this.userOrgaSettings = userOrgaSettings;
    this.features = features;
  }
}

export { Prescriber };
