class AllowedCertificationCenterAccess {
  #isInWhitelist = false;

  constructor({
    center,
    isRelatedToManagingStudentsOrganization,
    relatedOrganizationTags,
    scoBlockedAccessDateCollege,
    scoBlockedAccessDateLycee,
  }) {
    this.id = center.id;
    this.name = center.name;
    this.externalId = center.externalId;
    this.type = center.type;
    this.habilitations = center.habilitations;
    this.#isInWhitelist = !!center.isInWhitelist;
    this.isRelatedToManagingStudentsOrganization = isRelatedToManagingStudentsOrganization;
    this.relatedOrganizationTags = relatedOrganizationTags;
    this.pixCertifScoBlockedAccessDateCollege = scoBlockedAccessDateCollege;
    this.pixCertifScoBlockedAccessDateLycee = scoBlockedAccessDateLycee;
  }

  isAccessBlockedCollege() {
    return (
      this.isCollege() &&
      !this.isLycee() &&
      !this.isInWhitelist() &&
      new Date() < new Date(this.pixCertifScoBlockedAccessDateCollege)
    );
  }

  isAccessBlockedLycee() {
    return this.isLycee() && !this.isInWhitelist() && new Date() < new Date(this.pixCertifScoBlockedAccessDateLycee);
  }

  isAccessBlockedAEFE() {
    return this.isAEFE() && !this.isInWhitelist() && new Date() < new Date(this.pixCertifScoBlockedAccessDateLycee);
  }

  isAccessBlockedAgri() {
    return this.isAgri() && !this.isInWhitelist() && new Date() < new Date(this.pixCertifScoBlockedAccessDateLycee);
  }

  hasTag(tagName) {
    return this.relatedOrganizationTags.includes(tagName);
  }

  isCollege() {
    return this.isScoManagingStudents() && this.hasTag('COLLEGE');
  }

  isLycee() {
    return this.isScoManagingStudents() && (this.hasTag('LYCEE') || this.hasTag('LYCEE PRO'));
  }

  isAEFE() {
    return this.hasTag('AEFE');
  }

  isAgri() {
    return this.isScoManagingStudents() && this.hasTag('AGRICULTURE');
  }

  isScoManagingStudents() {
    return this.type === 'SCO' && this.isRelatedToManagingStudentsOrganization;
  }

  isInWhitelist() {
    return this.#isInWhitelist;
  }
}

export { AllowedCertificationCenterAccess };
