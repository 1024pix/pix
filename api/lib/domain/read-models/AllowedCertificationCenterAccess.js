const { features } = require('../../config');

class AllowedCertificationCenterAccess {

  constructor({
    id,
    name,
    externalId,
    type,
    isRelatedToManagingStudentsOrganization,
    relatedOrganizationTags,
  }) {
    this.id = id;
    this.name = name;
    this.externalId = externalId;
    this.type = type;
    this.isRelatedToManagingStudentsOrganization = isRelatedToManagingStudentsOrganization;
    this.relatedOrganizationTags = relatedOrganizationTags;
  }

  isAccessBlockedCollege() {
    return this.isCollege()
      && !this.isLycee()
      && !this.isInWhitelist()
      && new Date() < new Date(features.pixCertifScoBlockedAccessDateCollege);
  }

  isAccessBlockedLycee() {
    return this.isLycee()
      && !this.isInWhitelist()
      && new Date() < new Date(features.pixCertifScoBlockedAccessDateLycee);
  }

  hasTag(tagName) {
    return this.relatedOrganizationTags.includes(tagName);
  }

  isCollege() {
    return this.isScoManagingStudents()
      && this.hasTag('COLLEGE');
  }

  isLycee() {
    return this.isScoManagingStudents()
      && (this.hasTag('LYCEE') || this.hasTag('LYCEE PRO'));
  }

  isScoManagingStudents() {
    return this.type === 'SCO'
      && this.isRelatedToManagingStudentsOrganization;
  }

  isInWhitelist() {
    return features.pixCertifScoBlockedAccessWhitelist.includes(this.externalId.toUpperCase());
  }
}

module.exports = AllowedCertificationCenterAccess;
