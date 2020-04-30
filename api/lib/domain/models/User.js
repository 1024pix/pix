const _ = require('lodash');

class User {

  constructor({
    id,
    // attributes
    cgu,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    email,
    username,
    firstName,
    knowledgeElements,
    lastName,
    password,
    samlId,
    hasSeenAssessmentInstructions,
    shouldChangePassword,
    mustValidateTermsOfService,
    // includes
    memberships = [],
    certificationCenterMemberships = [],
    pixRoles = [],
    pixScore,
    scorecards = [],
    campaignParticipations = [],
    userOrgaSettings
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.email = email ? _.toLower(email) : undefined;
    this.password = password;
    this.cgu = cgu;
    this.mustValidateTermsOfService = mustValidateTermsOfService;
    this.pixOrgaTermsOfServiceAccepted = pixOrgaTermsOfServiceAccepted;
    this.pixCertifTermsOfServiceAccepted = pixCertifTermsOfServiceAccepted;
    this.samlId = samlId;
    this.hasSeenAssessmentInstructions = hasSeenAssessmentInstructions;
    this.knowledgeElements = knowledgeElements;
    this.shouldChangePassword = shouldChangePassword;
    // includes
    this.pixRoles = pixRoles;
    this.pixScore = pixScore;
    this.memberships = memberships;
    this.certificationCenterMemberships = certificationCenterMemberships;
    this.scorecards = scorecards;
    this.campaignParticipations = campaignParticipations;
    this.userOrgaSettings = userOrgaSettings;
    // references
  }

  get hasRolePixMaster() {
    return !!this.pixRoles.find((pixRole) => pixRole.name === 'PIX_MASTER');
  }

  isLinkedToOrganizations() {
    return this.memberships.length > 0;
  }

  isLinkedToCertificationCenters() {
    return this.certificationCenterMemberships.length > 0;
  }

  hasAccessToOrganization(organizationId) {
    return this.memberships
      .some((membership) => membership.organization.id === organizationId);
  }

  hasAccessToCertificationCenter(certificationCenterId) {
    return this.certificationCenterMemberships
      .some((certificationCenterMembership) => certificationCenterMembership.certificationCenter.id === certificationCenterId);
  }
}

module.exports = User;
