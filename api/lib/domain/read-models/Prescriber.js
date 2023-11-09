class Prescriber {
  constructor({
    id,
    firstName,
    lastName,
    pixOrgaTermsOfServiceAccepted,
    lang,
    areNewYearOrganizationLearnersImported,
    participantCount,
    memberships = [],
    userOrgaSettings,
    enableMultipleSendingAssessment,
    computeOrganizationLearnerCertificability,
    features,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.pixOrgaTermsOfServiceAccepted = pixOrgaTermsOfServiceAccepted;
    this.lang = lang;
    this.areNewYearOrganizationLearnersImported = areNewYearOrganizationLearnersImported;
    this.participantCount = participantCount;
    this.memberships = memberships;
    this.userOrgaSettings = userOrgaSettings;
    this.enableMultipleSendingAssessment = enableMultipleSendingAssessment;
    this.computeOrganizationLearnerCertificability = computeOrganizationLearnerCertificability;
    this.features = features;
  }
}

export { Prescriber };
