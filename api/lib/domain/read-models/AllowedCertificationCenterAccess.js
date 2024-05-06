import { config } from '../../config.js';
const { features } = config;
class AllowedCertificationCenterAccess {
  constructor({
    id,
    name,
    externalId,
    type,
    isRelatedToManagingStudentsOrganization,
    relatedOrganizationTags,
    habilitations,
    isV3Pilot,
    isComplementaryAlonePilot,
  }) {
    this.id = id;
    this.name = name;
    this.externalId = externalId;
    this.type = type;
    this.isRelatedToManagingStudentsOrganization = isRelatedToManagingStudentsOrganization;
    this.relatedOrganizationTags = relatedOrganizationTags;
    this.habilitations = habilitations;
    this.isV3Pilot = isV3Pilot;
    this.isComplementaryAlonePilot = isComplementaryAlonePilot;
  }

  isAccessBlockedCollege() {
    return (
      this.isCollege() &&
      !this.isLycee() &&
      !this.isInWhitelist() &&
      new Date() < new Date(features.pixCertifScoBlockedAccessDateCollege)
    );
  }

  isAccessBlockedLycee() {
    return (
      this.isLycee() && !this.isInWhitelist() && new Date() < new Date(features.pixCertifScoBlockedAccessDateLycee)
    );
  }

  isAccessBlockedAEFE() {
    return this.isAEFE() && !this.isInWhitelist() && new Date() < new Date(features.pixCertifScoBlockedAccessDateLycee);
  }

  isAccessBlockedAgri() {
    return this.isAgri() && !this.isInWhitelist() && new Date() < new Date(features.pixCertifScoBlockedAccessDateLycee);
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
    return features.pixCertifScoBlockedAccessWhitelist.includes(this.externalId.toUpperCase());
  }

  get pixCertifScoBlockedAccessDateLycee() {
    return features.pixCertifScoBlockedAccessDateLycee ?? null;
  }

  get pixCertifScoBlockedAccessDateCollege() {
    return features.pixCertifScoBlockedAccessDateCollege ?? null;
  }
}

export { AllowedCertificationCenterAccess };
