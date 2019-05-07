const _ = require('lodash');

class User {

  constructor({
    id,
    // attributes
    cgu,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    email,
    firstName,
    knowledgeElements,
    lastName,
    password,
    samlId,
    isProfileV2 = true,
    hasSeenAssessmentInstructions,
    boardOrganizationId,
    // includes
    memberships = [],
    certificationCenterMemberships = [],
    pixRoles = [],
    pixScore,
    scorecards = [],
    campaignParticipations = [],
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email ? _.toLower(email) : null;
    this.password = password;
    this.cgu = cgu;
    this.pixOrgaTermsOfServiceAccepted = pixOrgaTermsOfServiceAccepted;
    this.pixCertifTermsOfServiceAccepted = pixCertifTermsOfServiceAccepted;
    this.samlId = samlId;
    this.isProfileV2 = isProfileV2;
    this.hasSeenAssessmentInstructions = hasSeenAssessmentInstructions;
    this.boardOrganizationId = boardOrganizationId;
    this.knowledgeElements = knowledgeElements;
    // includes
    this.pixRoles = pixRoles;
    this.pixScore = pixScore;
    this.memberships = memberships;
    this.certificationCenterMemberships = certificationCenterMemberships;
    this.scorecards = scorecards;
    this.campaignParticipations = campaignParticipations;
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
